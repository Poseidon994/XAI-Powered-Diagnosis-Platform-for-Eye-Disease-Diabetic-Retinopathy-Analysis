"""
inference/predict.py  (v10 + XAI)
----------------------------------
Grad-CAM uses torch.autograd.grad on the captured activation (more reliable
than register_full_backward_hook across PyTorch versions).
LIME and SHAP return both their base64 image AND the raw object/values so
that summarise_lime/summarise_shap can build AI prompt context.
"""

import os
import base64
import time
from typing import Optional

import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.transforms as T

from preprocessing.image_loader import preprocess_bytes, IMG_SIZE
import inference.model_loader as loader
from inference.explain import generate_lime, generate_shap, generate_ai_reports

MEAN = [0.485, 0.456, 0.406]
STD  = [0.229, 0.224, 0.225]

_TTA_TRANSFORMS = [
    T.Compose([T.ToPILImage(), T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor(), T.Normalize(MEAN, STD)]),
    T.Compose([T.ToPILImage(), T.RandomHorizontalFlip(p=1.0), T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor(), T.Normalize(MEAN, STD)]),
    T.Compose([T.ToPILImage(), T.RandomVerticalFlip(p=1.0),   T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor(), T.Normalize(MEAN, STD)]),
    T.Compose([T.ToPILImage(), T.RandomRotation((90, 90)),     T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor(), T.Normalize(MEAN, STD)]),
    T.Compose([T.ToPILImage(), T.RandomRotation((270, 270)),   T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor(), T.Normalize(MEAN, STD)]),
    T.Compose([T.ToPILImage(), T.ColorJitter(brightness=0.15), T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor(), T.Normalize(MEAN, STD)]),
    T.Compose([T.ToPILImage(), T.ColorJitter(contrast=0.15),   T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor(), T.Normalize(MEAN, STD)]),
    T.Compose([T.ToPILImage(), T.CenterCrop(int(IMG_SIZE*0.95)), T.Resize((IMG_SIZE, IMG_SIZE)), T.ToTensor(), T.Normalize(MEAN, STD)]),
]

BINARY_LABEL_MAP = {0: "No Diabetic Retinopathy (No DR)", 1: "Diabetic Retinopathy Detected (DR)"}
MULTI_LABEL_MAP  = {0: "No DR (NDR)", 1: "Mild-to-Moderate DR (MDR)", 2: "Proliferative DR (PDR) — Severe"}
STAGE_GUESS      = {0: 0, 1: 2, 2: 4}


# ── Feature extraction ────────────────────────────────────────────────────────

@torch.no_grad()
def _extract_single_view(model, name, tensor):
    tensor = tensor.unsqueeze(0).to(loader.DEVICE)
    try:
        f = (nn.functional.adaptive_avg_pool2d(model.features(tensor), (1,1)).view(1,-1)
             if name == "densenet121" else model(tensor))
    except RuntimeError:
        model.cpu(); tensor = tensor.cpu()
        f = (nn.functional.adaptive_avg_pool2d(model.features(tensor), (1,1)).view(1,-1)
             if name == "densenet121" else model(tensor))
        model.to(loader.DEVICE)
    return f.cpu().float().numpy().ravel()


def _extract_with_tta(rgb_img, seed=42):
    torch.manual_seed(seed)
    feats = []
    for bname, model in loader.finetuned_models.items():
        views = []
        for tfm in _TTA_TRANSFORMS:
            fv = _extract_single_view(model, bname, tfm(rgb_img))
            views.append(fv / (np.linalg.norm(fv) + 1e-8))
        feats.append(np.mean(views, axis=0))
    return np.concatenate(feats).reshape(1,-1).astype(np.float32)


# ── Grad-CAM (fixed: uses torch.autograd.grad on captured activation) ─────────

def _get_gradcam_layer(model, name):
    """
    Dynamically find the last Conv2d-containing module — works regardless
    of how build_backbone restructured the model.
    """
    # Architecture-specific hints (tried first)
    try:
        hints = {
            "resnet18":        lambda m: m.layer4[-1],
            "densenet121":     lambda m: m.features.denseblock4,
            "googlenet":       lambda m: m.inception5b,
        }
        if name in hints:
            return hints[name](model)
    except (AttributeError, IndexError, TypeError):
        pass

    # Generic fallback: walk all named modules, return the last one
    # that itself contains a Conv2d (i.e. a block-level module, not a leaf)
    last_block = None
    for module_name, module in model.named_modules():
        # Skip root and pure activation/norm leaves
        if module is model:
            continue
        has_conv = any(isinstance(c, torch.nn.Conv2d) for c in module.modules())
        if has_conv:
            last_block = module

    if last_block is not None:
        print(f"[gradcam] Using dynamic layer for {name}: {type(last_block).__name__}")
    else:
        print(f"[gradcam] No suitable layer found for {name}.")
    return last_block

def generate_gradcam(rgb_img: np.ndarray) -> Optional[str]:
    preferred = ["efficientnet_b4", "resnet18", "densenet121", "googlenet", "convnext_tiny"]
    bname = next((b for b in preferred if b in loader.finetuned_models),
                 next(iter(loader.finetuned_models), None))
    if not bname:
        print("[gradcam] No backbone available.")
        return None

    model = loader.finetuned_models[bname]
    layer = _get_gradcam_layer(model, bname)
    if layer is None:
        print(f"[gradcam] Cannot resolve target layer for {bname}.")
        return None

    activation_ref = [None]

    def fwd_hook(m, inp, out):
        activation_ref[0] = out
        out.retain_grad()   # ← key: keep grad for this non-leaf tensor

    handle = layer.register_forward_hook(fwd_hook)

    try:
        model.eval()
        tensor = _TTA_TRANSFORMS[0](rgb_img).unsqueeze(0).to(loader.DEVICE)
        model.zero_grad()

        with torch.enable_grad():
            if bname == "densenet121":
                output = nn.functional.adaptive_avg_pool2d(
                    model.features(tensor), (1, 1)
                ).view(1, -1)
            else:
                output = model(tensor)
            output.sum().backward()

    except Exception as e:
        print(f"[gradcam] Forward/backward error: {e}")
        return None
    finally:
        handle.remove()

    act = activation_ref[0]
    if act is None or act.grad is None:
        print(f"[gradcam] act={act is not None}, act.grad={act.grad is not None if act is not None else 'N/A'}")
        return None

    weights = act.grad.detach().squeeze(0).mean(dim=(1, 2))   # (C,)
    act_sq  = act.detach().squeeze(0)                          # (C, H', W')

    cam = torch.relu((weights[:, None, None] * act_sq).sum(0)).cpu().numpy()

    lo, hi = cam.min(), cam.max()
    if hi - lo < 1e-8:
        print("[gradcam] Uniform activation map.")
        return None
    cam = (cam - lo) / (hi - lo)

    h, w   = rgb_img.shape[:2]
    cam_up = cv2.resize(cam, (w, h), interpolation=cv2.INTER_LINEAR)
    hmap   = cv2.cvtColor(
        cv2.applyColorMap(np.uint8(255 * cam_up), cv2.COLORMAP_JET),
        cv2.COLOR_BGR2RGB,
    )
    overlay = cv2.addWeighted(rgb_img, 0.55, hmap, 0.45, 0)
    ok, buf = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    return base64.b64encode(buf).decode("utf-8") if ok else None

# ── Main inference ─────────────────────────────────────────────────────────────

def predict(image_bytes: bytes, patient_id: str = "PATIENT") -> dict:
    t0 = time.perf_counter()

    # 1. Preprocess
    rgb_img = preprocess_bytes(image_bytes)

    # 2. Feature extraction
    X = _extract_with_tta(rgb_img)

    # 3. Binary prediction
    X_scaled     = loader.scaler.transform(X)
    X_bin        = loader.pca_binary.transform(X_scaled)
    dr_proba     = float(loader.binary_ensemble.predict_proba(X_bin)[0, 1])
    binary_label = 1 if dr_proba >= loader.meta["opt_thresh"] else 0
    dr_confidence = dr_proba * 100 if binary_label == 1 else (1.0 - dr_proba) * 100

    # 4. Cascade level-2
    multiclass_label = 0
    if binary_label == 1:
        X_mul = loader.pca_multi.transform(X_scaled)
        multiclass_label = int(loader.level2_estimator.predict(X_mul)[0])
    stage = STAGE_GUESS[multiclass_label]

    # 5. Grad-CAM
    print("[predict] Grad-CAM…")
    gradcam_b64 = generate_gradcam(rgb_img)
    print(f"[predict] Grad-CAM: {'ok' if gradcam_b64 else 'None'}")

    # 6. LIME — returns (base64, explanation_object)
    print("[predict] LIME…")
    lime_b64, lime_expl = generate_lime(
        rgb_img, binary_label,
        num_samples=int(os.getenv("LIME_SAMPLES", "50")),
    )
    print(f"[predict] LIME: {'ok' if lime_b64 else 'None'}")

    # 7. SHAP — returns (base64, shap_values_array)
    print("[predict] SHAP…")
    shap_b64, shap_vals = generate_shap(X_bin, binary_label)
    print(f"[predict] SHAP: {'ok' if shap_b64 else 'None'}")

    # 8. Groq dual reports (clinical + patient) with LIME/SHAP context
    print("[predict] Groq AI reports…")
    ai_reports = generate_ai_reports(
        patient_id=patient_id,
        binary_label=binary_label,
        multiclass_label=multiclass_label,
        stage_guess=stage,
        dr_confidence=round(dr_confidence, 2),
        lime_expl=lime_expl,
        shap_values=shap_vals,
    )
    print(f"[predict] Clinical report: {'ok' if ai_reports['clinical_report'] else 'None'}")
    print(f"[predict] Patient report:  {'ok' if ai_reports['patient_report']  else 'None'}")

    elapsed_ms = int((time.perf_counter() - t0) * 1000)
    print(f"[predict] Total: {elapsed_ms} ms")

    return {
        "patient_id":            patient_id,
        "binary_label":          binary_label,
        "binary_prediction":     BINARY_LABEL_MAP[binary_label],
        "dr_confidence":         round(dr_confidence, 2),
        "multiclass_label":      multiclass_label,
        "multiclass_prediction": MULTI_LABEL_MAP[multiclass_label],
        "stage_guess":           stage,
        "gradcam_base64":        gradcam_b64,
        "lime_base64":           lime_b64,
        "shap_base64":           shap_b64,
        "clinical_report":       ai_reports["clinical_report"],
        "patient_report":        ai_reports["patient_report"],
        "processing_time_ms":    elapsed_ms,
    }
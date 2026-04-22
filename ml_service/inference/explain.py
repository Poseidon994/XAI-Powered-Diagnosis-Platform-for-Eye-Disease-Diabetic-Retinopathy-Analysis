# """
# inference/explain.py
# --------------------
# LIME, SHAP, and dual Groq AI reports (clinical + patient) mirroring the
# notebook v10 implementation.

# Environment variables
# ---------------------
#   GROQ_API_KEY   required for generate_ai_reports()
#   LIME_SAMPLES   LIME perturbation count (default 50)
#   ENABLE_LIME    "false" to skip (default "true")
#   ENABLE_SHAP    "false" to skip (default "true")
# """

# import base64
# import io
# import os
# from typing import Optional, Tuple

# import numpy as np
# import torch
# import torch.nn as nn
# import torchvision.transforms as T

# import matplotlib
# matplotlib.use("Agg")
# import matplotlib.pyplot as plt
# import matplotlib.patches as mpatches

# from preprocessing.image_loader import IMG_SIZE
# import inference.model_loader as loader

# MEAN = [0.485, 0.456, 0.406]
# STD  = [0.229, 0.224, 0.225]
# LIME_DEVICE = torch.device("cpu")

# # ── Colour constants for dark-bg matplotlib plots ─────────────────────────────
# _BG    = "#080d18"
# _CARD  = "#101828"
# _DIM   = "#94a3b8"
# _SAGE  = "#6ee7b7"
# _ROSE  = "#fb7185"

# # ── Label maps (mirrors notebook) ─────────────────────────────────────────────
# BINARY_LABEL_MAP = {
#     0: "No Diabetic Retinopathy (No DR)",
#     1: "Diabetic Retinopathy Detected (DR)",
# }
# MULTI_LABEL_MAP = {
#     0: "No DR (NDR)",
#     1: "Mild-to-Moderate DR (MDR)",
#     2: "Proliferative DR (PDR) — Severe",
# }
# STAGE5_MAP = {
#     0: "Stage 0 — No DR",
#     1: "Stage 1 — Mild NPDR",
#     2: "Stage 2 — Moderate NPDR",
#     3: "Stage 3 — Severe NPDR",
#     4: "Stage 4 — Proliferative DR (PDR)",
# }


# # ── LIME summary (mirrors notebook summarise_lime) ────────────────────────────

# def summarise_lime(expl, n_features: int = 5) -> str:
#     """Extract top superpixel weights from a LIME explanation object."""
#     if expl is None:
#         return "LIME explanation not available for this sample."
#     try:
#         top_label = expl.top_labels[0]
#         weights   = expl.local_exp[top_label][:n_features]
#         positive  = [(i, w) for i, w in weights if w > 0]
#         negative  = [(i, w) for i, w in weights if w < 0]
#         return (
#             f"{len(positive)} image region(s) strongly supported the DR diagnosis "
#             f"(positive LIME weights); {len(negative)} region(s) argued against it."
#         )
#     except Exception:
#         return "LIME summary could not be computed."


# # ── SHAP summary (mirrors notebook summarise_shap) ────────────────────────────

# def summarise_shap(shap_values, binary_label: int, top_n: int = 5) -> str:
#     """Return top-N most influential principal components."""
#     if shap_values is None:
#         return "SHAP analysis not available for this sample."
#     try:
#         if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
#             sv = shap_values[0, :, binary_label]
#         elif isinstance(shap_values, list):
#             sv = np.array(shap_values[binary_label][0]).ravel()
#         else:
#             sv = np.array(shap_values[0]).ravel()

#         top_idx = np.argsort(np.abs(sv))[::-1][:top_n]
#         top_pcs = [(f"PC{int(idx)+1}", round(float(sv[idx]), 4)) for idx in top_idx]
#         return str(top_pcs)
#     except Exception:
#         return "SHAP summary could not be computed."


# # ── LIME ──────────────────────────────────────────────────────────────────────

# def _lime_predict_fn(images: np.ndarray) -> np.ndarray:
#     tfm = T.Compose([
#         T.ToPILImage(), T.Resize((IMG_SIZE, IMG_SIZE)),
#         T.ToTensor(), T.Normalize(MEAN, STD),
#     ])
#     probs = []
#     for img in images:
#         if img.dtype != np.uint8:
#             img = np.clip(img * 255, 0, 255).astype(np.uint8)
#         backbone_feats = []
#         for bname, model in loader.finetuned_models.items():
#             orig_dev = next(model.parameters()).device
#             model.to(LIME_DEVICE).eval()
#             with torch.no_grad():
#                 t = tfm(img).unsqueeze(0).to(LIME_DEVICE)
#                 f = (nn.functional.adaptive_avg_pool2d(model.features(t), (1,1)).view(1,-1)
#                      if bname == "densenet121" else model(t))
#             fv = f.cpu().float().numpy().ravel()
#             backbone_feats.append(fv / (np.linalg.norm(fv) + 1e-8))
#             model.to(orig_dev)
#         X     = np.concatenate(backbone_feats).reshape(1,-1).astype(np.float32)
#         X_bin = loader.pca_binary.transform(loader.scaler.transform(X))
#         probs.append(loader.binary_ensemble.predict_proba(X_bin)[0])
#     return np.array(probs)


# def generate_lime(
#     rgb_img: np.ndarray,
#     binary_label: int,
#     num_samples: int = 50,
# ) -> Tuple[Optional[str], object]:
#     """
#     Returns (base64_png, lime_explanation_object).
#     lime_explanation_object is passed to summarise_lime() for AI prompts.
#     """
#     if os.getenv("ENABLE_LIME", "true").lower() == "false":
#         return None, None
#     try:
#         from lime import lime_image
#         from skimage.segmentation import mark_boundaries

#         explainer   = lime_image.LimeImageExplainer(random_state=42)
#         explanation = explainer.explain_instance(
#             rgb_img, _lime_predict_fn,
#             top_labels=2, hide_color=0,
#             num_samples=num_samples, batch_size=8,
#         )

#         temp, mask = explanation.get_image_and_mask(
#             binary_label, positive_only=False, num_features=10, hide_rest=False,
#         )
#         temp_f  = temp.astype(np.float32) / 255.0 if temp.max() > 1 else temp.astype(np.float32)
#         bounded = mark_boundaries(temp_f, mask, color=(0.43, 0.91, 0.72))

#         fig, axes = plt.subplots(1, 2, figsize=(10, 4.5))
#         fig.patch.set_facecolor(_BG)
#         axes[0].imshow(rgb_img); axes[0].set_title("Original Fundus", color="white", fontsize=11, pad=10); axes[0].axis("off")
#         axes[1].imshow(bounded)
#         axes[1].set_title(f'LIME — {"DR" if binary_label else "No DR"} regions', color="white", fontsize=11, pad=10)
#         axes[1].axis("off")
#         pp = mpatches.Patch(color=_SAGE, label="Supports prediction")
#         np_ = mpatches.Patch(color=_ROSE, label="Opposes prediction")
#         axes[1].legend(handles=[pp, np_], loc="lower right", fontsize=8, facecolor=_CARD, edgecolor="#243352", labelcolor="white")
#         plt.tight_layout(pad=0.8)

#         buf = io.BytesIO()
#         plt.savefig(buf, format="png", dpi=110, bbox_inches="tight", facecolor=_BG, edgecolor="none")
#         plt.close(fig); buf.seek(0)
#         return base64.b64encode(buf.read()).decode("utf-8"), explanation

#     except Exception as e:
#         print(f"[lime] Error: {e}")
#         return None, None


# # ── SHAP ──────────────────────────────────────────────────────────────────────

# def generate_shap(
#     X_bin: np.ndarray,
#     binary_label: int,
# ) -> Tuple[Optional[str], object]:
#     """
#     Returns (base64_png, raw_shap_values).
#     raw_shap_values is passed to summarise_shap() for AI prompts.
#     """
#     if os.getenv("ENABLE_SHAP", "true").lower() == "false":
#         return None, None
#     try:
#         import shap

#         background  = np.zeros((1, X_bin.shape[1]))
#         explainer   = shap.KernelExplainer(
#             lambda x: loader.binary_ensemble.predict_proba(x),
#             background, silent=True,
#         )
#         shap_values = explainer.shap_values(X_bin, nsamples=50, silent=True)

#         # Handle both SHAP API versions
#         if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
#             sv = shap_values[0, :, binary_label]
#         elif isinstance(shap_values, list):
#             sv = shap_values[binary_label][0]
#         else:
#             sv = shap_values[0]

#         top_n   = min(15, len(sv))
#         top_idx = np.argsort(np.abs(sv))[-top_n:][::-1]
#         top_sv  = sv[top_idx]
#         labels  = [f"PC {i+1}" for i in top_idx]
#         colors  = [_SAGE if v >= 0 else _ROSE for v in top_sv]

#         fig, ax = plt.subplots(figsize=(9, 5))
#         fig.patch.set_facecolor(_BG); ax.set_facecolor(_CARD)
#         ax.barh(range(len(labels)), top_sv, color=colors, alpha=0.85, height=0.55)
#         ax.set_yticks(range(len(labels))); ax.set_yticklabels(labels, color=_DIM, fontsize=9)
#         ax.set_xlabel("SHAP value  (positive → supports prediction)", color=_DIM, fontsize=9)
#         ax.set_title(f'SHAP — PCA feature contributions · Class: {"DR" if binary_label else "No DR"}',
#                      color="white", fontsize=11, pad=12)
#         ax.axvline(0, color="#243352", linewidth=1.0)
#         for sp in ax.spines.values(): sp.set_edgecolor("#1a2540")
#         ax.tick_params(colors=_DIM, length=3)
#         for i, v in enumerate(top_sv):
#             ax.text(v + (5e-4 if v >= 0 else -5e-4), i, f"{v:.4f}", va="center",
#                     ha="left" if v >= 0 else "right", color=_DIM, fontsize=7.5)
#         plt.tight_layout(pad=0.8)

#         buf = io.BytesIO()
#         plt.savefig(buf, format="png", dpi=110, bbox_inches="tight", facecolor=_BG, edgecolor="none")
#         plt.close(fig); buf.seek(0)
#         return base64.b64encode(buf.read()).decode("utf-8"), shap_values

#     except Exception as e:
#         print(f"[shap] Error: {e}")
#         return None, None


# # ── Groq dual-report (clinical + patient) ─────────────────────────────────────

# # Mirrors notebook CLINICAL_PROMPT
# _CLINICAL_PROMPT = """
# You are an expert ophthalmologist AI assistant. A deep-learning hybrid pipeline
# (EfficientNet-B4 + ResNet-18 + GoogLeNet + DenseNet-121 with SVM classifier)
# has analysed a fundus photograph and produced the following results.

# --- DIAGNOSTIC FINDINGS ---
# Patient ID       : {patient_id}
# Binary Result    : {binary_result}
# Multiclass Grade : {multi_result}
# Original Stage   : {stage_label}
# Model Confidence : {confidence:.1f}%

# --- XAI ANALYSIS ---
# LIME Explanation : {lime_summary}
# SHAP Top Features: {shap_summary}
# Grad-CAM Note    : Heat-map saliency was highest over the optic disc and
#                    peripheral retinal regions, consistent with neovascular
#                    and haemorrhagic lesion patterns at this grade.

# --- TASK ---
# Write a detailed Clinical Report in formal medical language for a
# consulting ophthalmologist. Your report must include:

# 1. Diagnosis & Severity: State the DR grade with reference to the ETDRS /
#    International Clinical DR Severity Scale. Distinguish NPDR and PDR where applicable.
# 2. Observed Biomarkers: Describe retinal features XAI evidence (Grad-CAM, LIME, SHAP)
#    suggests were most influential — microaneurysms, haemorrhages, hard exudates,
#    neovascularisation, vitreous traction.
# 3. Risk Stratification: Comment on risk of vision-threatening complications
#    (DME, vitreous haemorrhage, tractional retinal detachment).
# 4. Recommended Management:
#    - Immediate vs routine referral urgency
#    - Investigations (OCT, FFA, HbA1c, blood pressure review)
#    - Treatment options (observation, laser photocoagulation PRP,
#      anti-VEGF injections, vitreoretinal surgery)
#    - Systemic optimisation (glycaemic control, hypertension, dyslipidaemia)
# 5. Follow-up Schedule: Recommend a monitoring interval.

# Maintain a formal, precise, evidence-based tone throughout.
# """.strip()

# # Mirrors notebook PATIENT_PROMPT
# _PATIENT_PROMPT = """
# You are a kind and empathetic healthcare assistant helping a patient understand
# their eye scan results in plain, friendly language.

# --- SCAN RESULTS ---
# Patient ID       : {patient_id}
# What we found    : {binary_result}
# How serious      : {multi_result}
# Model Confidence : {confidence:.1f}%

# --- TASK ---
# Write a warm, compassionate explanation of these results for the patient.
# Avoid medical jargon. Use simple, reassuring language. Your explanation must:

# 1. What the scan found: Explain in simple terms what diabetic retinopathy is
#    and what the result means, without causing unnecessary alarm.
# 2. What this means for their eyes: Describe in everyday language how this
#    condition may be affecting (or could affect) their vision.
# 3. What the AI noticed: Briefly explain in non-technical terms what the AI
#    looked at in the scan (e.g., small blood vessel changes, tiny spots).
# 4. Next steps — what should I do?: Give 3-5 clear, actionable steps
#    (see a doctor, blood sugar management, eye check schedule).
# 5. Encouragement: End with a warm, positive message about early detection.

# Keep the tone like a caring nurse or GP speaking directly to the patient.
# Use short paragraphs for readability.
# """.strip()


# def generate_ai_reports(
#     patient_id: str,
#     binary_label: int,
#     multiclass_label: int,
#     stage_guess: int,
#     dr_confidence: float,
#     lime_expl=None,
#     shap_values=None,
# ) -> dict:
#     """
#     Generate both clinical and patient-friendly reports via Groq (LLaMA-3).
#     Mirrors notebook generate_ai_report() with dual prompt approach.

#     Returns
#     -------
#     dict with keys: "clinical_report", "patient_report" (both str | None)
#     """
#     api_key = os.getenv("GROQ_API_KEY")
#     if not api_key:
#         print("[groq] GROQ_API_KEY not set — skipping reports.")
#         return {"clinical_report": None, "patient_report": None}

#     binary_result = BINARY_LABEL_MAP[binary_label]
#     multi_result  = MULTI_LABEL_MAP[multiclass_label]
#     stage_label   = STAGE5_MAP.get(stage_guess, f"Stage {stage_guess}")
#     lime_summary  = summarise_lime(lime_expl)
#     shap_summary  = summarise_shap(shap_values, binary_label)

#     fmt = dict(
#         patient_id=patient_id,
#         binary_result=binary_result,
#         multi_result=multi_result,
#         stage_label=stage_label,
#         confidence=dr_confidence,
#         lime_summary=lime_summary,
#         shap_summary=shap_summary,
#     )

#     print(f"[groq] Generating reports — {binary_result} | {multi_result} | {dr_confidence:.1f}%")

#     def _call(prompt: str) -> Optional[str]:
#         try:
#             from groq import Groq
#             client = Groq(api_key=api_key)
#             resp   = client.chat.completions.create(
#                 model="llama-3.3-70b-versatile",
#                 messages=[{"role": "user", "content": prompt}],
#                 max_tokens=800,
#                 temperature=0.3,
#             )
#             return resp.choices[0].message.content.strip()
#         except Exception as e:
#             print(f"[groq] API error: {e}")
#             return None

#     clinical = _call(_CLINICAL_PROMPT.format(**fmt))
#     patient  = _call(_PATIENT_PROMPT.format(**fmt))

#     return {"clinical_report": clinical, "patient_report": patient}
"""
inference/explain.py
---------------------
LIME, SHAP, and dual Groq AI explanations (clinical + patient-friendly).
All functions are best-effort — return None on failure.

Environment variables
---------------------
  GROQ_API_KEY   required for AI explanation functions
  LIME_SAMPLES   perturbation samples (default 50)
  ENABLE_LIME    "false" to skip
  ENABLE_SHAP    "false" to skip
"""

import base64
import io
import os
from typing import Optional

import cv2
import numpy as np
import torch
import torch.nn as nn
import torchvision.transforms as T

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

from preprocessing.image_loader import IMG_SIZE
import inference.model_loader as loader

MEAN = [0.485, 0.456, 0.406]
STD  = [0.229, 0.224, 0.225]
LIME_DEVICE = torch.device("cpu")

_DARK_BG  = "#0d0b15"
_CARD_BG  = "#1a1528"
_TEXT_DIM = "#c0aad8"
_PRIMARY  = "#f472b6"
_RED      = "#f87171"


# ── LIME ──────────────────────────────────────────────────────────────────────

def _lime_predict_fn(images: np.ndarray) -> np.ndarray:
    tfm = T.Compose([
        T.ToPILImage(), T.Resize((IMG_SIZE, IMG_SIZE)),
        T.ToTensor(), T.Normalize(MEAN, STD),
    ])
    probs = []
    for img in images:
        if img.dtype != np.uint8:
            img = np.clip(img * 255, 0, 255).astype(np.uint8)
        backbone_feats = []
        for bname, model in loader.finetuned_models.items():
            orig_device = next(model.parameters()).device
            model.to(LIME_DEVICE).eval()
            with torch.no_grad():
                t = tfm(img).unsqueeze(0).to(LIME_DEVICE)
                f = (nn.functional.adaptive_avg_pool2d(model.features(t), (1,1)).view(1,-1)
                     if bname == "densenet121" else model(t))
            fv = f.cpu().float().numpy().ravel()
            backbone_feats.append(fv / (np.linalg.norm(fv) + 1e-8))
            model.to(orig_device)
        X     = np.concatenate(backbone_feats).reshape(1,-1).astype(np.float32)
        X_bin = loader.pca_binary.transform(loader.scaler.transform(X))
        probs.append(loader.binary_ensemble.predict_proba(X_bin)[0])
    return np.array(probs)


def generate_lime(rgb_img: np.ndarray, binary_label: int, num_samples: int = 50) -> Optional[str]:
    if os.getenv("ENABLE_LIME","true").lower() == "false":
        return None
    try:
        from lime import lime_image
        from skimage.segmentation import mark_boundaries

        explainer   = lime_image.LimeImageExplainer(random_state=42)
        explanation = explainer.explain_instance(
            rgb_img, _lime_predict_fn, top_labels=2,
            hide_color=0, num_samples=num_samples, batch_size=8,
        )
        temp, mask = explanation.get_image_and_mask(
            binary_label, positive_only=False, num_features=10, hide_rest=False,
        )
        temp_f  = temp.astype(np.float32)/255.0 if temp.max()>1 else temp.astype(np.float32)
        bounded = mark_boundaries(temp_f, mask, color=(0.957, 0.443, 0.714))

        fig, axes = plt.subplots(1, 2, figsize=(10, 4.5))
        fig.patch.set_facecolor(_DARK_BG)
        axes[0].imshow(rgb_img)
        axes[0].set_title("Original Fundus", color="white", fontsize=11, pad=10)
        axes[0].axis("off")
        axes[1].imshow(bounded)
        axes[1].set_title(
            f'LIME — {"DR" if binary_label else "No DR"} supporting regions',
            color="white", fontsize=11, pad=10,
        )
        axes[1].axis("off")
        pos_p = mpatches.Patch(color=_PRIMARY, label="Supports prediction")
        neg_p = mpatches.Patch(color=_RED,     label="Opposes prediction")
        axes[1].legend(handles=[pos_p, neg_p], loc="lower right", fontsize=8,
                       facecolor=_CARD_BG, edgecolor="#3e2f5c", labelcolor="white")
        plt.tight_layout(pad=0.8)

        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=110, bbox_inches="tight",
                    facecolor=_DARK_BG, edgecolor="none")
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")
    except Exception as e:
        print(f"[lime] Error: {e}")
        return None


# ── SHAP ──────────────────────────────────────────────────────────────────────

def generate_shap(X_bin: np.ndarray, binary_label: int) -> Optional[str]:
    if os.getenv("ENABLE_SHAP","true").lower() == "false":
        return None
    try:
        import shap

        background  = np.zeros((1, X_bin.shape[1]))
        explainer   = shap.KernelExplainer(
            lambda x: loader.binary_ensemble.predict_proba(x), background, silent=True,
        )
        shap_values = explainer.shap_values(X_bin, nsamples=50, silent=True)

        if isinstance(shap_values, np.ndarray) and shap_values.ndim == 3:
            sv = shap_values[0, :, binary_label]
        elif isinstance(shap_values, list):
            sv = shap_values[binary_label][0]
        else:
            sv = shap_values[0]

        top_n   = min(15, len(sv))
        top_idx = np.argsort(np.abs(sv))[-top_n:][::-1]
        top_sv  = sv[top_idx]
        labels  = [f"PC {i+1}" for i in top_idx]
        colors  = [_PRIMARY if v >= 0 else _RED for v in top_sv]

        fig, ax = plt.subplots(figsize=(9, 5))
        fig.patch.set_facecolor(_DARK_BG)
        ax.set_facecolor(_CARD_BG)
        ax.barh(range(len(labels)), top_sv, color=colors, alpha=0.88, height=0.55)
        ax.set_yticks(range(len(labels)))
        ax.set_yticklabels(labels, color=_TEXT_DIM, fontsize=9)
        ax.set_xlabel("SHAP value  (positive = supports prediction)", color=_TEXT_DIM, fontsize=9)
        ax.set_title(
            f'SHAP — PCA feature contributions  ·  Class: {"DR" if binary_label else "No DR"}',
            color="white", fontsize=11, pad=12,
        )
        ax.axvline(0, color="#3e2f5c", linewidth=1.0)
        for spine in ax.spines.values():
            spine.set_edgecolor("#2c2040")
        ax.tick_params(colors=_TEXT_DIM, length=3)
        for i, v in enumerate(top_sv):
            ax.text(v+(0.0005 if v>=0 else -0.0005), i, f"{v:.4f}", va="center",
                    ha="left" if v>=0 else "right", color=_TEXT_DIM, fontsize=7.5)
        plt.tight_layout(pad=0.8)

        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=110, bbox_inches="tight",
                    facecolor=_DARK_BG, edgecolor="none")
        plt.close(fig)
        buf.seek(0)
        return base64.b64encode(buf.read()).decode("utf-8")
    except Exception as e:
        print(f"[shap] Error: {e}")
        return None


# ── Groq AI Explanations ──────────────────────────────────────────────────────

def _groq_call(prompt: str, max_tokens: int = 600) -> Optional[str]:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        from groq import Groq
        client   = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role":"user","content":prompt}],
            max_tokens=max_tokens,
            temperature=0.25,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[groq] API error: {e}")
        return None


def generate_ai_explanation(
    binary_prediction: str,
    multiclass_prediction: str,
    dr_confidence: float,
    stage_guess: int,
    gradcam_ok: bool,
    lime_ok: bool,
    shap_ok: bool,
) -> Optional[str]:
    """Clinical narrative — for ophthalmologists and clinicians."""
    xai = []
    if gradcam_ok: xai.append("Grad-CAM highlighted the most influential retinal regions; warm zones indicate high activation.")
    if lime_ok:    xai.append("LIME superpixel analysis identified image segments supporting (pink) or opposing (red) the classification.")
    if shap_ok:    xai.append("SHAP KernelExplainer quantified PCA-compressed CNN feature contributions to the ensemble output.")
    xai_context = " ".join(xai) or "No explainability maps were available."

    prompt = f"""You are a senior consultant ophthalmologist reviewing an automated diabetic retinopathy screening report.

AUTOMATED SCREENING RESULTS
Binary result    : {binary_prediction}
Severity grade   : {multiclass_prediction}
Model confidence : {dr_confidence:.1f}%
APTOS stage est. : {stage_guess} / 4

EXPLAINABILITY SUMMARY
{xai_context}

Write a concise clinical interpretation using EXACTLY these five labelled sections. Plain prose — no bullets or markdown:

FINDINGS
[2–3 sentences on the clinical significance of this result.]

CONFIDENCE INTERPRETATION
[1–2 sentences on what {dr_confidence:.1f}% confidence implies in this clinical context.]

EXPLAINABILITY INSIGHTS
[2–3 sentences linking the XAI outputs to retinal anatomy and known DR pathology signs.]

CLINICAL RECOMMENDATION
[2–3 sentences on appropriate next steps for the patient and referring clinician.]

DISCLAIMER
[1 sentence on AI screening limitations and the need for ophthalmologist confirmation.]

 
--- TASK ---
Write a detailed Clinical Report in formal medical language for a
consulting ophthalmologist. Your report must include:

1. Diagnosis & Severity: State the DR grade with reference to the ETDRS /
   International Clinical DR Severity Scale. Distinguish NPDR and PDR where applicable.
2. Observed Biomarkers: Describe retinal features XAI evidence (Grad-CAM, LIME, SHAP)
   suggests were most influential — microaneurysms, haemorrhages, hard exudates,
   neovascularisation, vitreous traction.
3. Risk Stratification: Comment on risk of vision-threatening complications
   (DME, vitreous haemorrhage, tractional retinal detachment).
4. Recommended Management:
   - Immediate vs routine referral urgency
   - Investigations (OCT, FFA, HbA1c, blood pressure review)
   - Treatment options (observation, laser photocoagulation PRP,
     anti-VEGF injections, vitreoretinal surgery)
   - Systemic optimisation (glycaemic control, hypertension, dyslipidaemia)
5. Follow-up Schedule: Recommend a monitoring interval.

Tone: professional, evidence-based, clinical handover document style. Maintain a formal, precise, evidence-based tone throughout.
"""

    return _groq_call(prompt)


def generate_patient_explanation(
    binary_prediction: str,
    multiclass_prediction: str,
    dr_confidence: float,
    stage_guess: int,
) -> Optional[str]:
    """Patient-friendly explanation — plain language, no jargon."""
    prompt = f"""You are a caring GP explaining the results of an automated eye scan to a patient. Avoid all medical jargon.

SCAN RESULTS (do NOT repeat these numbers verbatim in your response)
Result      : {binary_prediction}
Grade       : {multiclass_prediction}
Confidence  : {dr_confidence:.1f}%
Stage       : {stage_guess} out of 4

Write a warm, reassuring explanation using EXACTLY these four labelled sections. Plain conversational prose — no bullet points:

WHAT WE FOUND
[2–3 sentences explaining the result in plain language a patient can understand.]

WHAT THIS MEANS FOR YOU
[2–3 sentences on what this means for the patient's health and daily life.]

WHAT HAPPENS NEXT
[2–3 sentences on suggested next steps, framed positively and supportively.]

IMPORTANT NOTE
[1–2 sentences reminding the patient this is a screening tool and they should discuss with their doctor.]
--- TASK ---
Write a warm, compassionate explanation of these results for the patient.
Avoid medical jargon. Use simple, reassuring language. Your explanation must:

1. What the scan found: Explain in simple terms what diabetic retinopathy is
   and what the result means, without causing unnecessary alarm.
2. What this means for their eyes: Describe in everyday language how this
   condition may be affecting (or could affect) their vision.
3. What the AI noticed: Briefly explain in non-technical terms what the AI
   looked at in the scan (e.g., small blood vessel changes, tiny spots).
4. Next steps — what should I do?: Give 3-5 clear, actionable steps
   (see a doctor, blood sugar management, eye check schedule).
5. Encouragement: End with a warm, positive message about early detection.

Keep the tone like a caring nurse or GP speaking directly to the patient.
Use short paragraphs for readability.
Tone: warm, reassuring, supportive. Avoid frightening language. Total: 150–220 words."""

    return _groq_call(prompt, max_tokens=450)
"""
inference/model_loader.py
--------------------------
Loads every artifact produced by the v10 training notebook into module-level
singletons so they are instantiated once at service startup.

Expected layout of MODELS_DIR
------------------------------
models/
├── resnet18.pth
├── googlenet.pth
├── efficientnet_b4.pth
├── densenet121.pth
├── convnext_tiny.pth
├── scaler.pkl
├── pca_binary.pkl
├── pca_multi.pkl
├── binary_ensemble.pkl   ← VotingClassifier(SVM+RF+XGB), pre-fitted
├── gs_level2.pkl         ← GridSearchCV Pipeline; use .best_estimator_
└── meta.json             ← opt_thresh, pca component counts, img config
"""

import json
import os
from pathlib import Path
from typing import Dict

import joblib
import torch
import torch.nn as nn
import torchvision.models as models

# ── Resolve models directory ──────────────────────────────────────────────────
_HERE = Path(__file__).resolve().parent          # ml_service/inference/
MODELS_DIR = Path(os.environ.get("MODELS_DIR", _HERE.parent / "models"))

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ── Backbone registry (mirrors BACKBONE_DEFS in the notebook) ─────────────────
BACKBONE_DEFS: Dict[str, tuple] = {
    "resnet18":        (models.resnet18,       models.ResNet18_Weights.IMAGENET1K_V1,        512),
    "googlenet":       (models.googlenet,       models.GoogLeNet_Weights.IMAGENET1K_V1,       1024),
    "efficientnet_b4": (models.efficientnet_b4, models.EfficientNet_B4_Weights.IMAGENET1K_V1, 1792),
    "densenet121":     (models.densenet121,     models.DenseNet121_Weights.IMAGENET1K_V1,     1024),
    "convnext_tiny":   (models.convnext_tiny,   models.ConvNeXt_Tiny_Weights.IMAGENET1K_V1,   768),
}
BACKBONE_NAMES = list(BACKBONE_DEFS.keys())


def _build_extractor(name: str) -> nn.Module:
    """
    Instantiate backbone with ImageNet weights and strip the classifier
    head so it acts as a feature extractor.
    """
    fn, weights, _ = BACKBONE_DEFS[name]
    m = fn(weights=weights)

    if name in ("resnet18", "googlenet"):
        m.fc = nn.Identity()
    elif name in ("efficientnet_b4", "densenet121"):
        m.classifier = nn.Identity()
    elif name == "convnext_tiny":
        # ConvNeXt classifier is Sequential([LayerNorm, Flatten, Linear]);
        # replace only the final Linear so the spatial pooling is preserved.
        m.classifier[2] = nn.Identity()

    return m


# ── Module-level singletons (populated by load_all_artifacts) ────────────────
finetuned_models: Dict[str, nn.Module] = {}
scaler = None
pca_binary = None
pca_multi = None
binary_ensemble = None    # VotingClassifier — used for binary prediction
level2_estimator = None   # gs_level2.best_estimator_ — used for MDR/PDR
meta: dict = {}


def load_all_artifacts(models_dir: Path = MODELS_DIR) -> None:
    """
    Load every artifact from *models_dir* into module-level singletons.
    Call once at application startup (e.g., in FastAPI lifespan).

    Raises
    ------
    FileNotFoundError  if any required artifact is missing.
    """
    global finetuned_models, scaler, pca_binary, pca_multi
    global binary_ensemble, level2_estimator, meta

    models_dir = Path(models_dir)
    _require_dir(models_dir)

    # ── 1. CNN backbone weights ───────────────────────────────────────────────
    finetuned_models = {}
    for name in BACKBONE_NAMES:
        pth_path = models_dir / f"{name}.pth"
        _require_file(pth_path)
        backbone = _build_extractor(name)
        state = torch.load(pth_path, map_location="cpu", weights_only=True)
        backbone.load_state_dict(state)
        backbone.eval().to(DEVICE)
        finetuned_models[name] = backbone
        print(f"  ✅ backbone  {name}")

    # ── 2. Sklearn pipeline objects ───────────────────────────────────────────
    scaler          = _load_pkl(models_dir / "scaler.pkl",          "scaler")
    pca_binary      = _load_pkl(models_dir / "pca_binary.pkl",      "pca_binary")
    pca_multi       = _load_pkl(models_dir / "pca_multi.pkl",       "pca_multi")
    binary_ensemble = _load_pkl(models_dir / "binary_ensemble.pkl", "binary_ensemble")

    # gs_level2 is a GridSearchCV; we use its best_estimator_ (a Pipeline)
    # which was refit on the full X_dr_smt/y_dr_smt dataset by sklearn.
    gs_level2       = _load_pkl(models_dir / "gs_level2.pkl",       "gs_level2")
    level2_estimator = gs_level2.best_estimator_
    print("  ✅ level2_estimator  (from gs_level2.best_estimator_)")

    # ── 3. meta.json ──────────────────────────────────────────────────────────
    meta_path = models_dir / "meta.json"
    _require_file(meta_path)
    with open(meta_path) as f:
        meta = json.load(f)
    print(f"  ✅ meta.json  →  opt_thresh={meta['opt_thresh']:.4f}")

    print(f"\nAll artifacts loaded. Device: {DEVICE}")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _require_dir(p: Path) -> None:
    if not p.is_dir():
        raise FileNotFoundError(
            f"Models directory not found: {p}\n"
            "Download artifacts from Kaggle and place them in ml_service/models/."
        )


def _require_file(p: Path) -> None:
    if not p.exists():
        raise FileNotFoundError(
            f"Required artifact missing: {p}\n"
            "Re-run the Kaggle saving cell (Cell 42) and download all artifacts."
        )


def _load_pkl(path: Path, label: str):
    _require_file(path)
    obj = joblib.load(path)
    print(f"  ✅ {label}")
    return obj
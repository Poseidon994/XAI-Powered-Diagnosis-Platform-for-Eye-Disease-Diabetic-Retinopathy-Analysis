# """api/main.py — FastAPI ML service"""

# import sys
# from contextlib import asynccontextmanager
# from pathlib import Path
# from typing import Optional

# from fastapi import FastAPI, File, Form, HTTPException, UploadFile
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

# sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# import inference.model_loader as loader
# from inference.predict import predict


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     print("Loading DR model artifacts …")
#     loader.load_all_artifacts()
#     print("ML service ready.\n")
#     yield


# app = FastAPI(title="DR Screening ML Service", version="1.1.0", lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
# )


# class PredictionResponse(BaseModel):
#     patient_id:            str
#     binary_label:          int
#     binary_prediction:     str
#     dr_confidence:         float
#     multiclass_label:      int
#     multiclass_prediction: str
#     stage_guess:           int
#     gradcam_base64:        Optional[str] = None
#     lime_base64:           Optional[str] = None
#     shap_base64:           Optional[str] = None
#     clinical_report:       Optional[str] = None
#     patient_report:        Optional[str] = None
#     processing_time_ms:    int


# class HealthResponse(BaseModel):
#     status:                str
#     device:                str
#     backbones_loaded:      int
#     opt_thresh:            float
#     pca_binary_components: int
#     pca_multi_components:  int


# @app.get("/health", response_model=HealthResponse, tags=["ops"])
# async def health():
#     if not loader.finetuned_models:
#         raise HTTPException(status_code=503, detail="Artifacts not loaded yet.")
#     return HealthResponse(
#         status="ok", device=str(loader.DEVICE),
#         backbones_loaded=len(loader.finetuned_models),
#         opt_thresh=loader.meta.get("opt_thresh", -1.0),
#         pca_binary_components=loader.meta.get("pca_binary_components", -1),
#         pca_multi_components=loader.meta.get("pca_multi_components", -1),
#     )


# @app.post("/predict", response_model=PredictionResponse, tags=["inference"])
# async def predict_endpoint(
#     file: UploadFile = File(...),
#     patient_id: str  = Form(default="PATIENT"),
# ):
#     if file.content_type and not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=415, detail=f"Expected image, got {file.content_type}")
#     image_bytes = await file.read()
#     if not image_bytes:
#         raise HTTPException(status_code=400, detail="Empty file.")
#     try:
#         result = predict(image_bytes, patient_id=patient_id)
#     except ValueError as e:
#         raise HTTPException(status_code=422, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Inference error: {e}")
#     return PredictionResponse(**result)
"""api/main.py — Ocula DR ML Service"""

import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import inference.model_loader as loader
from inference.predict import predict


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Loading DR model artifacts …")
    loader.load_all_artifacts()
    print("ML service ready.\n")
    yield


app = FastAPI(
    title="Ocula DR ML Service",
    description="v10 hybrid CNN+SVM pipeline · Grad-CAM / LIME / SHAP / Groq dual-report XAI",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictionResponse(BaseModel):
    patient_id:              str
    binary_label:            int
    binary_prediction:       str
    dr_confidence:           float
    multiclass_label:        int
    multiclass_prediction:   str
    stage_guess:             int
    gradcam_base64:          Optional[str] = None
    lime_base64:             Optional[str] = None
    shap_base64:             Optional[str] = None
    ai_explanation:          Optional[str] = None   # clinical
    ai_explanation_patient:  Optional[str] = None   # patient-friendly
    processing_time_ms:      int


class HealthResponse(BaseModel):
    status:                str
    device:                str
    backbones_loaded:      int
    opt_thresh:            float
    pca_binary_components: int
    pca_multi_components:  int


@app.get("/health", response_model=HealthResponse, tags=["ops"])
async def health():
    if not loader.finetuned_models:
        raise HTTPException(status_code=503, detail="Artifacts not loaded yet.")
    return HealthResponse(
        status="ok",
        device=str(loader.DEVICE),
        backbones_loaded=len(loader.finetuned_models),
        opt_thresh=loader.meta.get("opt_thresh", -1.0),
        pca_binary_components=loader.meta.get("pca_binary_components", -1),
        pca_multi_components=loader.meta.get("pca_multi_components", -1),
    )


@app.post("/predict", response_model=PredictionResponse, tags=["inference"])
async def predict_endpoint(
    file: UploadFile = File(...),
    patient_id: str  = Form(default="PATIENT"),
):
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail=f"Expected image, got {file.content_type}")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        result = predict(image_bytes, patient_id=patient_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")

    return PredictionResponse(**result)
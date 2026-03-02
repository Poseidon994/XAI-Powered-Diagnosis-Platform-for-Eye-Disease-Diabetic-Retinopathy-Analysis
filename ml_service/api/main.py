from fastapi import FastAPI
from pydantic import BaseModel
import time

app = FastAPI(title="Diabetic Retinopathy ML Service")

CLASS_NAMES = [
    "No DR",
    "Mild",
    "Moderate",
    "Severe",
    "Proliferative"
]

class PredictionRequest(BaseModel):
    image_url: str

class ExplanationRequest(BaseModel):
    image_url: str
    method: str | None = None

@app.get("/health")
def health():
    return {"status": "ML service running"}

@app.post("/predict")
def predict(request: PredictionRequest):
    start_time = time.time()

    # MOCK OUTPUT FOR NOW
    class_index = 2
    confidence = 0.87

    inference_time = int((time.time() - start_time) * 1000)

    return {
        "prediction": {
            "label": CLASS_NAMES[class_index],
            "class_index": class_index,
            "confidence": confidence
        },
        "class_probabilities": {
            name: round(1/5, 2) for name in CLASS_NAMES
        },
        "model_version": "v1.0",
        "inference_time_ms": inference_time
    }

@app.post("/explain")
def explain(request: ExplanationRequest):
    return {
        "methods_used": ["LIME", "SHAP"],
        "heatmaps": {
            "lime": "mock_lime.png",
            "shap": "mock_shap.png"
        },
        "important_regions": [
            "Macula region",
            "Hemorrhage-dense clusters"
        ],
        "text_summary": "Model focused on lesion-dense regions near macula."
    }
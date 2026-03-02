from inference.model_loader import load_model

model, device = load_model()
print("Model loaded on:", device)
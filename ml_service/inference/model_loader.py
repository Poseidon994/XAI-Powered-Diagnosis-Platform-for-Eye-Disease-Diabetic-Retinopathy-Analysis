import torch
import torch.nn as nn
import torchvision.models as models

NUM_CLASSES = 5

def load_model(model_path: str = None):
    """
    Loads ResNet50 model configured for 5-class DR classification.
    If model_path provided, loads trained weights.
    """

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)

    # Replace final layer
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, NUM_CLASSES)

    if model_path:
        model.load_state_dict(torch.load(model_path, map_location=device))

    model = model.to(device)
    model.eval()

    return model, device
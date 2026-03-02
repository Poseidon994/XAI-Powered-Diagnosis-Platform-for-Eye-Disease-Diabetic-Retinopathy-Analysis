import os
import torch
from PIL import Image
import torchvision.transforms as transforms

# Standard ImageNet normalization (works for ResNet/EfficientNet)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Define preprocessing pipeline
transform_pipeline = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])

def load_image(image_path: str) -> torch.Tensor:
    """
    Loads and preprocesses an image for model inference.
    Returns a tensor of shape (1, 3, 224, 224)
    """

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Image not found at path: {image_path}")

    try:
        image = Image.open(image_path).convert("RGB")
    except Exception as e:
        raise ValueError(f"Error loading image: {str(e)}")

    image_tensor = transform_pipeline(image)

    # Add batch dimension
    image_tensor = image_tensor.unsqueeze(0)

    return image_tensor
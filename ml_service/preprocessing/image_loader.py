"""
preprocessing/image_loader.py
------------------------------
Exact replication of the v10 notebook preprocessing pipeline.

Chain: circular_crop → green_channel_boost → ben_graham → clahe_enhance → RGB

All constants (IMG_SIZE, sigmaX, CLAHE clip limits) are kept identical to CFG
in the training notebook so train/inference consistency is guaranteed.
"""

import cv2
import numpy as np

# ── Constants (mirror CFG in notebook) ───────────────────────────────────────
IMG_SIZE = 224


# ── Individual stages ─────────────────────────────────────────────────────────

def circular_crop(img: np.ndarray) -> np.ndarray:
    """
    Detect fundus region by thresholding on grayscale and crop to
    bounding box of the largest contour. Removes black background.
    Always resizes output to (IMG_SIZE, IMG_SIZE).
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if contours:
        c = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(c)
        img = img[y : y + h, x : x + w]
    return cv2.resize(img, (IMG_SIZE, IMG_SIZE))


def green_channel_boost(img: np.ndarray) -> np.ndarray:
    """
    v10 NEW: Amplify green channel (most informative for DR lesions).
    - CLAHE on green channel (clipLimit=3.0)
    - Attenuate red channel (0.4 × red + 0.6 × green)
    Input/output: BGR image.
    """
    b, g, r = cv2.split(img)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    g_eq = clahe.apply(g)
    r_att = cv2.addWeighted(r, 0.4, g, 0.6, 0)
    return cv2.merge([b, g_eq, r_att])


def ben_graham(img: np.ndarray, sigmaX: int = 10) -> np.ndarray:
    """
    Circle-crop resize + Gaussian-subtract normalisation.
    Boosts local lesion contrast by removing low-frequency illumination.
    """
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    blurred = cv2.GaussianBlur(img, (0, 0), sigmaX)
    return cv2.addWeighted(img, 4, blurred, -4, 128)


def clahe_enhance(img: np.ndarray) -> np.ndarray:
    """
    CLAHE on the L-channel of LAB colour space.
    Sharpens microaneurysms and haemorrhagic spots.
    clipLimit=2.0, tileGridSize=(8,8).
    """
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l_eq = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(l)
    return cv2.cvtColor(cv2.merge([l_eq, a, b]), cv2.COLOR_LAB2BGR)


# ── Full pipeline ─────────────────────────────────────────────────────────────

def _apply_pipeline(bgr_img: np.ndarray) -> np.ndarray:
    """
    Internal: apply the complete chain to a BGR numpy image.
    Returns an RGB numpy array of shape (IMG_SIZE, IMG_SIZE, 3) dtype uint8.
    """
    img = circular_crop(bgr_img)
    img = green_channel_boost(img)
    img = ben_graham(img)
    img = clahe_enhance(img)
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


def preprocess_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Decode raw image bytes (PNG / JPEG / etc.) and apply the full
    v10 preprocessing pipeline.

    Returns
    -------
    np.ndarray  shape (IMG_SIZE, IMG_SIZE, 3), dtype uint8, RGB colour order.

    Raises
    ------
    ValueError  if the bytes cannot be decoded as an image.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError(
            "Could not decode image bytes. "
            "Ensure the file is a valid PNG/JPEG/BMP/TIFF."
        )
    return _apply_pipeline(bgr)


def preprocess_path(path: str) -> np.ndarray:
    """
    Load an image from *path* and apply the full v10 preprocessing pipeline.

    Returns
    -------
    np.ndarray  shape (IMG_SIZE, IMG_SIZE, 3), dtype uint8, RGB colour order.

    Raises
    ------
    ValueError  if the file cannot be read.
    """
    bgr = cv2.imread(path)
    if bgr is None:
        raise ValueError(f"Could not read image at path: {path!r}")
    return _apply_pipeline(bgr)
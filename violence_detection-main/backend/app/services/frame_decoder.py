import base64
import cv2
import numpy as np
from typing import Optional
from app.config import settings

def decode_base64_frame(
    base64_str: str,
    frame_size: int = settings.FRAME_SIZE
) -> np.ndarray:
    """
    Decodes a base64 encoded image string (with or without data URI header),
    converts to RGB, resizes to target dimension (224x224), and normalizes to [0.0, 1.0].
    
    Returns:
        np.ndarray: shape (frame_size, frame_size, 3), dtype float32
    """
    if not base64_str:
        raise ValueError("Received empty base64 frame string.")

    # Strip data URL prefix if present (e.g. 'data:image/jpeg;base64,')
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]

    try:
        img_bytes = base64.b64decode(base64_str)
    except Exception as e:
        raise ValueError(f"Failed to decode base64 data: {str(e)}")

    # Convert bytes to numpy uint8 array
    nparr = np.frombuffer(img_bytes, np.uint8)
    
    # Decode image using OpenCV
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode image bytes into a valid visual frame.")

    # Resize to target model size
    resized = cv2.resize(frame, (frame_size, frame_size))
    
    # Convert BGR to RGB
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    
    # Normalize to [0.0, 1.0]
    normalized = rgb.astype(np.float32) / 255.0
    return normalized

def decode_binary_frame(
    img_bytes: bytes,
    frame_size: int = settings.FRAME_SIZE
) -> np.ndarray:
    """
    Decodes raw binary image bytes into a normalized (224, 224, 3) RGB frame tensor.
    """
    if not img_bytes:
        raise ValueError("Empty image bytes received.")

    nparr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Failed to parse binary image stream.")

    resized = cv2.resize(frame, (frame_size, frame_size))
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
    return rgb.astype(np.float32) / 255.0

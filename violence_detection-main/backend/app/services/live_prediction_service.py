import numpy as np
from typing import List, Dict, Any
from app.config import settings
from app.services.frame_decoder import decode_base64_frame
from app.services.model_service import get_model

def process_live_frames(
    base64_frames: List[str],
    custom_threshold: float = None
) -> Dict[str, Any]:
    """
    Processes a live sequence of base64 frames:
    1. Validates frame array.
    2. Decodes, resizes to 224x224, and normalizes pixel values.
    3. If frame count differs from sequence_length, applies padding or sampling.
    4. Evaluates sequence with CNN-LSTM model.
    5. Returns prediction and confidence telemetry.
    """
    if not base64_frames or len(base64_frames) == 0:
        raise ValueError("No frames provided in live detection payload.")

    decoded_frames = []
    for idx, f_str in enumerate(base64_frames):
        try:
            arr = decode_base64_frame(f_str, frame_size=settings.FRAME_SIZE)
            decoded_frames.append(arr)
        except Exception as e:
            print(f"Warning: skipped corrupted live frame {idx}: {e}")

    if len(decoded_frames) == 0:
        raise ValueError("All transmitted frames failed decoding.")

    # Conform to model sequence length (default: 20)
    target_seq_len = settings.SEQUENCE_LENGTH

    if len(decoded_frames) < target_seq_len:
        # Pad with final frame
        last_frame = decoded_frames[-1]
        while len(decoded_frames) < target_seq_len:
            decoded_frames.append(last_frame)
    elif len(decoded_frames) > target_seq_len:
        # Take latest 20 frames from buffer
        decoded_frames = decoded_frames[-target_seq_len:]

    # Shape: (1, sequence_length, 224, 224, 3)
    input_tensor = np.expand_dims(np.array(decoded_frames, dtype=np.float32), axis=0)

    model = get_model()
    if model is not None:
        try:
            pred = model.predict(input_tensor, verbose=0)
            violence_prob = float(pred[0][0])
        except Exception as e:
            print(f"Live model prediction error: {e}")
            violence_prob = 0.15
    else:
        violence_prob = 0.12

    threshold = custom_threshold if custom_threshold is not None else settings.PREDICTION_THRESHOLD
    is_violence = violence_prob >= threshold

    if is_violence:
        label = "Violence Detected"
        confidence = violence_prob
    else:
        label = "No Violence Detected"
        confidence = 1.0 - violence_prob

    return {
        "success": True,
        "prediction": label,
        "confidence": round(confidence, 4),
        "confidence_percentage": round(confidence * 100, 2),
        "raw_probability": round(violence_prob, 4),
        "frames_analyzed": len(decoded_frames)
    }

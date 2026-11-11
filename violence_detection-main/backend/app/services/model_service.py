import os
import sys
from pathlib import Path
from typing import Optional, Any
from app.config import settings

# Global model cache to avoid reloading weights on each request
_cached_model: Optional[Any] = None
_model_source: str = "uninitialized"

def load_violence_model():
    """
    Loads the trained CNN-LSTM violence detection model once into memory.
    If the specified .h5 model file is not present on disk, initializes a functional
    fallback model with identical architecture so the application remains robustly demonstrable.
    """
    global _cached_model, _model_source

    if _cached_model is not None:
        return _cached_model

    model_file = Path(settings.MODEL_PATH)

    if model_file.exists():
        print(f"[*] Loading trained CNN-LSTM model from disk: {model_file}")
        try:
            import tensorflow as tf
            _cached_model = tf.keras.models.load_model(str(model_file))
            _model_source = f"Loaded from {model_file}"
            print("[+] Successfully loaded trained model.")
            return _cached_model
        except Exception as e:
            print(f"[!] Warning: Failed loading model from {model_file}: {e}")

    # If model file is missing or failed to load, display clear notice and build identical architecture
    print("=" * 70)
    print("NOTICE: Trained violence_model.h5 not found at:", model_file)
    print("To train a model on your dataset, run: python ml/train.py")
    print("Or place your trained violence_model.h5 inside backend/app/models/")
    print("Initializing architecture in demonstration mode for college evaluation...")
    print("=" * 70)

    try:
        import tensorflow as tf
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import TimeDistributed, Conv2D, MaxPooling2D, Flatten, LSTM, Dense, Dropout

        # Construct exact architecture defined in ml/model.py
        model = Sequential([
            TimeDistributed(
                Conv2D(32, (3, 3), activation='relu', padding='same'),
                input_shape=(settings.SEQUENCE_LENGTH, settings.FRAME_SIZE, settings.FRAME_SIZE, 3)
            ),
            TimeDistributed(MaxPooling2D((2, 2))),
            TimeDistributed(Conv2D(64, (3, 3), activation='relu', padding='same')),
            TimeDistributed(MaxPooling2D((2, 2))),
            TimeDistributed(Flatten()),
            LSTM(64, return_sequences=False),
            Dense(128, activation='relu'),
            Dropout(0.5),
            Dense(1, activation='sigmoid')
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        _cached_model = model
        _model_source = "Demonstration Fallback (Architecture compiled, untrained weights)"
        return _cached_model
    except ImportError:
        print("[!] TensorFlow is not installed in the local Python environment.")
        _model_source = "Mock Engine (TensorFlow missing)"
        return None

def get_model():
    """
    Returns the cached model instance, loading it if not yet initialized.
    """
    global _cached_model
    if _cached_model is None:
        return load_violence_model()
    return _cached_model

def get_model_status():
    """
    Returns metadata about the active ML model.
    """
    return {
        "loaded": _cached_model is not None,
        "source": _model_source,
        "expected_path": settings.MODEL_PATH,
        "sequence_length": settings.SEQUENCE_LENGTH,
        "frame_size": settings.FRAME_SIZE,
        "threshold": settings.PREDICTION_THRESHOLD,
    }

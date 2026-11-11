import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

class Settings:
    """
    Application configuration loaded from environment variables with safe production defaults.
    """
    PROJECT_NAME: str = "AI Violence Detection API"
    VERSION: str = "1.0.0"

    # Base directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    UPLOAD_DIR: Path = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
    
    # Model parameters
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "app" / "models" / "violence_model.h5"))
    FRAME_SIZE: int = int(os.getenv("FRAME_SIZE", "224"))
    SEQUENCE_LENGTH: int = int(os.getenv("SEQUENCE_LENGTH", "20"))
    FRAME_SKIP_INTERVAL: int = int(os.getenv("FRAME_SKIP_INTERVAL", "2"))
    
    # Detection threshold (Probability >= PREDICTION_THRESHOLD is classified as Violence)
    PREDICTION_THRESHOLD: float = float(os.getenv("PREDICTION_THRESHOLD", "0.5"))
    
    # File limits
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "100"))
    MAX_FILE_SIZE_BYTES: int = MAX_FILE_SIZE_MB * 1024 * 1024
    ALLOWED_EXTENSIONS: set = {".mp4", ".avi", ".mov", ".mkv", ".webm"}

    # Live detection parameters
    SMOOTHING_WINDOW: int = int(os.getenv("SMOOTHING_WINDOW", "5"))
    ALERT_COOLDOWN: int = int(os.getenv("ALERT_COOLDOWN", "5"))
    DETECTION_INTERVAL: int = int(os.getenv("DETECTION_INTERVAL", "200"))

    # CORS settings
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

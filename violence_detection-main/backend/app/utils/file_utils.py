import os
import uuid
from pathlib import Path
from fastapi import HTTPException, UploadFile
from app.config import settings

def validate_video_file(file: UploadFile) -> None:
    """
    Validates uploaded video file extension, MIME type, and prevents path traversal.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty filename provided.")

    # Prevent path traversal attacks
    sanitized_filename = os.path.basename(file.filename)
    extension = Path(sanitized_filename).suffix.lower()

    if extension not in settings.ALLOWED_EXTENSIONS:
        allowed = ", ".join(settings.ALLOWED_EXTENSIONS)
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{extension}'. Allowed video extensions are: {allowed}"
        )

    # Validate content type if provided
    if file.content_type and not file.content_type.startswith("video/") and file.content_type != "application/octet-stream":
        raise HTTPException(
            status_code=400,
            detail=f"Invalid MIME type '{file.content_type}'. Must be a valid video payload."
        )

def generate_secure_temp_path(original_filename: str) -> Path:
    """
    Generates a secure, non-guessable temporary file path using UUID4.
    """
    extension = Path(os.path.basename(original_filename)).suffix.lower()
    unique_name = f"upload_{uuid.uuid4().hex}{extension}"
    return settings.UPLOAD_DIR / unique_name

def safe_remove_file(file_path: Path) -> None:
    """
    Safely removes temporary files with error suppression.
    """
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Failed to clean up temporary file {file_path}: {e}")

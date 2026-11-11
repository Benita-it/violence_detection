import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.utils.file_utils import validate_video_file, generate_secure_temp_path, safe_remove_file
from app.services.prediction_service import predict_video

router = APIRouter(prefix="/api", tags=["Detection"])

@router.post("/detect")
async def detect_violence_in_video(file: UploadFile = File(...)):
    """
    Accepts a video upload, validates size/format, extracts frames using OpenCV,
    and runs inference through the CNN-LSTM violence detection model.
    """
    # 1. Validation
    validate_video_file(file)

    # 2. Secure temporary file allocation
    temp_path = generate_secure_temp_path(file.filename)

    try:
        # Stream file to disk with byte size monitoring
        bytes_written = 0
        with open(temp_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                bytes_written += len(chunk)
                if bytes_written > settings.MAX_FILE_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Video file exceeds maximum allowable size of {settings.MAX_FILE_SIZE_MB}MB."
                    )
                buffer.write(chunk)

        if bytes_written == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

        # 3. Process video through OpenCV & CNN-LSTM prediction service
        result = predict_video(str(temp_path))
        return result

    except HTTPException:
        raise
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as err:
        print(f"[ERROR] Internal detection pipeline failure: {err}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred during video processing and AI model inference. Please verify video format."
        )
    finally:
        # 4. Mandatory file cleanup
        safe_remove_file(temp_path)

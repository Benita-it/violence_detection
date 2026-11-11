from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.live_prediction_service import process_live_frames

router = APIRouter(prefix="/api", tags=["Live Detection"])

class LiveFramesPayload(BaseModel):
    frames: List[str] = Field(..., description="List of Base64 encoded JPEG/PNG frames")
    threshold: Optional[float] = Field(0.5, ge=0.0, le=1.0, description="Optional custom confidence threshold")

@router.post("/live-detect")
async def detect_live_stream_frames(payload: LiveFramesPayload):
    """
    Accepts a sequence of live webcam frames from the frontend rolling buffer,
    decodes each frame, evaluates sequence motion with CNN-LSTM, and returns real-time classification.
    """
    if not payload.frames or len(payload.frames) == 0:
        raise HTTPException(status_code=400, detail="Payload must contain at least one frame.")

    try:
        result = process_live_frames(payload.frames, custom_threshold=payload.threshold)
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as err:
        print(f"[ERROR] Live frame evaluation error: {err}")
        raise HTTPException(
            status_code=500,
            detail="Error processing live video frames. Ensure camera frames are valid image data."
        )

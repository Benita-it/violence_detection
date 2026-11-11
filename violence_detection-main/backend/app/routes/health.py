from fastapi import APIRouter
from app.services.model_service import get_model_status

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
def health_check():
    """
    Health check endpoint returning system status and model readiness.
    """
    status = get_model_status()
    return {
        "status": "healthy",
        "service": "AI Violence Detection API",
        "model_status": status
    }

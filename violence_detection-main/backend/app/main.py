from app.routes.alert import router as alert_router
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.routes.health import router as health_router
from app.routes.detection import router as detection_router
from app.routes.live_detection import router as live_detection_router
from app.services.model_service import load_violence_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager. Preloads the CNN-LSTM model on startup.
    """
    print(f"[*] Initializing {settings.PROJECT_NAME} v{settings.VERSION}...")
    load_violence_model()
    yield
    print("[*] Shutting down AI Violence Detection service.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Automated Video Violence Detection API using OpenCV and CNN-LSTM Deep Learning.",
    lifespan=lifespan
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[FATAL UNHANDLED ERROR] {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error occurred.",
            "detail": str(exc)
        }
    )

# Include API Routers
app.include_router(health_router)
app.include_router(detection_router)
app.include_router(live_detection_router)
app.include_router(alert_router)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": "/api/health",
        "status": "online"
    }

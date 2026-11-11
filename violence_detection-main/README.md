# AI/ML-Based Violence Detection from Video

A production-grade, full-stack automated surveillance system that detects violent behavior in recorded video footage and live camera streams. Built with a spatial-temporal **CNN-LSTM** deep learning neural network, **OpenCV** frame extraction, a high-performance **FastAPI** Python backend, and a modern **React.js** surveillance dashboard.

Designed as a comprehensive **Final-Year College Project** in Artificial Intelligence, Computer Vision, and Full-Stack Engineering.

---

## 🌟 Key Capabilities

- **Dual Surveillance Modes**:
  1. **Upload Video Detection**: Batch processing for CCTV/mobile video files (`.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`) up to 100MB with OpenCV frame extraction and sequence evaluation.
  2. **Live Webcam Surveillance**: Real-time camera feed analysis utilizing a rolling 20-frame spatial-temporal buffer, moving average temporal smoothing, and automated canvas incident snapshots.
- **Deep Learning Architecture**: TimeDistributed 2D Convolutional Neural Network (spatial pose/feature extraction) fused with Long Short-Term Memory (temporal motion velocity).
- **Incident Alarm Engine**: Configurable alert cooldown, instant canvas frame capture, and optional browser desktop notifications.
- **Production Safety**: File validation, strict size limits, UUID-based temporary path sandboxing, and safe cleanup in `try/finally` blocks.
- **Surveillance Intelligence Dashboard**: Tracks historical classifications, mean confidence scores, violence vs. normal ratios, with JSON audit log exports.

---

## 🏗️ System Architecture

```
[Video Input / WebRTC Camera]
            │
            ▼
[OpenCV Frame Preprocessing]
  - Adaptive sampling (FRAME_SKIP_INTERVAL = 2)
  - 224×224 px Uniform Downscaling
  - BGR ➔ RGB Conversion & [0.0, 1.0] Min-Max Normalization
            │
            ▼
[20-Frame Sequence Builder] (Batch, 20, 224, 224, 3)
            │
            ▼
[TimeDistributed CNN Layers]
  - Conv2D (32, 3×3) ➔ MaxPool2D (2×2)
  - Conv2D (64, 3×3) ➔ MaxPool2D (2×2)
  - TimeDistributed(Flatten) ➔ 20 spatial feature vectors
            │
            ▼
[LSTM Recurrent Layer] (64 Hidden Units)
  - Retains temporal motion velocity across frames
            │
            ▼
[Dense Classification Head]
  - Dense (128, ReLU) ➔ Dropout (0.5)
  - Dense (1, Sigmoid) ➔ Violence Probability [0.0, 1.0]
            │
            ▼
[Temporal Smoothing & Threshold Filter]
  - Rolling N-window mean probability
  - Assigns: "Violence Detected" or "No Violence Detected"
```

---

## 📁 Repository Directory Structure

```
violence-detection/
├── frontend/                     # React.js surveillance dashboard (Vite + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── VideoUploader.jsx
│   │   │   ├── VideoPreview.jsx
│   │   │   ├── PredictionCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── LiveCamera.jsx
│   │   │   ├── LiveStatus.jsx
│   │   │   ├── IncidentAlert.jsx
│   │   │   └── DetectionSettings.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── UploadDetection.jsx
│   │   │   ├── LiveDetection.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── About.jsx
│   │   ├── services/
│   │   │   ├── api.js           # Upload endpoints
│   │   │   └── liveApi.js       # Real-time frame stream endpoints
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── backend/                      # Python FastAPI application
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, lifespan
│   │   ├── config.py            # Environment settings
│   │   ├── routes/
│   │   │   ├── detection.py     # POST /api/detect (video upload)
│   │   │   ├── live_detection.py# POST /api/live-detect (webcam frames)
│   │   │   └── health.py        # GET /api/health
│   │   ├── services/
│   │   │   ├── video_processor.py      # OpenCV video frame extraction
│   │   │   ├── prediction_service.py   # Aggregated video prediction
│   │   │   ├── live_prediction_service.py # Real-time sequence prediction
│   │   │   ├── model_service.py        # Model loading & fallback engine
│   │   │   └── frame_decoder.py        # Base64 image decoding & normalizing
│   │   ├── models/              # Store trained violence_model.h5 here
│   │   └── utils/
│   │       └── file_utils.py    # Validation & cleanup utilities
│   ├── requirements.txt
│   ├── run.py                   # Uvicorn launcher
│   └── .env
│
├── ml/                           # Model training & evaluation scripts
│   ├── model.py                 # CNN-LSTM architecture definition
│   ├── train.py                 # Training pipeline with early stopping & plots
│   ├── preprocess.py            # Video dataset ingestion & sequence splits
│   └── evaluate.py              # Confusion matrix, ROC, Precision, Recall
│
├── README.md
└── .gitignore
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup (FastAPI + OpenCV + TensorFlow)

```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python run.py
```
The backend will launch at `http://localhost:8000`. Interactive Swagger API docs are accessible at `http://localhost:8000/docs`.

### 2. Frontend Setup (React.js + Vite + Tailwind CSS)

```bash
# In another terminal, install root dependencies
npm install

# Start Vite development server
npm run dev
```
The React frontend will be live on `http://localhost:3000` (or `http://localhost:5173`).

---

## 🧠 ML Model Training Pipeline

### Recommended Datasets
1. **Real Life Violence Situations Dataset** (Kaggle): 2,000 video clips captured from real-world security and mobile cameras (1,000 violent, 1,000 non-violent).
2. **Hockey Fight Dataset**: 1,000 short video clips of violent altercations vs. normal sports action.
3. **UCF-Crime Dataset**: Surveillance clips covering fights, assault, robbery, and routine human activity.

Organize your training data into two folders:
```
dataset/
├── violence/       # Video files (.mp4, .avi) with violent actions
└── non_violence/   # Routine everyday video files
```

### Run Model Training:
```bash
python ml/train.py --data_dir ./dataset --epochs 30 --batch_size 8 --learning_rate 0.0001
```
The script will:
- Ingest videos and normalize 20-frame sequences.
- Perform stratified Train (70%), Validation (15%), and Test (15%) splits.
- Train with `ModelCheckpoint`, `EarlyStopping`, and `ReduceLROnPlateau`.
- Plot loss and accuracy curves to `training_metrics.png`.
- Save the best weights as `violence_model.h5` into `backend/app/models/`.

### Run Model Evaluation & Confusion Matrix:
```bash
python ml/evaluate.py --model_path backend/app/models/violence_model.h5 --test_data_dir ./dataset/test
```
This generates:
- Full classification report (Precision, Recall, F1-Score).
- Confusion Matrix visualization (`confusion_matrix.png`).
- Receiver Operating Characteristic plot (`roc_curve.png`).
- False Alarm Rate (FPR) vs. Miss Rate (FNR) analysis.

---

## 📡 REST API Specifications

| Method | Endpoint | Description | Payload |
|---|---|---|---|
| `GET` | `/api/health` | Service health & model readiness status | None |
| `POST` | `/api/detect` | Upload recorded video file for analysis | Multipart `file: UploadFile` |
| `POST` | `/api/live-detect` | Live sequence analysis from webcam | JSON `{ "frames": [...], "threshold": 0.5 }` |

### Sample Response (`POST /api/detect`):
```json
{
  "success": true,
  "prediction": "Violence Detected",
  "confidence": 0.9421,
  "confidence_percentage": 94.21,
  "frames_analyzed": 120,
  "raw_frames": 240,
  "sequences_analyzed": 11,
  "processing_time": 1.48
}
```

---

## 🛠️ Troubleshooting

- **Webcam Access Denied**: Ensure camera permissions are granted in browser site settings. If testing in an iframe, open the app in a new tab.
- **Model File Missing**: Place `violence_model.h5` in `backend/app/models/`. If absent, the backend utilizes an compiled architecture in demonstration mode with clear logs.
- **CORS Errors**: Check `CORS_ORIGINS` in `backend/app/config.py` to ensure your frontend port (e.g., `http://localhost:5173` or `3000`) is allowed.
- **OpenCV Video Codec Issues**: Ensure you have installed `opencv-python-headless` or `opencv-python` with `ffmpeg` support for MP4/H.264 decoding.

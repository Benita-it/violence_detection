import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple
from app.config import settings

def extract_frames(
    video_path: str,
    frame_size: int = settings.FRAME_SIZE,
    frame_skip: int = settings.FRAME_SKIP_INTERVAL
) -> Tuple[List[np.ndarray], int]:
    """
    Reads a video file using OpenCV, samples frames at intervals, resizes, converts color space,
    and normalizes pixel values to [0.0, 1.0].
    
    Returns:
        Tuple[List[np.ndarray], int]: (preprocessed_frames, total_raw_frames_in_video)
    """
    cap = cv2.VideoCapture(str(video_path))
    
    if not cap.isOpened():
        raise ValueError(f"Unable to open video file at {video_path}. The file may be corrupt or unreadable.")

    frames = []
    frame_count = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret or frame is None:
                break

            # Sample every Nth frame to reduce compute while retaining motion continuity
            if frame_count % frame_skip == 0:
                # Resize to target model dimension (default: 224x224)
                resized = cv2.resize(frame, (frame_size, frame_size))
                
                # Convert OpenCV BGR format to RGB format expected by CNN models
                rgb_frame = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
                
                # Normalize pixel values from [0, 255] to [0.0, 1.0]
                normalized_frame = rgb_frame.astype(np.float32) / 255.0
                frames.append(normalized_frame)

            frame_count += 1
    finally:
        cap.release()

    if len(frames) == 0:
        raise ValueError("Video contains no readable frames or is an empty recording.")

    return frames, frame_count

def create_sequences(
    frames: List[np.ndarray],
    sequence_length: int = settings.SEQUENCE_LENGTH
) -> np.ndarray:
    """
    Converts extracted frame list into fixed-length sequence tensors suitable for CNN-LSTM models.
    
    - If video has fewer frames than sequence_length, pad by repeating the final frame.
    - If video has multiple sequence segments, extracts sliding/contiguous windows.
    
    Returns:
        np.ndarray with shape: (num_sequences, sequence_length, height, width, 3)
    """
    total_frames = len(frames)
    frame_shape = frames[0].shape

    # Case 1: Video has fewer frames than required sequence length -> Pad by repeating last frame
    if total_frames < sequence_length:
        padded = list(frames)
        last_frame = frames[-1]
        while len(padded) < sequence_length:
            padded.append(last_frame)
        return np.array([padded], dtype=np.float32)

    # Case 2: Slice into contiguous sequences of length `sequence_length`
    sequences = []
    step = max(1, sequence_length // 2)  # 50% overlap for smooth temporal windowing

    for i in range(0, total_frames - sequence_length + 1, step):
        seq = frames[i : i + sequence_length]
        sequences.append(seq)

    # If step jumping missed the very end of video, include final window
    if len(sequences) == 0:
        sequences.append(frames[:sequence_length])

    return np.array(sequences, dtype=np.float32)

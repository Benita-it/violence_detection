import React, { useState, useRef } from 'react';
import VideoUploader from '../components/VideoUploader';
import VideoPreview from '../components/VideoPreview';
import PredictionCard from '../components/PredictionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { analyzeVideo } from '../services/api';
import { ShieldAlert, RefreshCw, Layers } from 'lucide-react';

export default function UploadDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [predictionResult, setPredictionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertDetails, setAlertDetails] = useState(null);
  const [alertSent, setAlertSent] = useState(false);
  const [evidenceImage, setEvidenceImage] = useState(null);

  const lastAlertStateRef = useRef(false);
  const alertAudioRef = useRef(null);

  // ---------------------------------------
  // GET CONFIDENCE PERCENTAGE
  // ---------------------------------------
  const getConfidencePercent = (result) => {
    if (!result) return 0;

    const rawValue =
      result.confidence_percentage ?? result.confidence;

    const numericValue = Number(rawValue);

    if (Number.isNaN(numericValue)) {
      return 0;
    }

    return numericValue > 1
      ? numericValue
      : numericValue * 100;
  };

  // ---------------------------------------
  // GET CURRENT GPS LOCATION
  // ---------------------------------------
  const getCurrentLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn(
          '❌ Geolocation is not supported by this browser.'
        );

        resolve({
          latitude: null,
          longitude: null,
          location: 'Location unavailable',
          address: 'Location permission/browser support unavailable',
        });

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          console.log(
            '📍 Current latitude:',
            latitude
          );

          console.log(
            '📍 Current longitude:',
            longitude
          );

          resolve({
            latitude,
            longitude,

            location:
              `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,

            address:
              `https://www.google.com/maps?q=${latitude},${longitude}`,
          });
        },

        (error) => {
          console.error(
            '❌ Location error:',
            error.message
          );

          resolve({
            latitude: null,
            longitude: null,
            location: 'Location permission denied',
            address: 'Location unavailable',
          });
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // ---------------------------------------
  // CAPTURE EVIDENCE FRAME
  // ---------------------------------------
  const captureEvidenceFrame = () => {
    return new Promise((resolve) => {
      if (!selectedFile) {
        console.warn('❌ No video selected for evidence capture');
        resolve(null);
        return;
      }

      const video = document.createElement('video');
      const canvas = document.createElement('canvas');

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const videoUrl = URL.createObjectURL(selectedFile);
      video.src = videoUrl;

      video.onloadedmetadata = () => {
        const duration = video.duration || 0;

        if (!duration || !Number.isFinite(duration)) {
          console.warn('❌ Video duration unavailable');
          URL.revokeObjectURL(videoUrl);
          resolve(null);
          return;
        }

        // Capture a frame from the middle of the uploaded video.
        video.currentTime = duration / 2;
      };

      video.onseeked = () => {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          if (!canvas.width || !canvas.height) {
            console.warn('❌ Video dimensions unavailable');
            URL.revokeObjectURL(videoUrl);
            resolve(null);
            return;
          }

          const context = canvas.getContext('2d');

          context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
          );

          const imageData = canvas.toDataURL(
            'image/jpeg',
            0.9
          );

          setEvidenceImage(imageData);

          console.log('📸 Evidence frame captured');

          URL.revokeObjectURL(videoUrl);
          resolve(imageData);
        } catch (error) {
          console.error(
            '❌ Evidence frame capture failed:',
            error
          );

          URL.revokeObjectURL(videoUrl);
          resolve(null);
        }
      };

      video.onerror = () => {
        console.error('❌ Could not load video for evidence capture');
        URL.revokeObjectURL(videoUrl);
        resolve(null);
      };
    });
  };

  // ---------------------------------------
  // STOP ALARM
  // ---------------------------------------
  const stopAlarm = () => {
    if (alertAudioRef.current) {
      alertAudioRef.current.pause();
      alertAudioRef.current.currentTime = 0;
      alertAudioRef.current = null;

      console.log('🔇 Alarm stopped');
    }

    lastAlertStateRef.current = false;
  };

  // ---------------------------------------
  // CREATE ALERT DETAILS
  // ---------------------------------------
  const createAlertDetails = async (result) => {
    const now = new Date();

    const confidence = getConfidencePercent(result);

    // Get actual browser/device GPS location
    const currentLocation =
      await getCurrentLocation();

    return {
      prediction:
        result?.prediction || 'Unknown',

      confidence:
        confidence.toFixed(2),

      date:
        now.toLocaleDateString('en-IN'),

      time:
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),

      location:
        currentLocation.location,

      address:
        currentLocation.address,

      latitude:
        currentLocation.latitude,

      longitude:
        currentLocation.longitude,
    };
  };

  // ---------------------------------------
  // SEND ALERT TO FASTAPI
  // ---------------------------------------
  const sendAlertToBackend = async (details) => {
    try {
      console.log(
        '📡 Sending violence alert to backend...',
        details
      );

      const response = await fetch(
        'http://127.0.0.1:8000/api/send-alert',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
          ...details,
          evidence_image: evidenceImage,
        }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Alert API failed with status ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        '✅ Alert successfully sent to backend:',
        data
      );

      setAlertSent(true);

      return data;

    } catch (error) {
      console.error(
        '❌ Failed to send alert:',
        error
      );

      setAlertSent(false);

      return null;
    }
  };

  // ---------------------------------------
  // VIOLENCE ALERT + ALARM
  // ---------------------------------------
  const maybePlayViolenceAlert = async (result) => {
    const shouldAlert =
      result?.prediction === 'Violence Detected';

    console.log(
      'PREDICTION:',
      result?.prediction
    );

    console.log(
      'ALERT CONDITION:',
      shouldAlert
    );

    // ---------------------------------------
    // NON-VIOLENCE
    // ---------------------------------------
    if (!shouldAlert) {
      stopAlarm();

      setAlertDetails(null);

      setAlertSent(false);

      console.log(
        '✅ Non-violence detected - alarm stopped'
      );

      return;
    }

    // ---------------------------------------
    // CAPTURE EVIDENCE FRAME
    // ---------------------------------------
    const capturedEvidence =
      await captureEvidenceFrame();

    if (capturedEvidence) {
      console.log('📸 Evidence image ready');
    }

    // ---------------------------------------
    // CREATE ALERT DETAILS
    // ---------------------------------------
    const details =
      await createAlertDetails(result);

    setAlertDetails(details);

    console.log(
      '🚨 ALERT DETAILS:',
      details
    );

    // ---------------------------------------
    // PLAY ALARM
    // ---------------------------------------
    if (
      shouldAlert &&
      !lastAlertStateRef.current
    ) {
      try {
        const audio =
          new Audio(
            '/alarm/alarm.mp3'
          );

        audio.volume = 1.0;
        audio.currentTime = 0;

        alertAudioRef.current =
          audio;

        await audio.play();

        lastAlertStateRef.current =
          true;

        console.log(
          '🚨 Violence detected - alarm playing'
        );

      } catch (error) {
        console.error(
          '❌ Alarm playback failed:',
          error
        );
      }
    }

    // ---------------------------------------
    // SEND ALERT TO FASTAPI
    // ---------------------------------------
    await sendAlertToBackend(details);
  };

  // ---------------------------------------
  // FILE SELECT
  // ---------------------------------------
  const handleFileSelect = (file) => {
    stopAlarm();

    setSelectedFile(file);

    setPredictionResult(null);

    setEvidenceImage(null);

    setAlertDetails(null);

    setAlertSent(false);

    setErrorMessage('');

    setUploadProgress(0);

    console.log(
      '📁 New video selected'
    );
  };

  // ---------------------------------------
  // CLEAR VIDEO
  // ---------------------------------------
  const handleClear = () => {
    stopAlarm();

    setSelectedFile(null);

    setPredictionResult(null);

    setEvidenceImage(null);

    setAlertDetails(null);

    setAlertSent(false);

    setErrorMessage('');

    setUploadProgress(0);

    console.log(
      '🗑️ Video cleared'
    );
  };

  // ---------------------------------------
  // SAVE HISTORY
  // ---------------------------------------
  const saveToHistory = (
    result,
    fileName
  ) => {
    try {
      const existing =
        JSON.parse(
          localStorage.getItem(
            'violence_detection_history'
          ) || '[]'
        );

      const newEntry = {
        id:
          Date.now().toString(),

        timestamp:
          new Date().toLocaleString(),

        fileName:
          fileName,

        prediction:
          result.prediction,

        confidence:
          result.confidence_percentage ??
          (result.confidence * 100),

        framesAnalyzed:
          result.frames_analyzed || 20,

        processingTime:
          result.processing_time || 0,

        type:
          'Upload Video',
      };

      const updated = [
        newEntry,
        ...existing,
      ].slice(0, 50);

      localStorage.setItem(
        'violence_detection_history',
        JSON.stringify(updated)
      );

    } catch (err) {
      console.warn(
        'Could not persist to localStorage:',
        err
      );
    }
  };

  // ---------------------------------------
  // ANALYZE VIDEO
  // ---------------------------------------
  const handleAnalyze = async () => {
    if (!selectedFile) {
      return;
    }

    // Stop previous alarm
    stopAlarm();

    setIsAnalyzing(true);

    setErrorMessage('');

    setPredictionResult(null);

    setAlertDetails(null);

    setAlertSent(false);

    setUploadProgress(0);

    try {
      const result =
        await analyzeVideo(
          selectedFile,
          (progress) => {
            setUploadProgress(
              progress
            );
          }
        );

      console.log(
        'Backend prediction result:',
        result
      );

      // Alarm + details + backend alert
      await maybePlayViolenceAlert(
        result
      );

      setPredictionResult(result);

      saveToHistory(
        result,
        selectedFile.name
      );

    } catch (error) {
      console.error(
        'Video analysis failed:',
        error
      );

      stopAlarm();

      setErrorMessage(
        error.message ||
        'An error occurred during video analysis.'
      );

    } finally {
      setIsAnalyzing(false);
    }
  };

  // ---------------------------------------
  // MANUAL ALARM TEST
  // ---------------------------------------
  const testAlarm = () => {
    stopAlarm();

    const audio =
      new Audio(
        '/alarm/alarm.mp3'
      );

    audio.volume = 1.0;

    audio.currentTime = 0;

    alertAudioRef.current =
      audio;

    audio
      .play()
      .then(() => {
        console.log(
          '🔊 Alarm sound playing'
        );
      })
      .catch((error) => {
        console.error(
          '❌ Alarm sound error:',
          error
        );
      });
  };

  return (
    <div className="space-y-8 py-4">

      {/* TEST ALARM */}

      <div>
        <button
          onClick={testAlarm}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
        >
          Test Alarm
        </button>
      </div>

      {/* HEADER */}

      <div className="border-b border-slate-800 pb-6">

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/80 text-blue-400 text-xs font-mono mb-3">

          <Layers className="w-3.5 h-3.5" />

          <span>
            Batch Video Ingestion & Classification
          </span>

        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Upload Surveillance Video
        </h1>

        <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl">
          Submit CCTV clips, mobile recordings, or security camera files.
          The backend OpenCV engine will extract sequences and execute
          CNN-LSTM violence inference.
        </p>

      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT */}

        <div className="lg:col-span-7 space-y-6">

          <VideoUploader
            onFileSelect={handleFileSelect}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            selectedFile={selectedFile}
            onClear={handleClear}
          />

          {/* ERROR */}

          {errorMessage && (
            <ErrorMessage
              error={errorMessage}
              onDismiss={() =>
                setErrorMessage('')
              }
              onRetry={handleAnalyze}
            />
          )}

          {/* LOADING */}

          {isAnalyzing && (
            <LoadingSpinner
              uploadProgress={
                uploadProgress
              }
            />
          )}

          {/* RESULT */}

          {predictionResult &&
            !isAnalyzing && (

              <div className="space-y-4">

                <PredictionCard
                  result={
                    predictionResult
                  }
                  fileName={
                    selectedFile?.name
                  }
                />

                {/* VIOLENCE ALERT */}

                {alertDetails && (

                  <div className="bg-red-950/40 border border-red-600/60 rounded-2xl p-6 shadow-xl">

                    <div className="flex items-center gap-3 mb-5">

                      <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">

                        <ShieldAlert className="w-6 h-6 text-red-400" />

                      </div>

                      <div>

                        <h2 className="text-lg font-bold text-red-400">
                          🚨 Violence Alert
                        </h2>

                        <p className="text-xs text-slate-400">
                          Alert information generated
                        </p>

                      </div>

                    </div>

                    {/* ALERT INFORMATION */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* DATE */}

                      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">

                        <p className="text-xs text-slate-500">
                          Date
                        </p>

                        <p className="text-sm font-semibold text-white mt-1">
                          {alertDetails.date}
                        </p>

                      </div>

                      {/* TIME */}

                      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">

                        <p className="text-xs text-slate-500">
                          Time
                        </p>

                        <p className="text-sm font-semibold text-white mt-1">
                          {alertDetails.time}
                        </p>

                      </div>

                      {/* LOCATION */}

                      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">

                        <p className="text-xs text-slate-500">
                          Current GPS Location
                        </p>

                        <p className="text-sm font-semibold text-white mt-1 break-all">
                          {alertDetails.location}
                        </p>

                      </div>

                      {/* CONFIDENCE */}

                      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">

                        <p className="text-xs text-slate-500">
                          Confidence
                        </p>

                        <p className="text-sm font-semibold text-red-400 mt-1">
                          {alertDetails.confidence}%
                        </p>

                      </div>

                    </div>

                    {/* ADDRESS / MAP */}

                    <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 mt-4">

                      <p className="text-xs text-slate-500">
                        Google Maps Location
                      </p>

                      {alertDetails.address &&
                      alertDetails.address.startsWith(
                        'https://www.google.com/maps'
                      ) ? (

                        <a
                          href={alertDetails.address}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-400 hover:text-blue-300 mt-1 block break-all"
                        >
                          📍 Open Current Location in Google Maps
                        </a>

                      ) : (

                        <p className="text-sm font-semibold text-white mt-1">
                          {alertDetails.address}
                        </p>

                      )}

                    </div>

                    {/* COORDINATES */}

                    {alertDetails.latitude !== null &&
                      alertDetails.longitude !== null && (

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">

                          <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">

                            <p className="text-xs text-slate-500">
                              Latitude
                            </p>

                            <p className="text-sm font-semibold text-white mt-1">
                              {alertDetails.latitude}
                            </p>

                          </div>

                          <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800">

                            <p className="text-xs text-slate-500">
                              Longitude
                            </p>

                            <p className="text-sm font-semibold text-white mt-1">
                              {alertDetails.longitude}
                            </p>

                          </div>

                        </div>

                    )}

                    {/* EVIDENCE FRAME */}
                    {evidenceImage && (
                      <div className="bg-slate-900/70 rounded-xl p-4 border border-slate-800 mt-4">
                        <p className="text-xs text-slate-500">
                          Evidence Frame
                        </p>

                        <img
                          src={evidenceImage}
                          alt="Violence evidence frame"
                          className="mt-3 w-full rounded-xl border border-red-500/40"
                        />

                        <p className="text-xs text-slate-500 mt-2">
                          📸 Captured automatically from the analyzed video.
                        </p>
                      </div>
                    )}

                    {/* BACKEND ALERT STATUS */}

                    <div className="mt-4">

                      {alertSent ? (

                        <p className="text-sm text-green-400 font-semibold">
                          ✅ Alert sent to backend successfully
                        </p>

                      ) : (

                        <p className="text-sm text-yellow-400 font-semibold">
                          ⚠️ Alert details generated, but backend alert was not confirmed
                        </p>

                      )}

                    </div>

                  </div>

                )}

                {/* ANALYZE ANOTHER */}

                <div className="flex justify-end">

                  <button
                    onClick={handleClear}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >

                    <RefreshCw className="w-3.5 h-3.5" />

                    <span>
                      Analyze Another Video
                    </span>

                  </button>

                </div>

              </div>
            )}

        </div>

        {/* RIGHT */}

        <div className="lg:col-span-5 space-y-6">

          {selectedFile ? (

            <VideoPreview
              file={selectedFile}
            />

          ) : (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">

              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-600 mx-auto">

                <ShieldAlert className="w-8 h-8" />

              </div>

              <div>

                <h3 className="text-base font-bold text-slate-200">
                  Playback Console Standby
                </h3>

                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  When you select or drop a video file,
                  an interactive HTML5 media player will
                  initialize here for review.
                </p>

              </div>

              <div className="pt-2 text-[11px] font-mono text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">

                <span>
                  Model Specs: 224×224 px • 20 Frames/Seq • RGB
                </span>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
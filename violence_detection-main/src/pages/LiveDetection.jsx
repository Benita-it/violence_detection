import React, { useState, useEffect, useRef } from 'react';
import LiveCamera from '../components/LiveCamera';
import LiveStatus from '../components/LiveStatus';
import IncidentAlert from '../components/IncidentAlert';
import DetectionSettings from '../components/DetectionSettings';
import { initializeAlertSound, playAlertTone } from '../utils/alertSound';
import { 
  Camera, 
  ShieldAlert, 
  Lock, 
  Clock, 
  History, 
  AlertCircle,
  SlidersHorizontal,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function LiveDetection() {
  const [currentPrediction, setCurrentPrediction] = useState('No Violence Detected');
  const [rawConfidence, setRawConfidence] = useState(0.1);
  const [smoothedProbability, setSmoothedProbability] = useState(0.1);
  const [framesAnalyzed, setFramesAnalyzed] = useState(0);
  const [detectionFps, setDetectionFps] = useState(5);
  const [incident, setIncident] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [liveLog, setLiveLog] = useState([]);

  // Configurable settings
  const [settings, setSettings] = useState({
    threshold: 80, // %
    interval: 200, // ms (~5 FPS)
    smoothingWindow: 5, // predictions
    cooldown: 60, // seconds
    notifications: false,
  });

  // Rolling predictions history for temporal smoothing
  const probabilityHistoryRef = useRef([]);
  const lastAlertTimeRef = useRef(0);

  // Load session live log
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('live_detection_events') || '[]');
      setLiveLog(stored);
    } catch (e) {
      console.warn('Failed to load live events from localStorage', e);
    }
  }, []);

  /**
   * Called by LiveCamera when a sequence inference completes
   */
  const handlePredictionUpdate = (data) => {
    const prob = data.confidence !== undefined ? data.confidence : (data.confidence_percentage / 100);
    setRawConfidence(prob);
    setFramesAnalyzed(data.frames_analyzed || 0);
    if (data.fps) setDetectionFps(data.fps);

    // Apply temporal smoothing: rolling average over last N predictions
    probabilityHistoryRef.current.push(prob);
    if (probabilityHistoryRef.current.length > settings.smoothingWindow) {
      probabilityHistoryRef.current.shift();
    }

    const sum = probabilityHistoryRef.current.reduce((acc, val) => acc + val, 0);
    const avg = sum / probabilityHistoryRef.current.length;
    setSmoothedProbability(avg);

    const thresholdNorm = settings.threshold / 100;
    const isViolent = avg >= thresholdNorm;
    setCurrentPrediction(isViolent ? 'Violence Detected' : 'No Violence Detected');
  };

  /**
   * Triggered when high-confidence violence is detected
   */
  const handleIncidentDetected = (incidentData) => {
    const now = Date.now();
    const cooldownMs = (settings.cooldown || 5) * 1000;

    // Verify cooldown to prevent alert spamming
    if (now - lastAlertTimeRef.current < cooldownMs) {
      return;
    }

    lastAlertTimeRef.current = now;
    setIncident(incidentData);

    // Save event to local session log
    if (Number(incidentData.confidence) >= 80) {
      playAlertTone();
    }

    const eventItem = {
      id: now.toString(),
      timestamp: incidentData.timestamp,
      type: 'Violence Detected',
      confidence: incidentData.confidence,
      framesCount: incidentData.framesCount,
    };

    const updated = [eventItem, ...liveLog].slice(0, 30);
    setLiveLog(updated);
    try {
      localStorage.setItem('live_detection_events', JSON.stringify(updated));

      // Also append to main history
      const fullHistory = JSON.parse(localStorage.getItem('violence_detection_history') || '[]');
      fullHistory.unshift({
        id: now.toString(),
        timestamp: new Date().toLocaleString(),
        fileName: 'Webcam Live Stream',
        prediction: 'Violence Detected',
        confidence: incidentData.confidence,
        framesAnalyzed: incidentData.framesCount,
        type: 'Live Stream',
      });
      localStorage.setItem('violence_detection_history', JSON.stringify(fullHistory.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }

    // Trigger browser desktop notification if enabled
    if (settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ Violence Alert Detected', {
        body: `Violence detected in live camera feed (${incidentData.confidence}% confidence).`,
        icon: '/favicon.ico',
      });
    }
  };

  const clearLiveLogs = () => {
    setLiveLog([]);
    localStorage.removeItem('live_detection_events');
  };

  const resetSettings = () => {
    setSettings({
      threshold: 80,
      interval: 200,
      smoothingWindow: 5,
      cooldown: 60,
      notifications: false,
    });
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-mono mb-2">
            <Camera className="w-3.5 h-3.5" />
            <span>Real-Time Optical Surveillance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Live Violence Detection
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl">
            Monitor live video and detect potential violent activity using AI.
          </p>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition self-start sm:self-auto ${
            showSettings
              ? 'bg-red-600 text-white border-red-500'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{showSettings ? 'Hide Settings' : 'Detection Settings'}</span>
        </button>
      </div>

      {/* Incident Alert Pop-down */}
      {incident && (
        <IncidentAlert
          incident={incident}
          onDismiss={() => setIncident(null)}
        />
      )}

      {/* Settings Panel Drawer */}
      {showSettings && (
        <DetectionSettings
          settings={settings}
          onChange={setSettings}
          onReset={resetSettings}
        />
      )}

      {/* Real-time Status Card row */}
      <LiveStatus
        currentPrediction={currentPrediction}
        smoothedProbability={smoothedProbability}
        threshold={settings.threshold / 100}
        framesAnalyzed={framesAnalyzed}
        fps={detectionFps}
        smoothingWindow={settings.smoothingWindow}
      />

      {/* Main Live Camera Feed Console */}
      <LiveCamera
        onPredictionUpdate={handlePredictionUpdate}
        onIncidentDetected={handleIncidentDetected}
        settings={settings}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      {/* Live Incident Log & Privacy Notice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Incident History */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Session Incident Feed
              </h3>
            </div>
            {liveLog.length > 0 && (
              <button
                onClick={clearLiveLogs}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center space-x-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Log</span>
              </button>
            )}
          </div>

          {liveLog.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No violence alerts recorded in this surveillance session. Normal activity logged.
            </div>
          ) : (
            <div className="divide-y divide-slate-800 max-h-60 overflow-y-auto pr-1">
              {liveLog.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-slate-300">{item.timestamp}</span>
                    <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-900/60 text-[10px]">
                      {item.type}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Confidence: <strong className="text-red-400">{item.confidence}%</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Privacy Notice Card */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Privacy & Security Notice</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              "Live video is processed for violence detection. Camera access can be stopped at any time. Webcam footage is not permanently stored unless you explicitly capture an incident snapshot."
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Client-side WebRTC Stream</span>
          </div>
        </div>
      </div>
    </div>
  );
}

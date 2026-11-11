import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Camera, 
  X, 
  Download, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export default function IncidentAlert({ incident, onDismiss }) {
  if (!incident) return null;

  const downloadSnapshot = () => {
    if (!incident.snapshotUrl) return;
    const a = document.createElement('a');
    a.href = incident.snapshotUrl;
    a.download = `incident_snapshot_${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div className="bg-red-950/80 border-2 border-red-600 rounded-2xl p-6 shadow-2xl shadow-red-950/50 animate-bounce-short space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-900/60 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-red-500 text-white font-bold tracking-wider">
                SECURITY ALERT
              </span>
              <span className="text-xs text-red-300 font-mono flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{incident.timestamp}</span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              ⚠️ VIOLENCE DETECTED IN CAMERA FEED
            </h2>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg bg-red-900/40 text-red-300 hover:text-white hover:bg-red-800 transition"
            aria-label="Dismiss Alert"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Captured Snapshot Thumbnail */}
        {incident.snapshotUrl && (
          <div className="relative rounded-xl overflow-hidden border border-red-500/50 bg-black aspect-video max-h-40 group">
            <img 
              src={incident.snapshotUrl} 
              alt="Incident Snapshot" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-red-950/30 group-hover:bg-transparent transition"></div>
            <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-red-300 flex items-center space-x-1">
              <Camera className="w-3 h-3" />
              <span>SNAPSHOT CAPTURED</span>
            </div>
          </div>
        )}

        {/* Incident Metrics & Details */}
        <div className={`space-y-2 ${incident.snapshotUrl ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-red-900/30 border border-red-800/40 rounded-lg p-2.5">
              <span className="text-red-300/70 block">DETECTION CONFIDENCE</span>
              <span className="text-xl font-bold text-white font-mono">
                {incident.confidence}%
              </span>
            </div>
            <div className="bg-red-900/30 border border-red-800/40 rounded-lg p-2.5">
              <span className="text-red-300/70 block">FRAMES PROCESSED</span>
              <span className="text-xl font-bold text-white font-mono">
                {incident.framesCount || 20}
              </span>
            </div>
          </div>

          <p className="text-xs text-red-200/90 leading-relaxed">
            The spatial-temporal CNN-LSTM detector has registered recurring violent movement patterns exceeding the active threshold. Incident snapshot saved to active session log.
          </p>

          <div className="flex items-center space-x-3 pt-2">
            {incident.snapshotUrl && (
              <button
                onClick={downloadSnapshot}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Snapshot</span>
              </button>
            )}
            <span className="text-[11px] text-red-300/80 font-mono">
              Alert cooldown active (prevents notification spam)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

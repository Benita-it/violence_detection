import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  ShieldCheck, 
  Film, 
  Gauge, 
  Clock, 
  Trash2, 
  Download, 
  Camera, 
  FileVideo, 
  Layers 
} from 'lucide-react';

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [liveEvents, setLiveEvents] = useState([]);

  useEffect(() => {
    try {
      const storedHistory = JSON.parse(localStorage.getItem('violence_detection_history') || '[]');
      const storedLive = JSON.parse(localStorage.getItem('live_detection_events') || '[]');
      setHistory(storedHistory);
      setLiveEvents(storedLive);
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
  }, []);

  const totalAnalyzed = history.length;
  const violenceCount = history.filter((h) => h.prediction === 'Violence Detected').length;
  const noViolenceCount = history.filter((h) => h.prediction === 'No Violence Detected').length;
  
  const avgConfidence = totalAnalyzed > 0
    ? (history.reduce((acc, h) => acc + Number(h.confidence || 0), 0) / totalAnalyzed).toFixed(1)
    : '0.0';

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all surveillance audit logs?')) {
      localStorage.removeItem('violence_detection_history');
      localStorage.removeItem('live_detection_events');
      setHistory([]);
      setLiveEvents([]);
    }
  };

  const exportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      summary: {
        totalAnalyzed,
        violenceCount,
        noViolenceCount,
        averageConfidence: avgConfidence,
      },
      auditLogs: history,
      liveIncidentLogs: liveEvents,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vigilai_surveillance_report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Surveillance Intelligence Metrics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Surveillance Analytics Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl">
            Aggregate diagnostics, historical classifications, and real-time security audit trails.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {history.length > 0 && (
            <button
              onClick={exportJSON}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Report</span>
            </button>
          )}
          {(history.length > 0 || liveEvents.length > 0) && (
            <button
              onClick={clearAllHistory}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-red-950/70 text-slate-400 hover:text-red-300 border border-slate-800 text-xs font-semibold transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyzed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Videos Analyzed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-mono">{totalAnalyzed}</p>
          <span className="text-[11px] text-slate-500 font-mono block">Across current browser cache</span>
        </div>

        {/* Violence Detected */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Violence Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-red-950/60 text-red-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-red-400 font-mono">{violenceCount}</p>
          <span className="text-[11px] text-red-500/80 font-mono block">
            {totalAnalyzed > 0 ? ((violenceCount / totalAnalyzed) * 100).toFixed(0) : 0}% of all uploads
          </span>
        </div>

        {/* No Violence Detected */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Normal / Peaceful</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 font-mono">{noViolenceCount}</p>
          <span className="text-[11px] text-emerald-500/80 font-mono block">
            {totalAnalyzed > 0 ? ((noViolenceCount / totalAnalyzed) * 100).toFixed(0) : 0}% peaceful clips
          </span>
        </div>

        {/* Average Confidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Confidence</span>
            <div className="w-8 h-8 rounded-lg bg-purple-950/60 text-purple-400 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-400 font-mono">{avgConfidence}%</p>
          <span className="text-[11px] text-slate-500 font-mono block">Mean CNN-LSTM certainty</span>
        </div>
      </div>

      {/* Main Analysis Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Surveillance Video Audit Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Historical video files analyzed during this session
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-400">
            {history.length} Entries
          </span>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <Film className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-sm font-medium text-slate-400">No video analysis history recorded yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload a video in the "Upload Video" tab or run live camera detection to generate diagnostic records.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Source Name / Mode</th>
                  <th className="px-4 py-3">Prediction</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Frames</th>
                  <th className="px-4 py-3">Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {history.map((entry) => {
                  const isViolence = entry.prediction === 'Violence Detected';
                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                        {entry.timestamp}
                      </td>
                      <td className="px-4 py-3.5 text-white font-semibold flex items-center space-x-2">
                        {entry.type === 'Live Stream' ? (
                          <Camera className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : (
                          <FileVideo className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                        <span className="truncate max-w-[180px] sm:max-w-xs">{entry.fileName}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            isViolence
                              ? 'bg-red-950/80 text-red-400 border border-red-800'
                              : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isViolence ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <span>{entry.prediction}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-bold">
                        <span className={isViolence ? 'text-red-400' : 'text-emerald-400'}>
                          {Number(entry.confidence).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                        {entry.framesAnalyzed || 20}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                        {entry.processingTime ? `${entry.processingTime}s` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Incidents Feed History */}
      {liveEvents.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Camera className="w-4 h-4 text-red-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Live Webcam Incident History
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {liveEvents.map((evt) => (
              <div 
                key={evt.id} 
                className="p-3 bg-slate-950/80 border border-red-900/50 rounded-xl space-y-1.5 text-xs font-mono"
              >
                <div className="flex justify-between items-center text-red-400">
                  <span className="font-bold flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>{evt.type}</span>
                  </span>
                  <span className="text-slate-400">{evt.timestamp}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Confidence: <strong className="text-white">{evt.confidence}%</strong></span>
                  <span>Frames: {evt.framesCount || 20}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

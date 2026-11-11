import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Zap, 
  BarChart2, 
  CheckCircle, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export default function PredictionCard({ result, fileName }) {
  if (!result) return null;

  const isViolence = result.prediction === 'Violence Detected';
  const confidencePercent = result.confidence_percentage 
    ? Number(result.confidence_percentage).toFixed(2)
    : (result.confidence ? (result.confidence * 100).toFixed(2) : '0.00');

  const framesCount = result.frames_analyzed || 0;
  const procTime = result.processing_time ? Number(result.processing_time).toFixed(2) : '0.00';

  return (
    <div 
      className={`rounded-2xl border p-6 sm:p-8 shadow-2xl transition-all ${
        isViolence
          ? 'bg-gradient-to-b from-red-950/40 to-slate-900 border-red-800/80 shadow-red-950/30'
          : 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-800/80 shadow-emerald-950/30'
      }`}
    >
      {/* Top Banner Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-4">
          <div 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
              isViolence
                ? 'bg-red-600 text-white border-red-400 shadow-red-900/60'
                : 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/60'
            }`}
          >
            {isViolence ? (
              <ShieldAlert className="w-8 h-8" />
            ) : (
              <ShieldCheck className="w-8 h-8" />
            )}
          </div>
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-slate-400">
              Inference Outcome
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <h2 
                className={`text-2xl sm:text-3xl font-black tracking-tight ${
                  isViolence ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {isViolence ? 'VIOLENCE DETECTED' : 'NO VIOLENCE DETECTED'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isViolence 
                ? 'High-probability physical altercation or violent interaction identified.' 
                : 'Surveillance sequence classified as peaceful and normal activity.'}
            </p>
          </div>
        </div>

        {/* Big Confidence Metric */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-5 py-3 text-right self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-mono block">MODEL CONFIDENCE</span>
          <span 
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isViolence ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {confidencePercent}%
          </span>
        </div>
      </div>

      {/* Confidence Bar Meter */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-400">
          <span>Decision Confidence Meter</span>
          <span>Threshold: 80.0%</span>
        </div>
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${
              isViolence 
                ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                : 'bg-gradient-to-r from-teal-500 to-emerald-500'
            }`}
            style={{ width: `${Math.min(Math.max(confidencePercent, 5), 100)}%` }}
          />
        </div>
      </div>

      {result.alert_triggered !== undefined && (
        <div className="mt-6 flex flex-wrap gap-2">
          {result.alert_triggered && (
            <span className="inline-flex items-center rounded-full border border-red-500/60 bg-red-900/60 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-red-200">
              Caregiver Alert Sent
            </span>
          )}
          {result.call_alert_triggered && (
            <span className="inline-flex items-center rounded-full border border-amber-500/60 bg-amber-900/60 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-200">
              Caregiver Call Initiated
            </span>
          )}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Frames Analyzed</span>
          </div>
          <p className="text-xl font-bold text-white font-mono">{framesCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Sampled @ 2-frame skips</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Processing Time</span>
          </div>
          <p className="text-xl font-bold text-white font-mono">{procTime}s</p>
          <p className="text-[11px] text-slate-500 mt-0.5">End-to-end inference</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Throughput</span>
          </div>
          <p className="text-xl font-bold text-white font-mono">
            {procTime > 0 ? (framesCount / procTime).toFixed(1) : '0'} FPS
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Processing rate</p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Architecture</span>
          </div>
          <p className="text-base font-bold text-white truncate">CNN + LSTM</p>
          <p className="text-[11px] text-slate-500 mt-0.5">TimeDistributed(20)</p>
        </div>
      </div>

      {/* Target Video Info Footer */}
      {fileName && (
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-slate-400" />
            <span>Source file: <strong className="text-slate-300">{fileName}</strong></span>
          </div>
          <span className="font-mono text-[11px] bg-slate-800/60 px-2 py-0.5 rounded text-slate-300">
            Status: Analysis Complete
          </span>
        </div>
      )}
    </div>
  );
}

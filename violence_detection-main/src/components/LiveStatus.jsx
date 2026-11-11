import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Gauge, 
  Layers, 
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function LiveStatus({ 
  currentPrediction, 
  smoothedProbability, 
  threshold = 0.5,
  framesAnalyzed = 0,
  fps = 5,
  smoothingWindow = 5
}) {
  const isViolence = smoothedProbability >= threshold;
  const smoothedPercent = (smoothedProbability * 100).toFixed(1);
  const thresholdPercent = (threshold * 100).toFixed(0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Real-time Status Card */}
      <div 
        className={`md:col-span-2 rounded-2xl p-5 border transition-all shadow-xl flex items-center justify-between ${
          isViolence
            ? 'bg-red-950/40 border-red-800/90 text-red-100 shadow-red-950/30'
            : 'bg-emerald-950/40 border-emerald-800/90 text-emerald-100 shadow-emerald-950/30'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg shrink-0 ${
              isViolence
                ? 'bg-red-600 border-red-400 text-white'
                : 'bg-emerald-600 border-emerald-400 text-white'
            }`}
          >
            {isViolence ? (
              <ShieldAlert className="w-8 h-8" />
            ) : (
              <ShieldCheck className="w-8 h-8" />
            )}
          </div>
          <div>
            <span className="text-[11px] uppercase font-mono tracking-wider opacity-75 block">
              Temporal Smoothed Status
            </span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight">
                {isViolence ? '🔴 VIOLENCE DETECTED' : '🟢 NORMAL ACTIVITY'}
              </span>
            </div>
            <p className="text-xs opacity-75 mt-0.5">
              {isViolence 
                ? 'Sustained violent motion patterns exceeding threshold' 
                : 'Routine non-violent motion patterns observed'}
            </p>
          </div>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[10px] font-mono opacity-60 block">THRESHOLD</span>
          <span className="font-mono font-bold text-sm">{thresholdPercent}%</span>
        </div>
      </div>

      {/* Smoothed Confidence Gauge */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center space-x-1.5 font-medium">
            <Gauge className="w-4 h-4 text-purple-400" />
            <span>Confidence</span>
          </span>
          <span className="font-mono text-[11px] text-slate-500">
            Avg({smoothingWindow})
          </span>
        </div>

        <div className="flex items-baseline space-x-2">
          <span 
            className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
              isViolence ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {smoothedPercent}%
          </span>
          <span className="text-xs text-slate-400 font-mono">prob</span>
        </div>

        {/* Mini progress bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-3 border border-slate-800">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              isViolence ? 'bg-red-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(Math.max(smoothedPercent, 5), 100)}%` }}
          />
        </div>
      </div>

      {/* Frame Metrics & FPS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5 font-medium">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Telemetry</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            LIVE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">PROCESSED</span>
            <span className="text-lg font-bold text-white font-mono">{framesAnalyzed}</span>
            <span className="text-[10px] text-slate-500 block">frames</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 block">INFERENCE</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">{fps || 5}</span>
            <span className="text-[10px] text-slate-500 block">FPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

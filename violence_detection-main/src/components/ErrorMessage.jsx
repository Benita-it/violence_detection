import React from 'react';
import { AlertOctagon, X, RefreshCw, Terminal, Info } from 'lucide-react';

export default function ErrorMessage({ error, onDismiss, onRetry }) {
  if (!error) return null;

  return (
    <div className="bg-red-950/50 border border-red-800 rounded-2xl p-6 shadow-2xl space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Processing Error</h3>
            <p className="text-sm text-red-200 mt-1 leading-relaxed">{error}</p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-red-400 hover:text-white hover:bg-red-900/50 transition"
            aria-label="Dismiss error"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs space-y-2 font-mono text-slate-300">
        <div className="flex items-center space-x-2 text-slate-400">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-200">Video Processing Notice:</span>
        </div>
        <p className="text-slate-400">
          Ensure your video is in a supported format (MP4, AVI, MOV, MKV, WEBM) and under 100MB.
        </p>
      </div>

      {onRetry && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onRetry}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}
    </div>
  );
}

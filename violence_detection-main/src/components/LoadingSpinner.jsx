import React, { useState, useEffect } from 'react';
import { Loader2, Upload, Film, Cpu, CheckCircle2, Circle } from 'lucide-react';

export default function LoadingSpinner({ uploadProgress = 0 }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Simulate smooth progression across processing stages
  useEffect(() => {
    let t1, t2, t3;
    if (uploadProgress >= 100) {
      setCurrentStep(2);
      t1 = setTimeout(() => setCurrentStep(3), 1800);
      t2 = setTimeout(() => setCurrentStep(4), 3600);
    } else {
      setCurrentStep(1);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [uploadProgress]);

  const steps = [
    {
      id: 1,
      title: 'Uploading video',
      desc: uploadProgress < 100 ? `Transmitting payload (${uploadProgress}%)` : 'Upload completed',
      icon: Upload,
    },
    {
      id: 2,
      title: 'Extracting frames',
      desc: 'OpenCV sampling 224×224 frames & sequence windowing',
      icon: Film,
    },
    {
      id: 3,
      title: 'Running AI model',
      desc: 'CNN spatial extraction & LSTM temporal pattern inference',
      icon: Cpu,
    },
    {
      id: 4,
      title: 'Generating prediction',
      desc: 'Aggregating sequence probabilities & confidence scoring',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-inner">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">Analyzing Video...</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Please wait while the OpenCV pipeline and CNN-LSTM deep learning neural network process the surveillance footage.
        </p>
      </div>

      {/* Upload Progress Bar if still uploading */}
      {uploadProgress < 100 && (
        <div className="max-w-md mx-auto space-y-1.5 text-left">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Network Upload</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div 
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="max-w-md mx-auto text-left space-y-3 pt-2 border-t border-slate-800">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div 
              key={step.id} 
              className={`flex items-start space-x-3 p-3 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-slate-800/80 border-red-500/40 text-white'
                  : isDone
                  ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                  : 'bg-transparent border-transparent text-slate-600'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-700" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-semibold ${isCurrent ? 'text-white' : isDone ? 'text-slate-300' : 'text-slate-500'}`}>
                    {step.title}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                      Processing
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

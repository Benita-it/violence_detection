import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Video, 
  Camera, 
  Cpu, 
  Layers, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  Zap, 
  Database,
  BarChart2
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-14 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/80 text-red-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Final Year College AI/ML Project • CNN-LSTM Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-orange-400">Violence Detection</span> from Video
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            An automated computer vision surveillance system using deep spatial-temporal neural networks. 
            Analyzes recorded security footage and live webcam streams with 
            <strong className="text-white"> OpenCV</strong>, <strong className="text-white">TimeDistributed CNNs</strong>, and <strong className="text-white">LSTMs</strong>.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/upload"
              className="flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-xl shadow-red-950/50 hover:shadow-red-900/60 transition active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>Analyze Video File</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/live"
              className="flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-sm transition"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Live Webcam Detection</span>
            </Link>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center space-x-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>224×224 Frame Ingestion</span>
          </div>
          <div className="flex items-center space-x-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>20-Frame Temporal Window</span>
          </div>
          <div className="flex items-center space-x-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sub-Second Latency</span>
          </div>
          <div className="flex items-center space-x-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dual Surveillance Modes</span>
          </div>
        </div>
      </section>

      {/* Two Major Detection Modes Selection */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Surveillance Deployment Modes
          </h2>
          <p className="text-sm text-slate-400">
            Select between batch analysis for recorded surveillance evidence or real-time camera monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Upload Video */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-8 shadow-xl transition space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner group-hover:scale-105 transition">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Analyze Recorded Video
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload CCTV footage or video clips in MP4, AVI, MOV, MKV, or WEBM format (up to 100MB). 
                The system extracts 20-frame sequences, evaluates every window, and calculates confidence ratings with processing statistics.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>Drag-and-drop video uploader</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>Interactive HTML5 video playback preview</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>Comprehensive spatial-temporal diagnostic card</span>
                </li>
              </ul>
            </div>

            <Link
              to="/upload"
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-200 font-semibold text-sm transition flex items-center justify-center space-x-2 border border-slate-700"
            >
              <span>Upload Video</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Live Webcam Detection */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-8 shadow-xl transition space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner group-hover:scale-105 transition">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Detect Violence using Live Camera
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect your device's webcam directly for real-time surveillance. Frames are continuously captured into a rolling 20-frame buffer, stabilized via temporal smoothing, and triggered with instant incident snapshots.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-mono">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  <span>Direct WebRTC webcam stream</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  <span>Rolling buffer with 5-window temporal smoothing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  <span>Automated canvas incident snapshots & alerts</span>
                </li>
              </ul>
            </div>

            <Link
              to="/live"
              className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-200 font-semibold text-sm transition flex items-center justify-center space-x-2 border border-slate-700"
            >
              <span>Launch Live Camera</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* End-to-End Pipeline Architecture Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs uppercase font-mono tracking-wider text-red-400">
            System Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Spatial-Temporal Violence Detection Works
          </h2>
          <p className="text-sm text-slate-400">
            Single images cannot distinguish violence (e.g. hugging vs. wrestling). Our stacked CNN-LSTM evaluates both spatial pose and temporal velocity across sequential frames.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">STEP 1</span>
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <Eye className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Video Input</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Video stream or file is ingested via OpenCV cv2.VideoCapture or WebRTC camera buffer.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">STEP 2</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Frame Preprocessing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Frames resized to 224×224, normalized to [0, 1], and grouped into sequences of 20 frames.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">STEP 3</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">CNN Feature Maps</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              TimeDistributed Conv2D layers extract spatial features (posture, limbs, objects) from each frame.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">STEP 4</span>
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">LSTM Sequence Modeling</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              LSTM memory cells model motion vectors, velocity, and sudden aggressive movements across time.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">STEP 5</span>
            <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Decision & Alert</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sigmoid activation produces violence probability, smoothed over time to trigger incident alarms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

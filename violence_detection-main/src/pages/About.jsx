import React from 'react';
import { 
  Cpu, 
  Layers, 
  Activity, 
  Eye, 
  ShieldAlert, 
  GraduationCap, 
  CheckCircle2, 
  FileCode, 
  AlertTriangle,
  Server,
  Zap
} from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-12 py-4 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-8 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono">
          <GraduationCap className="w-4 h-4 text-red-400" />
          <span>Final-Year Engineering Project • AI / Computer Vision / Full-Stack</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          System Architecture & Technical Foundations
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
          An in-depth analysis of the spatial-temporal deep learning methodology, OpenCV preprocessing pipeline, and full-stack engineering powering automated violence detection in surveillance video.
        </p>
      </div>

      {/* Why Spatial-Temporal? The Core Challenge */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              The Spatial vs. Temporal Challenge in Video
            </h2>
            <p className="text-xs text-slate-400 font-mono">Why single-frame image classifiers fail on video</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Standard 2D Convolutional Neural Networks (like ResNet or VGG) evaluate isolated static frames. In real-world surveillance, an isolated frame of two people hugging, dancing, or high-fiving often looks virtually identical to the onset of a physical brawl or tackle.
        </p>

        <p className="text-sm text-slate-300 leading-relaxed">
          Violence is an inherently <strong className="text-white">temporal phenomenon</strong> characterized by rapid acceleration, abnormal limb velocity, chaotic trajectory shifts, and sudden impact. To classify video reliably, a system must fuse <strong className="text-white">spatial feature maps</strong> with <strong className="text-white">sequential memory</strong> over time.
        </p>
      </section>

      {/* The Three Pillars: OpenCV, CNN, LSTM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: OpenCV Preprocessing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            1. OpenCV Pipeline
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The backend ingests videos using <code className="text-blue-400 font-mono">cv2.VideoCapture</code>. Instead of saturating GPU memory with 30-60 FPS footage, it applies an adaptive frame-skip interval to capture representative action frames.
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 font-mono pt-2 border-t border-slate-800">
            <li>• Uniform resizing to 224×224 px</li>
            <li>• BGR → RGB color conversion</li>
            <li>• Min-Max normalization [0.0, 1.0]</li>
            <li>• Sequence slicing (20 frames/window)</li>
          </ul>
        </div>

        {/* Pillar 2: CNN Spatial Features */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            2. TimeDistributed CNN
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Keras's <code className="text-purple-400 font-mono">TimeDistributed</code> layer wraps 2D Conv layers so the exact same weights are applied synchronously across all 20 frames in each sequence window.
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 font-mono pt-2 border-t border-slate-800">
            <li>• Conv2D filters (32, 64)</li>
            <li>• MaxPool2D dimensionality reduction</li>
            <li>• Spatial posture & limb extraction</li>
            <li>• Flattened 1D spatial feature vector</li>
          </ul>
        </div>

        {/* Pillar 3: LSTM Temporal Memory */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            3. Recurrent LSTM Cell
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Long Short-Term Memory cells receive the ordered sequence of 20 spatial vectors. With internal gates (Input, Forget, Output), it retains contextual dynamics and motion velocity across time.
          </p>
          <ul className="text-xs text-slate-300 space-y-1.5 font-mono pt-2 border-t border-slate-800">
            <li>• 64 memory hidden units</li>
            <li>• Dropout (0.5) to prevent overfitting</li>
            <li>• Dense ReLU classification layer</li>
            <li>• Sigmoid output: [0.0 → 1.0] probability</li>
          </ul>
        </div>
      </div>

      {/* Model Architectural Specification */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">CNN-LSTM Neural Network Specification</h3>
              <p className="text-xs text-slate-400 font-mono">Input Tensor: (Batch, Sequence_Length=20, Height=224, Width=224, Channels=3)</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-red-950/80 text-red-400 border border-red-800">
            Binary Classification
          </span>
        </div>

        {/* Architecture flow diagram */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs font-mono space-y-3 text-slate-300 overflow-x-auto">
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-red-400 font-bold">Input Layer:</span>
            <span>(None, 20, 224, 224, 3)</span>
          </div>
          <div className="pl-4 border-l border-slate-800 space-y-2">
            <div>↓ TimeDistributed(Conv2D(32, (3,3), activation='relu'))</div>
            <div>↓ TimeDistributed(MaxPooling2D((2,2)))</div>
            <div>↓ TimeDistributed(Conv2D(64, (3,3), activation='relu'))</div>
            <div>↓ TimeDistributed(MaxPooling2D((2,2)))</div>
            <div>↓ TimeDistributed(Flatten()) → Produces 20 sequential spatial feature vectors</div>
            <div>↓ LSTM(64, return_sequences=False) → Models temporal motion dynamics</div>
            <div>↓ Dense(128, activation='relu')</div>
            <div>↓ Dropout(0.5)</div>
            <div>↓ Dense(1, activation='sigmoid') → Violence Probability Output</div>
          </div>
        </div>
      </section>

      {/* Critical Surveillance Metrics: Why Accuracy is Insufficient */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Evaluation Metrics in Automated Surveillance
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              The Critical Role of Precision, Recall, and the Confusion Matrix
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          In real-world security systems, <strong className="text-white">raw classification accuracy is dangerous and misleading</strong>. In typical CCTV environments, 99.5% of recorded activity is peaceful and non-violent. A naive model that predicts "No Violence" on every single frame would achieve 99.5% accuracy while completely failing to detect actual assaults.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-red-400 font-mono">High False Positives (Low Precision)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Causes alarm fatigue. Security operators are flooded with dozens of false alerts for celebratory hugging, dancing, or sports, leading them to mute or ignore the system.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-amber-400 font-mono">High False Negatives (Low Recall)</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catastrophic failure. An active violent assault or altercation occurs on camera, but the system fails to recognize it and does not alert first responders.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

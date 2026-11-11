import React, { useEffect, useState, useRef } from 'react';
import { Film, Eye, Clock, Shield } from 'lucide-react';

export default function VideoPreview({ file }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setVideoUrl('');
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!file || !videoUrl) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-slate-400" />
          <h3 className="text-base font-semibold text-white">Surveillance Playback Preview</h3>
        </div>
        <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
          {videoDuration && (
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{formatTime(videoDuration)}</span>
            </span>
          )}
          {dimensions && (
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {dimensions.width}×{dimensions.height}
            </span>
          )}
        </div>
      </div>

      {/* Video Player Container */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center aspect-video max-h-[420px]">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>

        {/* HUD watermark tag */}
        <div className="absolute top-3 left-3 pointer-events-none flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-slate-700/60 text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>INPUT STREAM</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center space-x-1.5 truncate">
          <Film className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{file.name}</span>
        </div>
        <span className="text-slate-400 text-right shrink-0">Model sequence sampler: 20 frames @ 224px</span>
      </div>
    </div>
  );
}

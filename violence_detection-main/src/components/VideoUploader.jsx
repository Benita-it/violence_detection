import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, AlertCircle, CheckCircle2, PlayCircle, X } from 'lucide-react';
import { initializeAlertSound } from '../utils/alertSound';

const ALLOWED_EXTENSIONS = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
const MAX_FILE_SIZE_MB = 100;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function VideoUploader({ onFileSelect, onAnalyze, isAnalyzing, selectedFile, onClear }) {
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;

    // Check extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      setValidationError(
        `Unsupported file type ".${extension}". Only ${ALLOWED_EXTENSIONS.map((e) => '.' + e).join(', ')} are supported.`
      );
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setValidationError(
        `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`
      );
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleFiles = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Upload Video Footage</h2>
          <p className="text-sm text-slate-400">
            Submit recorded surveillance clips for spatial-temporal violence classification
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
          Max {MAX_FILE_SIZE_MB}MB
        </span>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start space-x-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">File Validation Error</p>
            <p className="text-xs text-red-400/90 mt-0.5">{validationError}</p>
          </div>
          <button 
            onClick={() => setValidationError('')} 
            className="text-red-400 hover:text-red-200"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-red-500 bg-red-950/20'
            : selectedFile
            ? 'border-emerald-500/50 bg-slate-950/40'
            : 'border-slate-700 hover:border-slate-600 bg-slate-950/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp4,.avi,.mov,.mkv,.webm"
          onChange={handleChange}
          className="hidden"
          disabled={isAnalyzing}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-inner">
              <UploadCloud className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="text-base font-medium text-slate-200">
                Drag and drop your video here, or{' '}
                <span className="text-red-400 hover:underline">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: MP4, AVI, MOV, MKV, WEBM (up to 100MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/50 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                <FileVideo className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-slate-100 max-w-[220px] sm:max-w-xs truncate">
                    {selectedFile.name}
                  </p>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Size: {formatFileSize(selectedFile.size)} • Ready for CNN-LSTM processing
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition"
              >
                Change
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isAnalyzing}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 transition"
                aria-label="Remove selected video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-400 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          <span>OpenCV will extract 20-frame sequences at 224×224 resolution</span>
        </div>

        <button
          onClick={async () => {
            await initializeAlertSound();
            onAnalyze();
          }}
          disabled={!selectedFile || isAnalyzing}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg ${
            !selectedFile || isAnalyzing
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30 hover:shadow-red-900/50 active:scale-95'
          }`}
        >
          <PlayCircle className="w-5 h-5" />
          <span>{isAnalyzing ? 'Analyzing Pipeline Active...' : 'Analyze Video'}</span>
        </button>
      </div>
    </div>
  );
}

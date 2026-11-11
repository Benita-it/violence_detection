import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import UploadDetection from './pages/UploadDetection';
import LiveDetection from './pages/LiveDetection';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-red-500 selection:text-white">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<UploadDetection />} />
            <Route path="/live" element={<LiveDetection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/50 py-6 text-center text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>AI Violence Detection • Final-Year AI/ML College Project</span>
            <span>CNN-LSTM Model • OpenCV Video Pipeline • FastAPI Backend</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

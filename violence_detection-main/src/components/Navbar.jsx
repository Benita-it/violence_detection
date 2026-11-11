import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  Video, 
  Camera, 
  BarChart3, 
  Info, 
  Activity, 
  Menu, 
  X,
  Server
} from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const testHealth = async () => {
      const res = await checkHealth();
      if (isMounted) {
        setBackendStatus(res.connected ? 'online' : 'offline');
      }
    };

    testHealth();
    const interval = setInterval(testHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Activity },
    { to: '/upload', label: 'Upload Video', icon: Video },
    { to: '/live', label: 'Live Detection', icon: Camera },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/about', label: 'About', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all shadow-lg shadow-red-950/40">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight flex items-center gap-2">
                <span>VigilAI</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                  CNN-LSTM
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">AI Surveillance & Violence Detection</p>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Backend Status Indicator */}
          <div className="hidden sm:flex items-center space-x-3">
            <div 
              title={
                backendStatus === 'online'
                  ? 'Surveillance AI Backend is active and connected'
                  : 'Surveillance AI Backend is standby/initializing'
              }
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300"
            >
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>Backend:</span>
              <span className="flex items-center space-x-1">
                <span 
                  className={`w-2 h-2 rounded-full ${
                    backendStatus === 'online'
                      ? 'bg-emerald-500 animate-pulse'
                      : backendStatus === 'offline'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`} 
                />
                <span className={backendStatus === 'online' ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                  {backendStatus === 'online' ? 'Connected' : 'Standby'}
                </span>
              </span>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-4">
            <span>FastAPI Server Status:</span>
            <span className={`font-semibold ${backendStatus === 'online' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {backendStatus === 'online' ? 'Active (Port 8000)' : 'Standby'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

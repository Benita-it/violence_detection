import React from 'react';
import { 
  Sliders, 
  Bell, 
  ShieldCheck, 
  RotateCcw, 
  HelpCircle 
} from 'lucide-react';

export default function DetectionSettings({ 
  settings, 
  onChange, 
  onReset 
}) {
  const handleNotificationToggle = async (e) => {
    const checked = e.target.checked;
    if (checked) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          onChange({ ...settings, notifications: true });
        } else {
          alert('Notification permission was not granted by browser.');
          onChange({ ...settings, notifications: false });
        }
      } else {
        alert('Browser notifications are not supported in this browser.');
        onChange({ ...settings, notifications: false });
      }
    } else {
      onChange({ ...settings, notifications: false });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-white tracking-tight">Detection Configuration</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Detection Threshold */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Violence Probability Threshold</span>
            <span className="font-mono text-red-400 font-bold">{settings.threshold}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={settings.threshold}
            onChange={(e) => onChange({ ...settings, threshold: Number(e.target.value) })}
            className="w-full accent-red-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          <p className="text-[11px] text-slate-500">
            Higher values reduce false positives; lower values increase surveillance sensitivity.
          </p>
        </div>

        {/* Sampling Rate (FPS) */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Frame Sampling Rate</span>
            <span className="font-mono text-blue-400 font-bold">
              {Math.round(1000 / settings.interval)} FPS ({settings.interval}ms)
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="500"
            step="50"
            value={settings.interval}
            onChange={(e) => onChange({ ...settings, interval: Number(e.target.value) })}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          <p className="text-[11px] text-slate-500">
            Controls capture interval. 200ms (~5 FPS) is optimal for 20-frame sequence generation.
          </p>
        </div>

        {/* Temporal Smoothing Window */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Temporal Smoothing Window</span>
            <span className="font-mono text-purple-400 font-bold">
              Last {settings.smoothingWindow} predictions
            </span>
          </div>
          <input
            type="range"
            min="3"
            max="10"
            step="1"
            value={settings.smoothingWindow}
            onChange={(e) => onChange({ ...settings, smoothingWindow: Number(e.target.value) })}
            className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          <p className="text-[11px] text-slate-500">
            Moving average window size to mitigate transient false spikes.
          </p>
        </div>

        {/* Alert Cooldown */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Alert Cooldown Interval</span>
            <span className="font-mono text-amber-400 font-bold">{settings.cooldown} seconds</span>
          </div>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={settings.cooldown}
            onChange={(e) => onChange({ ...settings, cooldown: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
          <p className="text-[11px] text-slate-500">
            Delay duration before triggering subsequent incident alarms.
          </p>
        </div>
      </div>

      {/* Browser Notification Opt-in */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <label htmlFor="browser-notify" className="text-xs font-semibold text-slate-200 block cursor-pointer">
              Enable Browser Desktop Notifications
            </label>
            <span className="text-[11px] text-slate-400 block">
              Requests permission on check; sends desktop alerts on violence detection.
            </span>
          </div>
        </div>

        <input
          id="browser-notify"
          type="checkbox"
          checked={!!settings.notifications}
          onChange={handleNotificationToggle}
          className="w-5 h-5 accent-red-500 rounded cursor-pointer"
        />
      </div>
    </div>
  );
}

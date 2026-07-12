import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export function Toast({ toast, removeToast }) {
  const { id, message, type = 'info', duration = 5000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, removeToast]);

  const config = {
    success: {
      borderColor: 'border-emerald-500/40',
      shadowColor: 'rgba(16, 185, 129, 0.15)',
      bgColor: 'bg-emerald-950/40',
      iconColor: 'text-emerald-400',
      icon: CheckCircle
    },
    error: {
      borderColor: 'border-accent-pink/40',
      shadowColor: 'rgba(255, 0, 122, 0.15)',
      bgColor: 'bg-rose-950/40',
      iconColor: 'text-accent-pink',
      icon: AlertTriangle
    },
    info: {
      borderColor: 'border-accent-cyan/40',
      shadowColor: 'rgba(0, 240, 255, 0.15)',
      bgColor: 'bg-cyan-950/40',
      iconColor: 'text-accent-cyan',
      icon: Info
    }
  };

  const style = config[type] || config.info;
  const Icon = style.icon;

  return (
    <div
      style={{ boxShadow: `0 8px 30px ${style.shadowColor}` }}
      className={`glass-panel ${style.bgColor} ${style.borderColor} p-4 rounded-xl border flex items-start gap-3 w-80 md:w-96 transform transition-all duration-300 animate-slide-in relative overflow-hidden`}
    >
      {/* Decorative accent side bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.iconColor.replace('text', 'bg')}`} />
      
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
      <div className="flex-1 text-sm text-slate-200 pr-2">
        {message}
      </div>
      <button
        onClick={() => removeToast(id)}
        className="text-slate-400 hover:text-white transition-colors duration-150 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} removeToast={removeToast} />
        </div>
      ))}
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-white border-green-200 shadow-green-100/50 text-green-800',
    error: 'bg-white border-red-200 shadow-red-100/50 text-red-800',
    info: 'bg-white border-blue-200 shadow-blue-100/50 text-blue-800',
    warning: 'bg-white border-amber-200 shadow-amber-100/50 text-amber-800',
  };

  const Icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle,
  };

  const IconComponent = Icons[type];

  return (
    <div className={`fixed bottom-10 right-10 z-50 flex items-center gap-3 px-5 py-4 border rounded-2xl shadow-xl animate-in slide-in-from-right-10 duration-300 ${bgColors[type]}`}>
      <IconComponent className={`w-5 h-5 shrink-0 ${type === 'success' ? 'text-green-500' : type === 'error' ? 'text-red-500' : type === 'info' ? 'text-blue-500' : 'text-amber-500'}`} />
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors ml-2 text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

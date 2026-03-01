'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastContextType {
  showToast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-100 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300);
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: 'bg-green-50 border-green-400', icon: '✅', text: 'text-green-800' },
    error: { bg: 'bg-red-50 border-red-400', icon: '❌', text: 'text-red-800' },
    info: { bg: 'bg-blue-50 border-blue-400', icon: 'ℹ️', text: 'text-blue-800' },
    warning: { bg: 'bg-yellow-50 border-yellow-400', icon: '⚠️', text: 'text-yellow-800' },
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto border-l-4 rounded-lg shadow-lg p-4 flex items-start gap-3 transition-all duration-300 ${config.bg} ${
        visible && !exiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <span className="text-lg shrink-0">{config.icon}</span>
      <p className={`text-sm font-medium flex-1 ${config.text}`}>{toast.message}</p>
      <button onClick={() => { setExiting(true); setTimeout(onClose, 300); }} className={`shrink-0 ${config.text} hover:opacity-70`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

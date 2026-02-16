import React, { createContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContext = createContext();

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastColors = {
  success: 'bg-green-500/20 border-green-500/30 text-green-200',
  error: 'bg-red-500/20 border-red-500/30 text-red-200',
  info: 'bg-blue-500/20 border-blue-500/30 text-blue-200',
  warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[300] flex flex-col gap-3 items-center sm:items-end pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = toastIcons[t.type];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-2xl shadow-2xl w-full sm:w-auto sm:min-w-[320px] max-w-md pointer-events-auto ${toastColors[t.type]}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <p className="flex-1 text-[11px] sm:text-sm font-bold uppercase tracking-widest leading-tight">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Hook for easy access to toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    // Return a no-op function if used outside provider
    return {
      success: () => { },
      error: () => { },
      info: () => { },
      warning: () => { },
    };
  }
  return context;
};

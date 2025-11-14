import React, { createContext, useContext, useState } from 'react';
import { ToastContainer } from '../components/ui/toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  hasActiveThreats: boolean;
  setHasActiveThreats: (hasThreats: boolean) => void;
  hasActiveAlarms: boolean;
  setHasActiveAlarms: (hasAlarms: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasActiveThreats, setHasActiveThreats] = useState(false);
  const [hasActiveAlarms, setHasActiveAlarms] = useState(false);

  const addToast = (message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, hasActiveThreats, setHasActiveThreats, hasActiveAlarms, setHasActiveAlarms }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
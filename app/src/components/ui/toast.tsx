import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast, type Toast } from '@/providers/ToastProvider';
import '../../css/toast.css';

export function ToastContainer() {
  const { toasts, removeToast, hasActiveThreats, hasActiveAlarms } = useToast();
  
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast} 
          hasActiveThreats={hasActiveThreats} 
          hasActiveAlarms={hasActiveAlarms} 
        />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  hasActiveThreats: boolean;
  hasActiveAlarms: boolean;
}

function ToastItem({ toast, onRemove, hasActiveThreats, hasActiveAlarms }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300); // Match animation duration
  };

  // Priority: THREAT > ALARM > default green for success toasts
  let toastClass = `toast-${toast.type}`;
  if (toast.type === 'success') {
    if (hasActiveThreats) {
      toastClass = 'toast-success-threat';
    } else if (hasActiveAlarms) {
      toastClass = 'toast-success-alarm';
    }
  }

  return (
    <div className={`toast ${toastClass} ${isVisible ? 'toast-visible' : ''}`}>
      <span className="toast-message">{toast.message}</span>
      <button 
        className="toast-close" 
        onClick={handleRemove}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
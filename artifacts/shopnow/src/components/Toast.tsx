import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const toastConfig: Record<
  ToastType,
  { bg: string; border: string; icon: React.ReactNode; textColor: string }
> = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-900',
    icon: (
      <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
    ),
    textColor: 'text-green-800 dark:text-green-100',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-900',
    icon: <AlertCircle size={20} className="text-red-600 dark:text-red-400" />,
    textColor: 'text-red-800 dark:text-red-100',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-900',
    icon: <Info size={20} className="text-blue-600 dark:text-blue-400" />,
    textColor: 'text-blue-800 dark:text-blue-100',
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}) {
  const [isClosing, setIsClosing] = useState(false);
  const config = toastConfig[toast.type];

  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(() => onRemove(toast.id), 300); // Match animation duration
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isClosing ? 'opacity-0 translate-x-96' : 'opacity-100 translate-x-0'
      }`}
    >
      <div
        className={`flex items-center gap-3 ${config.bg} border ${config.border} rounded-lg p-4 shadow-lg max-w-md`}
      >
        {config.icon}
        <p className={`flex-1 text-sm font-medium ${config.textColor}`}>
          {toast.message}
        </p>
        <button
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => onRemove(toast.id), 300);
          }}
          className={`flex-shrink-0 transition-colors ${config.textColor} hover:opacity-70`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

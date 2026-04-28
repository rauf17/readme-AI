import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({ message, isVisible, onClose }: ToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-dark-surface-elevated/80 backdrop-blur-xl border border-border-default rounded-glass shadow-float text-text-primary">
        <CheckCircle2 className="w-5 h-5 text-success" />
        <span className="font-sans text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

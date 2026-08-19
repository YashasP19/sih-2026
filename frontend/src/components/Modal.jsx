import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-civic-ink/40 backdrop-blur-sm transition-opacity animate-fade-in dark:bg-black/60"
      />

      <div
        className={`relative w-full ${maxWidth} bg-white border border-civic-line rounded-2xl shadow-lift z-10 overflow-hidden transform transition-all animate-scale-up dark:bg-civic-night-paper dark:border-civic-night-line dark:shadow-lift-dark`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-civic-line bg-civic-paper dark:border-civic-night-line dark:bg-civic-night">
          <h3 className="text-lg font-bold text-civic-ink dark:text-slate-100 font-display">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-civic-mute hover:text-civic-ink hover:bg-civic-sand transition-colors dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

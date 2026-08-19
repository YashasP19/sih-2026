import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast() {
  const { toasts, removeToast } = useNotification();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-5 right-5 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
        let border = 'border-sky-200 bg-white text-sky-900 dark:border-sky-800 dark:bg-civic-night-paper dark:text-sky-200';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
          border = 'border-emerald-200 bg-white text-emerald-900 dark:border-emerald-800 dark:bg-civic-night-paper dark:text-emerald-200';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
          border = 'border-rose-200 bg-white text-rose-900 dark:border-rose-800 dark:bg-civic-night-paper dark:text-rose-200';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lift transition-all duration-300 animate-slide-up dark:shadow-lift-dark ${border}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-civic-mute hover:text-civic-ink transition-colors dark:text-slate-400 dark:hover:text-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

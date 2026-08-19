import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ text = 'Analyzing and loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-civic-mist/80 backdrop-blur-md dark:bg-civic-night/80">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-civic-teal/20 border-t-civic-teal animate-spin dark:border-teal-500/20 dark:border-t-teal-400" />
        </div>
        <p className="mt-4 text-sm font-medium text-civic-mute dark:text-slate-400 animate-pulse">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="w-8 h-8 text-civic-teal dark:text-teal-400 animate-spin" />
      {text && <p className="mt-3 text-sm text-civic-mute dark:text-slate-400 font-medium">{text}</p>}
    </div>
  );
}

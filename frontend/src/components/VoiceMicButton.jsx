import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';

/**
 * Mic control that appends speech-to-text into a target string field.
 * @param {(updater: (prev: string) => string) => void} onTranscript
 */
export default function VoiceMicButton({ onTranscript, className = '', title = 'Speak your complaint' }) {
  const { listening, supported, error, toggle, stop, clearError } = useSpeechToText();

  const handleClick = () => {
    if (!supported) return;
    clearError?.();
    toggle(({ finalText }) => {
      if (!finalText?.trim()) return;
      onTranscript((prev) => {
        const base = (prev || '').trim();
        const next = finalText.trim();
        return base ? `${base} ${next}` : next;
      });
    });
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title="Voice input is not supported in this browser"
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-civic-line text-civic-mute bg-civic-sand opacity-60 cursor-not-allowed ${className}`}
      >
        <MicOff className="w-3.5 h-3.5" />
        Voice N/A
      </button>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-1 max-w-[220px]">
      <button
        type="button"
        onClick={handleClick}
        title={listening ? 'Stop listening' : title}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
          listening
            ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md'
            : 'bg-civic-teal-soft text-civic-teal-dark border-civic-teal/30 hover:bg-civic-teal hover:text-white'
        } ${className}`}
      >
        {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        {listening ? 'Listening…' : 'Speak'}
      </button>
      {error && (
        <p className="text-[10px] text-rose-600 dark:text-rose-400 text-right leading-snug">
          {error}
        </p>
      )}
      {listening && (
        <button type="button" onClick={stop} className="text-[10px] text-civic-mute underline">
          Stop mic
        </button>
      )}
    </div>
  );
}

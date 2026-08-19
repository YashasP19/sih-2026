import React from 'react';

export default function Card({ children, className = '', glow = false, hover = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 transition-all duration-300 border ${
        glow
          ? 'bg-civic-teal-soft/40 border-civic-teal/25 shadow-lift dark:bg-teal-950/30 dark:border-teal-500/25 dark:shadow-lift-dark'
          : 'bg-white/95 border-civic-line/80 shadow-soft backdrop-blur-sm dark:bg-white/[0.06] dark:border-white/10 dark:backdrop-blur-xl dark:shadow-soft-dark'
      } ${hover ? 'hover:border-civic-teal/35 hover:shadow-lift hover:-translate-y-0.5 dark:hover:border-teal-500/35 dark:hover:shadow-lift-dark' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

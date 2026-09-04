import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto py-8 border-t border-civic-line bg-white/70 text-center dark:bg-civic-night-paper/70 dark:border-civic-night-line">
      <p className="text-xs text-civic-mute dark:text-slate-400">
        © 2026 Urban Lens · Smart India Hackathon 2026
      </p>
      <p className="mt-2 text-sm font-bold tracking-wide text-civic-ink dark:text-slate-100">
        Connecting Citizens, Universities & Industry · CODE COMMITERS
      </p>
    </footer>
  );
}
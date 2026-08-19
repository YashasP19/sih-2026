import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const theme = useContext(ThemeContext);

  if (!theme) return null;

  const { isDark, toggleTheme } = theme;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-civic-sand hover:bg-civic-teal-soft text-civic-mute hover:text-civic-ink transition-all duration-200 border border-civic-line dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-slate-100 dark:border-slate-600"
      aria-label="Toggle Theme"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-civic-teal" />}
    </button>
  );
}

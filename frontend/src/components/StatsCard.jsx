import React from 'react';
import Card from './Card';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    purple: 'bg-civic-teal-soft text-civic-teal-dark border-civic-teal/25 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    teal: 'bg-civic-teal-soft text-civic-teal-dark border-civic-teal/25 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    brown: 'bg-[#F3E3DC] text-[#6E3427] border-[#D0876C]/40 dark:bg-[#2E140F]/60 dark:text-[#E9C3B2] dark:border-[#8A4231]/50',
  };

  const accentMap = {
    blue: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    purple: 'bg-civic-teal dark:bg-teal-500',
    teal: 'bg-civic-teal dark:bg-teal-500',
    indigo: 'bg-indigo-500',
    brown: 'bg-[#6E3427]',
  };

  const activeColor = colorMap[color] || colorMap.teal;
  const accent = accentMap[color] || accentMap.teal;

  return (
    <Card className="relative overflow-hidden group" hover={true}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-civic-mute dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-extrabold text-civic-ink dark:text-slate-100 mt-2 tracking-tight font-display">{value}</h3>
          {subtitle && <p className="text-xs text-civic-mute dark:text-slate-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span>↑ {trend}</span>
              <span className="text-civic-mute dark:text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-xl border ${activeColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
}

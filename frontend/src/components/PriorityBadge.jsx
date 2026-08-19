import React from 'react';
import { URGENCY_LEVELS } from '../utils/constants';
import { Flame, AlertCircle, Info, ShieldAlert } from 'lucide-react';

export default function PriorityBadge({ urgency, score }) {
  const config = URGENCY_LEVELS[urgency] || URGENCY_LEVELS.MEDIUM;

  const getIcon = () => {
    switch (urgency) {
      case 'CRITICAL':
        return <Flame className="w-3.5 h-3.5 text-rose-600 animate-bounce" />;
      case 'HIGH':
        return <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />;
      case 'MEDIUM':
        return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-civic-mute" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.bg}`}
      title={score ? `Priority Score: ${score}/100` : ''}
    >
      {getIcon()}
      <span>{config.label}</span>
      {score !== undefined && (
        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/80 text-[10px] text-civic-ink border border-civic-line">
          {score}
        </span>
      )}
    </span>
  );
}

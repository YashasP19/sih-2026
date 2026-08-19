import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { timeAgo } from '../utils/helpers';

export default function NotificationBell() {
  const { inbox, unreadCount, markAllRead, clearInbox } = useNotification();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggle = () => {
    setOpen((v) => !v);
    if (!open) markAllRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="relative p-2 rounded-xl border border-civic-line bg-civic-sand text-civic-ink hover:bg-civic-teal-soft dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-2xl border border-civic-line bg-white shadow-lift z-50 dark:bg-civic-night-paper dark:border-civic-night-line">
          <div className="flex items-center justify-between px-4 py-3 border-b border-civic-line dark:border-civic-night-line">
            <p className="text-sm font-bold text-civic-ink dark:text-slate-100">Status updates</p>
            <button type="button" onClick={clearInbox} className="text-[10px] font-semibold text-civic-mute hover:text-civic-teal">
              Clear
            </button>
          </div>
          <div className="overflow-y-auto max-h-72">
            {inbox.length === 0 ? (
              <p className="p-4 text-xs text-civic-mute">No notifications yet. Status changes on your tickets will appear here.</p>
            ) : (
              inbox.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-civic-line/70 text-xs dark:border-civic-night-line ${
                    n.read ? 'opacity-80' : 'bg-civic-teal-soft/40'
                  }`}
                >
                  <p className="font-semibold text-civic-ink dark:text-slate-100">{n.ticketId || 'Update'}</p>
                  <p className="text-civic-mute mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-civic-mute mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

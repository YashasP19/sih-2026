import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { complaintService } from '../services/complaintService';

export const NotificationContext = createContext(null);

const inboxKey = (userId) => `civicsense_inbox_${userId || 'guest'}`;
const snapshotKey = (userId) => `civicsense_status_snap_${userId || 'guest'}`;

function loadInbox(userId) {
  try {
    return JSON.parse(localStorage.getItem(inboxKey(userId)) || '[]');
  } catch {
    return [];
  }
}

function saveInbox(userId, items) {
  localStorage.setItem(inboxKey(userId), JSON.stringify(items.slice(0, 50)));
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [inbox, setInbox] = useState([]);

  useEffect(() => {
    if (user?.id) setInbox(loadInbox(user.id));
    else setInbox([]);
  }, [user?.id]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const pushInbox = useCallback(
    (item) => {
      if (!user?.id) return;
      setInbox((prev) => {
        const next = [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            read: false,
            createdAt: new Date().toISOString(),
            ...item,
          },
          ...prev,
        ].slice(0, 50);
        saveInbox(user.id, next);
        return next;
      });
    },
    [user?.id]
  );

  const markAllRead = useCallback(() => {
    if (!user?.id) return;
    setInbox((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveInbox(user.id, next);
      return next;
    });
  }, [user?.id]);

  const clearInbox = useCallback(() => {
    if (!user?.id) return;
    setInbox([]);
    saveInbox(user.id, []);
  }, [user?.id]);

  const syncComplaintStatuses = useCallback(
    async (silent = true) => {
      if (!user?.id || user.role === 'OFFICER' || user.role === 'ADMIN') return [];
      try {
        const res = await complaintService.getMyComplaints();
        const list = res.results || [];
        let previous = {};
        try {
          previous = JSON.parse(localStorage.getItem(snapshotKey(user.id)) || '{}');
        } catch {
          previous = {};
        }

        const nextSnap = {};
        list.forEach((c) => {
          nextSnap[c.ticket_id] = {
            status: c.status,
            resolution_notes: c.resolution_notes || '',
          };
          const prev = previous[c.ticket_id];
          if (prev && prev.status !== c.status) {
            const msg = `${c.ticket_id} is now ${c.status_display || c.status}${
              c.resolution_notes ? ` — ${c.resolution_notes.slice(0, 80)}` : ''
            }`;
            pushInbox({
              type: 'status',
              ticketId: c.ticket_id,
              title: c.title,
              message: msg,
              status: c.status,
            });
            if (!silent) addToast(msg, c.status === 'RESOLVED' ? 'success' : 'info', 6000);
          }
        });

        localStorage.setItem(snapshotKey(user.id), JSON.stringify(nextSnap));
        return list;
      } catch {
        return [];
      }
    },
    [user, pushInbox, addToast]
  );

  // Poll status changes for citizens while logged in
  useEffect(() => {
    if (!user?.id || user.role === 'OFFICER' || user.role === 'ADMIN') return undefined;
    syncComplaintStatuses(true);
    const id = setInterval(() => syncComplaintStatuses(false), 12000);
    return () => clearInterval(id);
  }, [user?.id, user?.role, syncComplaintStatuses]);

  const unreadCount = inbox.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        inbox,
        unreadCount,
        pushInbox,
        markAllRead,
        clearInbox,
        syncComplaintStatuses,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

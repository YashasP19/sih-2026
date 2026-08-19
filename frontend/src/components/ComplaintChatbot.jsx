import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { complaintService } from '../services/complaintService';
import VoiceMicButton from './VoiceMicButton';
import {
  Bot,
  X,
  Send,
  MessageCircle,
  Sparkles,
  FileText,
  Search,
  Loader2,
} from 'lucide-react';

const QUICK = [
  { id: 'file', label: 'File a complaint' },
  { id: 'track', label: 'Track my ticket' },
  { id: 'list', label: 'My open grievances' },
];

function botMsg(text, extra = {}) {
  return { id: `${Date.now()}-${Math.random()}`, role: 'bot', text, ...extra };
}

function userMsg(text) {
  return { id: `${Date.now()}-${Math.random()}`, role: 'user', text };
}

export default function ComplaintChatbot() {
  const { user } = useAuth();
  const { addToast, pushInbox } = useNotification();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('idle'); // idle | file_desc | file_loc | file_confirm | track_id
  const [draft, setDraft] = useState({ description: '', address: '', title: '', analysis: null });
  const endRef = useRef(null);
  const panelRef = useRef(null);
  const launcherRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [launcherOffset, setLauncherOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef(null);
  const rafRef = useRef(null);

  const makeDragHandlers = (elRef, offset, setOffset, { onClick } = {}) => {
    const move = (e) => {
      if (!dragStateRef.current) return;
      const { pointerId, startX, startY, originX, originY } = dragStateRef.current;
      if (e.pointerId !== undefined && e.pointerId !== pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragStateRef.current.moved = true;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        let nextX = originX + dx;
        let nextY = originY + dy;
        const el = elRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const minX = -(rect.left - originX) + 8;
          const maxX = window.innerWidth - (rect.right - originX) - 8;
          const minY = -(rect.top - originY) + 8;
          const maxY = window.innerHeight - (rect.bottom - originY) - 8;
          nextX = Math.min(Math.max(nextX, minX), maxX);
          nextY = Math.min(Math.max(nextY, minY), maxY);
        }
        setOffset({ x: nextX, y: nextY });
      });
    };

    const end = (e) => {
      if (!dragStateRef.current) return;
      const moved = dragStateRef.current.moved;
      elRef.current?.releasePointerCapture?.(dragStateRef.current.pointerId);
      dragStateRef.current = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      if (!moved && onClick) onClick(e);
    };

    const start = (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      dragStateRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: offset.x,
        originY: offset.y,
        moved: false,
      };
      elRef.current?.setPointerCapture?.(e.pointerId);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
    };

    return { onPointerDown: start };
  };

  const panelDrag = makeDragHandlers(panelRef, dragOffset, setDragOffset);
  const launcherDrag = makeDragHandlers(launcherRef, launcherOffset, setLauncherOffset, {
    onClick: () => setOpen(true),
  });

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        botMsg(
          user
            ? `Hi ${user.first_name || user.username}! I can help you file a civic grievance (with AI category & priority) or track an existing ticket. How can I help?`
            : 'Hi! Sign in to file or track grievances with me. You can still browse tips — use Login to continue.'
        ),
      ]);
    }
  }, [open, user, messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const append = (...msgs) => setMessages((prev) => [...prev, ...msgs]);

  const runAi = async (description) => {
    const title = description.split(/[.!?\n]/)[0].slice(0, 80) || 'Civic grievance';
    try {
      const res = await complaintService.analyzeComplaintAI(title, description);
      return { title, analysis: res?.analysis || null };
    } catch {
      const text = description.toLowerCase();
      let predicted = 'OTHER';
      let urgency = 'MEDIUM';
      let score = 50;
      if (/spark|wire|shock|light|electric/.test(text)) {
        predicted = 'STREETLIGHT_POWER';
        urgency = 'CRITICAL';
        score = 90;
      } else if (/pothole|road|crater/.test(text)) {
        predicted = 'ROADS_POTHOLES';
        urgency = 'HIGH';
        score = 75;
      } else if (/garbage|waste|trash/.test(text)) {
        predicted = 'WASTE_GARBAGE';
        urgency = 'MEDIUM';
        score = 60;
      } else if (/water|pipe|leak/.test(text)) {
        predicted = 'WATER_LEAKAGE';
        urgency = 'HIGH';
        score = 70;
      } else if (/manhole|danger|safety/.test(text)) {
        predicted = 'PUBLIC_SAFETY_HAZARD';
        urgency = 'CRITICAL';
        score = 92;
      }
      return {
        title,
        analysis: {
          predicted_category: predicted,
          confidence: 0.85,
          urgency,
          priority_score: score,
          suggested_department: 'Auto-routed',
        },
      };
    }
  };

  const submitComplaint = async (payload) => {
    const data = new FormData();
    data.append('title', payload.title);
    data.append('description', payload.description);
    data.append('category', payload.analysis?.predicted_category || 'OTHER');
    data.append('latitude', payload.latitude ?? 28.6328);
    data.append('longitude', payload.longitude ?? 77.2197);
    data.append('address', payload.address || 'Reported via Urban Lens Chatbot');
    data.append('ward_number', user?.ward_number || 'Ward 12');
    data.append('pincode', '110001');
    const res = await complaintService.submitComplaint(data);
    return res?.complaint || res;
  };

  const handleQuick = async (id) => {
    if (!user && id !== 'tips') {
      append(userMsg(QUICK.find((q) => q.id === id)?.label || id), botMsg('Please log in first so I can register or track your tickets.'));
      navigate('/login');
      return;
    }
    if (id === 'file') {
      setMode('file_desc');
      setDraft({ description: '', address: '', title: '', analysis: null });
      append(
        userMsg('File a complaint'),
        botMsg('Describe the civic problem in a few sentences. You can type or tap Speak (mic).')
      );
    } else if (id === 'track') {
      setMode('track_id');
      append(userMsg('Track my ticket'), botMsg('Send your ticket ID (e.g. CIV-2026-2847), or say “list” to see your open grievances.'));
    } else if (id === 'list') {
      append(userMsg('My open grievances'));
      await listTickets();
    }
  };

  const listTickets = async () => {
    setBusy(true);
    try {
      const res = await complaintService.getMyComplaints();
      const items = res.results || [];
      if (!items.length) {
        append(botMsg('You have no grievances yet. Say “File a complaint” to register one.'));
      } else {
        const lines = items
          .slice(0, 8)
          .map(
            (c) =>
              `• ${c.ticket_id} — ${c.status_display || c.status} — ${c.title}${
                c.resolution_notes ? `\n  Solution: ${c.resolution_notes}` : ''
              }`
          )
          .join('\n');
        append(botMsg(`Here are your recent tickets:\n${lines}\n\nSend a ticket ID for full details.`));
        setMode('track_id');
      }
    } catch {
      append(botMsg('Could not load tickets. Keep the backend running at port 8000.'));
    } finally {
      setBusy(false);
    }
  };

  const trackTicket = async (raw) => {
    const q = raw.trim().toUpperCase();
    if (q === 'LIST' || q.includes('OPEN')) {
      await listTickets();
      return;
    }
    setBusy(true);
    try {
      const res = await complaintService.getMyComplaints();
      const items = res.results || [];
      const hit = items.find(
        (c) => c.ticket_id?.toUpperCase() === q || c.ticket_id?.toUpperCase().includes(q.replace(/\s/g, ''))
      );
      if (!hit) {
        append(botMsg(`No ticket matching “${raw}” in your account. Try the full ID or say “list”.`));
      } else {
        append(
          botMsg(
            `Ticket ${hit.ticket_id}\nStatus: ${hit.status_display || hit.status}\nPriority: ${hit.urgency} (${hit.priority_score}/100)\nCategory: ${hit.category_display || hit.category}\nTitle: ${hit.title}\n${
              hit.resolution_notes ? `Solution: ${hit.resolution_notes}` : 'Solution: Pending municipal action.'
            }`
          )
        );
        setMode('idle');
      }
    } catch {
      append(botMsg('Tracking failed. Is the API server running?'));
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || busy) return;
    setInput('');
    append(userMsg(text));

    if (!user) {
      append(botMsg('Please log in to file or track complaints.'));
      return;
    }

    if (mode === 'file_desc') {
      setBusy(true);
      const { title, analysis } = await runAi(text);
      setDraft((d) => ({ ...d, description: text, title, analysis }));
      setBusy(false);
      setMode('file_loc');
      append(
        botMsg(
          `AI triage complete.\nCategory: ${analysis?.predicted_category || 'OTHER'}\nUrgency: ${analysis?.urgency || 'MEDIUM'} (score ${analysis?.priority_score ?? '—'}/100)\nConfidence: ${Math.round((analysis?.confidence || 0) * 100)}%\n\nWhere is this happening? Reply with an address or landmark (or type “skip”).`
        )
      );
      return;
    }

    if (mode === 'file_loc') {
      const address = /^skip$/i.test(text) ? '' : text;
      const next = { ...draft, address };
      setDraft(next);
      setMode('file_confirm');
      append(
        botMsg(
          `Ready to file:\n“${next.title}”\nLocation: ${address || 'Map default (Connaught Place area)'}\n\nReply YES to submit, or NO to cancel.`
        )
      );
      return;
    }

    if (mode === 'file_confirm') {
      if (/^(y|yes|ok|submit|confirm)/i.test(text)) {
        setBusy(true);
        try {
          const complaint = await submitComplaint(draft);
          const ticketId = complaint?.ticket_id || 'filed';
          append(
            botMsg(
              `Grievance ${ticketId} registered and routed to admin.\nStatus: ${complaint?.status || 'VERIFIED'}\nPriority: ${complaint?.urgency || draft.analysis?.urgency}.\nYou can track it anytime here or on your dashboard.`
            )
          );
          addToast(`Grievance ${ticketId} filed via chatbot!`, 'success');
          pushInbox({
            type: 'filed',
            ticketId,
            title: draft.title,
            message: `${ticketId} filed successfully via chatbot`,
            status: complaint?.status || 'VERIFIED',
          });
          setMode('idle');
          setDraft({ description: '', address: '', title: '', analysis: null });
        } catch (e) {
          append(
            botMsg(
              e.response?.status === 401
                ? 'Session expired — please log in again.'
                : 'Submit failed. Keep backend running and try again.'
            )
          );
        } finally {
          setBusy(false);
        }
      } else {
        setMode('idle');
        setDraft({ description: '', address: '', title: '', analysis: null });
        append(botMsg('Cancelled. Say “File a complaint” whenever you are ready.'));
      }
      return;
    }

    if (mode === 'track_id') {
      await trackTicket(text);
      return;
    }

    // free-form intents
    const lower = text.toLowerCase();
    if (/file|register|complaint|grievance|report/.test(lower)) {
      await handleQuick('file');
    } else if (/track|status|ticket|where is/.test(lower)) {
      await handleQuick('track');
    } else if (/list|my complaints|open/.test(lower)) {
      await handleQuick('list');
    } else {
      append(
        botMsg('I can help with:\n• File a complaint (AI category + priority)\n• Track a ticket ID\n• List open grievances\n\nPick a quick action below or type your request.')
      );
      setMode('idle');
    }
  };

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          {...launcherDrag}
          style={{ transform: `translate(${launcherOffset.x}px, ${launcherOffset.y}px)`, touchAction: 'none' }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-civic-teal text-white shadow-lift hover:scale-105 transition-transform cursor-grab active:cursor-grabbing dark:bg-teal-600"
          aria-label="Open Urban Lens chatbot (drag to move)"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-bold hidden sm:inline">Civic Assist</span>
        </button>
      )}

      {open && (
        <div
          ref={panelRef}
          style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}
          className="fixed bottom-4 right-4 z-50 w-[min(100vw-1.5rem,380px)] h-[min(72vh,560px)] flex flex-col rounded-3xl border border-civic-line bg-white shadow-lift overflow-hidden dark:bg-civic-night-paper dark:border-civic-night-line"
        >
          <div
            {...panelDrag}
            style={{ touchAction: 'none' }}
            className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-civic-teal to-civic-teal-dark text-white cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="text-sm font-bold leading-tight">Urban Lens Assist</p>
                <p className="text-[10px] opacity-90 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> File · Track · AI triage · drag to move
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/15">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-civic-mist/60 dark:bg-civic-night">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-civic-teal text-white rounded-br-md'
                      : 'bg-white border border-civic-line text-civic-ink rounded-bl-md dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-civic-mute px-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="px-3 py-2 flex flex-wrap gap-1.5 border-t border-civic-line bg-white dark:bg-civic-night-paper dark:border-civic-night-line">
            {QUICK.map((q) => (
              <button
                key={q.id}
                type="button"
                disabled={busy}
                onClick={() => handleQuick(q.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border border-civic-teal/30 bg-civic-teal-soft text-civic-teal-dark hover:bg-civic-teal hover:text-white disabled:opacity-50"
              >
                {q.id === 'file' ? <FileText className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                {q.label}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-civic-line flex items-end gap-2 bg-white dark:bg-civic-night-paper dark:border-civic-night-line">
            <VoiceMicButton
              onTranscript={(updater) => {
                setInput((prev) => {
                  const next = typeof updater === 'function' ? updater(prev) : updater;
                  return next;
                });
              }}
            />
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                mode === 'file_desc'
                  ? 'Describe the issue…'
                  : mode === 'file_loc'
                    ? 'Address or landmark…'
                    : mode === 'file_confirm'
                      ? 'YES or NO…'
                      : mode === 'track_id'
                        ? 'Ticket ID…'
                        : 'Ask Civic Assist…'
              }
              className="flex-1 px-3 py-2 rounded-xl border border-civic-line text-xs resize-none focus:outline-none focus:border-civic-teal dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
            />
            <button
              type="button"
              disabled={busy || !input.trim()}
              onClick={() => handleSend()}
              className="p-2.5 rounded-xl bg-civic-teal text-white disabled:opacity-40 hover:bg-civic-teal-dark"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

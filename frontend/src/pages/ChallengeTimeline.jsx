import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { innovationService } from '../services/innovationService';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Loader from '../components/Loader';
import PageTransition from '../components/PageTransition';
import { formatDate, timeAgo } from '../utils/helpers';
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Copy,
  Target,
  Users,
  Flag,
  Handshake,
  Rocket,
  MapPin,
  Award,
  BadgeCheck,
  IndianRupee,
  Users2,
  MapPinned,
} from 'lucide-react';

const STAGE_ICONS = {
  REPORTED: FileText,
  AI_CLASSIFIED: Sparkles,
  DUPLICATES_MERGED: Copy,
  ROUTED: Target,
  TEAM_FORMED: Users,
  MILESTONE: Flag,
  INDUSTRY_FUNDED: Handshake,
  DEPLOYED: Rocket,
};

const STAGE_COLORS = {
  REPORTED: 'bg-slate-500',
  AI_CLASSIFIED: 'bg-indigo-500',
  DUPLICATES_MERGED: 'bg-orange-500',
  ROUTED: 'bg-civic-teal',
  TEAM_FORMED: 'bg-purple-500',
  MILESTONE: 'bg-amber-500',
  INDUSTRY_FUNDED: 'bg-blue-500',
  DEPLOYED: 'bg-emerald-500',
};

function EventDetail({ event }) {
  const d = event.detail || {};

  switch (event.stage) {
    case 'REPORTED':
      return (
        <div className="text-xs text-civic-mute space-y-1">
          <p><strong className="text-civic-ink">{d.ticket_id}</strong> — {d.title}</p>
          <p className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {d.address || `Ward ${d.ward_number}`} · reported by {d.reported_by}
          </p>
        </div>
      );
    case 'AI_CLASSIFIED':
      return (
        <div className="text-xs text-civic-mute space-y-2">
          <p>
            Classified as <strong className="text-indigo-600 dark:text-indigo-300">{d.category_display}</strong>
            {' '}(domain: <strong className="text-civic-ink">{d.domain_display}</strong>),
            urgency <strong className="text-civic-ink">{d.urgency_display}</strong>, priority score{' '}
            <strong className="text-civic-ink">{d.priority_score}</strong>.
          </p>
          {d.keywords?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {d.keywords.map((kw, i) => (
                <span
                  key={`${kw}-${i}`}
                  className="text-[10px] font-semibold text-indigo-700 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    case 'DUPLICATES_MERGED':
      return (
        <div className="text-xs text-civic-mute space-y-1.5">
          <p><strong className="text-orange-600 dark:text-orange-400">{d.count}</strong> duplicate report{d.count === 1 ? '' : 's'} merged into this ticket.</p>
          <div className="flex flex-wrap gap-1.5">
            {d.ticket_ids?.map((t) => (
              <span key={t} className="text-[10px] font-mono font-semibold text-orange-700 px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300">
                {t}
              </span>
            ))}
          </div>
        </div>
      );
    case 'ROUTED':
      return (
        <div className="text-xs text-civic-mute space-y-1">
          <p>Routed to <strong className="text-civic-teal">{d.university_name || 'no institution (unrouted)'}</strong></p>
          {d.reason && (
            <p className="flex items-start gap-1.5 bg-civic-teal-soft/60 text-civic-teal rounded-lg px-2.5 py-1.5">
              <Target className="w-3.5 h-3.5 mt-[1px] shrink-0" />
              <span>{d.reason}</span>
            </p>
          )}
        </div>
      );
    case 'TEAM_FORMED': {
      const branches = new Set(
        (d.student_members || [])
          .map((m) => (m.match(/\(([^)]+)\)/) || [])[1])
          .filter(Boolean)
      );
      return (
        <div className="text-xs text-civic-mute space-y-1.5">
          <p>
            <strong className="text-civic-ink">{d.project_code}</strong> — {d.project_title}
          </p>
          <p>
            <strong className="text-purple-600 dark:text-purple-300">{d.student_count} student{d.student_count === 1 ? '' : 's'}</strong>
            {branches.size > 0 && <> across <strong className="text-civic-ink">{branches.size} branch{branches.size === 1 ? '' : 'es'}</strong></>}
            {d.faculty_mentor_name && <>, mentored by {d.faculty_mentor_name}</>}
          </p>
          {d.student_members?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {d.student_members.map((m, i) => (
                <span key={`${m}-${i}`} className="text-[10px] font-semibold text-purple-700 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    case 'MILESTONE':
      return (
        <div className="text-xs text-civic-mute space-y-1">
          <p><strong className="text-civic-ink">{d.title}</strong> — {d.status_display}</p>
          {d.description && <p>{d.description}</p>}
        </div>
      );
    case 'INDUSTRY_FUNDED':
      return (
        <div className="text-xs text-civic-mute space-y-1">
          <p>
            <strong className="text-blue-600 dark:text-blue-300">{d.partner_name}</strong> — {d.support_type_display}
            {d.amount && (
              <span className="ml-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                ₹{Number(d.amount).toLocaleString('en-IN')}
              </span>
            )}
          </p>
          {d.description && <p>{d.description}</p>}
        </div>
      );
    case 'DEPLOYED':
      return (
        <div className="text-xs text-civic-mute space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/30 dark:border-emerald-800/40">
              <Users2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
              <p className="text-sm font-extrabold text-civic-ink">{d.people_benefited ?? '—'}</p>
              <p className="text-[9px] uppercase font-bold text-civic-mute">People</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/30 dark:border-emerald-800/40">
              <MapPinned className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
              <p className="text-sm font-extrabold text-civic-ink">{d.villages_covered ?? '—'}</p>
              <p className="text-[9px] uppercase font-bold text-civic-mute">Villages</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/30 dark:border-emerald-800/40">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
              <p className="text-sm font-extrabold text-civic-ink">
                {d.solution_cost != null ? `₹${Number(d.solution_cost).toLocaleString('en-IN')}` : '—'}
              </p>
              <p className="text-[9px] uppercase font-bold text-civic-mute">Cost</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/30 dark:border-emerald-800/40">
              <Award className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
              <p className="text-sm font-extrabold text-civic-ink">
                {(d.patent_filed ? 1 : 0) + (d.startup_created ? 1 : 0)}
              </p>
              <p className="text-[9px] uppercase font-bold text-civic-mute">IP / Startups</p>
            </div>
          </div>
          {(d.patent_filed || d.startup_created) && (
            <div className="flex flex-wrap gap-2">
              {d.patent_filed && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700 px-2.5 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Patent{d.patent_details ? `: ${d.patent_details}` : ' filed'}
                </span>
              )}
              {d.startup_created && (
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                  <Rocket className="w-3.5 h-3.5" />
                  Startup{d.startup_name ? `: ${d.startup_name}` : ' created'}
                </span>
              )}
            </div>
          )}
          {d.outcome_notes && <p>{d.outcome_notes}</p>}
        </div>
      );
    default:
      return null;
  }
}

export default function ChallengeTimeline() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    innovationService.getChallengeTimeline(id)
      .then((res) => { if (active) setData(res); })
      .catch((e) => { console.warn('Timeline load failed:', e); if (active) setData(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {user && <Sidebar role={user.role} />}
          <div className="flex-1 max-w-3xl mx-auto">
            <Loader text="Assembling challenge timeline..." />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {user && <Sidebar role={user.role} />}
          <Card className="flex-1 max-w-3xl mx-auto text-center py-16">
            <FileText className="w-12 h-12 text-civic-mute mx-auto mb-3" />
            <h3 className="text-base font-bold text-civic-ink">Timeline not found</h3>
            <p className="text-xs text-civic-mute mt-1">This challenge could not be loaded.</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {user && <Sidebar role={user.role} />}
        <PageTransition className="flex-1 max-w-3xl mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-civic-mute hover:text-civic-teal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        <div className="text-center space-y-1">
          <span className="px-2 py-0.5 rounded bg-civic-sand text-civic-teal font-mono text-[11px] font-bold border border-civic-line inline-block">
            {data.ticket_id}
          </span>
          <h1 className="text-xl font-extrabold text-civic-ink">{data.title}</h1>
          <p className="text-xs text-civic-mute">From citizen report to deployed outcome — the full story.</p>
        </div>

        <div className="relative pl-8">
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-civic-line dark:bg-civic-night-line" />

          <div className="space-y-6">
            {data.events.map((event, index) => {
              const Icon = STAGE_ICONS[event.stage] || FileText;
              const color = STAGE_COLORS[event.stage] || 'bg-slate-500';
              return (
                <div key={`${event.stage}-${index}`} className="relative">
                  <div className={`absolute -left-8 top-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Card className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-civic-ink">{event.label}</h3>
                      <span className="text-[10px] text-civic-mute">
                        {formatDate(event.timestamp)} · {timeAgo(event.timestamp)}
                      </span>
                    </div>
                    <EventDetail event={event} />
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
        </PageTransition>
      </div>
    </div>
  );
}

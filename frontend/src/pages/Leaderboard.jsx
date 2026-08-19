import React, { useEffect, useState } from 'react';
import { Award, Trophy, ShieldCheck, Medal } from 'lucide-react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import PageTransition from '../components/PageTransition';
import Loader from '../components/Loader';

const RANK_STYLES = [
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
];

function RankBadge({ rank }) {
  const style = RANK_STYLES[rank - 1] || 'bg-civic-sand text-civic-mute dark:bg-slate-800 dark:text-slate-400';
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${style}`}>
      {rank}
    </div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const isOfficerOrAdmin = user?.role === 'OFFICER' || user?.role === 'ADMIN';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await complaintService.getLeaderboard();
        setData(res.data);
      } catch (e) {
        console.warn('Failed to load leaderboard:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const citizens = data?.top_citizens || [];
  const officers = data?.top_officers || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role={isOfficerOrAdmin ? 'OFFICER' : 'CITIZEN'} />

        <PageTransition className="flex-1">
          {loading ? (
            <Loader fullScreen={false} text="Loading leaderboard..." />
          ) : (
            <LeaderboardContent citizens={citizens} officers={officers} />
          )}
        </PageTransition>
      </div>
    </div>
  );
}

function LeaderboardContent({ citizens, officers }) {
  return (
    <div>
      <div className="text-center mb-10">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-500 text-white items-center justify-center shadow-lift mb-4">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="font-display text-3xl font-bold text-civic-ink dark:text-slate-100 tracking-tight">
          Civic Karma Leaderboard
        </h1>
        <p className="text-sm text-civic-mute dark:text-slate-400 mt-2 max-w-xl mx-auto">
          Citizens earn points for verified reports, officers and admins earn recognition for grievances resolved.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl surface-strong p-6">
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-lg font-bold text-civic-ink dark:text-slate-100">Top Citizens</h2>
          </div>
          {citizens.length === 0 ? (
            <p className="text-sm text-civic-mute dark:text-slate-400">No citizen activity yet.</p>
          ) : (
            <ul className="space-y-2">
              {citizens.map((c, i) => (
                <li
                  key={c.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-civic-sand dark:hover:bg-slate-800 transition-colors"
                >
                  <RankBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-civic-ink dark:text-slate-100 truncate">{c.display_name}</p>
                    {c.ward_number && (
                      <p className="text-[11px] text-civic-mute dark:text-slate-400">Ward {c.ward_number}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {c.civic_points} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl surface-strong p-6">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="w-5 h-5 text-civic-teal" />
            <h2 className="font-display text-lg font-bold text-civic-ink dark:text-slate-100">Top Officers &amp; Admins</h2>
          </div>
          {officers.length === 0 ? (
            <p className="text-sm text-civic-mute dark:text-slate-400">No resolutions logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {officers.map((o, i) => (
                <li
                  key={o.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-civic-sand dark:hover:bg-slate-800 transition-colors"
                >
                  <RankBadge rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-civic-ink dark:text-slate-100 truncate">{o.display_name}</p>
                    <p className="text-[11px] text-civic-mute dark:text-slate-400">
                      {o.role_display}{o.department ? ` · ${o.department}` : ''}
                    </p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-sm font-bold text-civic-teal dark:text-teal-400">{o.resolved_count} resolved</p>
                    <p className="text-[11px] text-civic-mute dark:text-slate-400 flex items-center gap-1 justify-end">
                      <Medal className="w-3 h-3" /> {o.civic_points} pts
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

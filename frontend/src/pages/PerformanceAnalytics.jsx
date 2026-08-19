import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  ShieldAlert,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { complaintService } from '../services/complaintService';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import PageTransition from '../components/PageTransition';
import Card from '../components/Card';
import StatsCard from '../components/StatsCard';
import Loader from '../components/Loader';

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-wider text-civic-mute dark:text-slate-500 mb-3">
      {children}
    </p>
  );
}

export default function PerformanceAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [officerStats, setOfficerStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [execRes, officerRes] = await Promise.allSettled([
          complaintService.getAdminExecutiveData(),
          complaintService.getOfficerSummary(),
        ]);
        if (execRes.status === 'fulfilled' && execRes.value?.data) {
          setData(execRes.value.data);
        }
        if (officerRes.status === 'fulfilled' && officerRes.value?.officer_stats) {
          setOfficerStats(officerRes.value.officer_stats);
        }
      } catch (e) {
        console.warn('Performance analytics load failed:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const kpis = data?.kpis || {};
  const departments = data?.department_performance || [];
  const categories = data?.category_distribution || [];
  const trend = data?.trend || { labels: [], registered: [], resolved: [] };
  const operational = data?.operational || {};
  const maxTrend = Math.max(1, ...trend.registered, ...trend.resolved);

  const personalStats = officerStats
    ? [
        { label: 'Assigned to Me', value: officerStats.assigned_total, icon: UserCheck },
        { label: 'Pending', value: officerStats.assigned_pending, icon: Clock },
        { label: 'In Progress', value: officerStats.assigned_in_progress, icon: TrendingUp },
        { label: 'Resolved by Me', value: officerStats.assigned_resolved, icon: CheckCircle2 },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role="OFFICER" />

        <PageTransition className="flex-1 space-y-10">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-civic-teal" />
              <h1 className="text-2xl font-extrabold text-civic-ink dark:text-slate-100">Performance Analytics</h1>
            </div>
            <p className="text-sm text-civic-mute dark:text-slate-400 mt-1">
              Your resolution stats alongside city-wide department efficiency and hazard trends.
            </p>
          </div>

          {loading ? (
            <Loader text="Loading performance data..." />
          ) : (
            <>
              {/* Personal performance banner */}
              {officerStats && (
                <div className="rounded-3xl glass-panel bg-gradient-to-r from-civic-sand via-white to-civic-teal-soft dark:from-slate-800 dark:via-civic-night-paper dark:to-teal-950/40 border border-civic-teal/25 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-civic-teal dark:text-teal-400 mb-1">
                        My Performance
                      </p>
                      <h2 className="text-lg font-bold text-civic-ink dark:text-slate-100">
                        {user?.first_name || user?.username} · {officerStats.department}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-6 sm:gap-8">
                      {personalStats.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/10 border border-civic-teal/20 flex items-center justify-center text-civic-teal dark:text-teal-400 flex-shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xl font-extrabold text-civic-ink dark:text-slate-100 leading-tight">{value}</p>
                            <p className="text-[11px] text-civic-mute dark:text-slate-400 whitespace-nowrap">{label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* City-wide KPIs */}
              <div>
                <SectionLabel>City-Wide Snapshot</SectionLabel>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Total Lodged"
                    value={(kpis.total_complaints ?? 0).toLocaleString()}
                    subtitle="Citywide grievances"
                    icon={Building2}
                    color="purple"
                  />
                  <StatsCard
                    title="Resolution Rate"
                    value={`${kpis.resolution_rate ?? 0}%`}
                    subtitle={`${kpis.resolved_count ?? 0} closed tickets`}
                    icon={CheckCircle2}
                    color="emerald"
                  />
                  <StatsCard
                    title="Average SLA"
                    value={`${kpis.average_resolution_hours ?? 0}h`}
                    subtitle="Mean turnaround"
                    icon={Clock}
                    color="amber"
                  />
                  <StatsCard
                    title="Critical Backlog"
                    value={operational.critical_backlog ?? 0}
                    subtitle="Needs immediate action"
                    icon={Flame}
                    color="rose"
                  />
                </div>
              </div>

              {/* Department leaderboard + category breakdown */}
              <div>
                <SectionLabel>Department &amp; Category Breakdown</SectionLabel>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-civic-teal" />
                      <h3 className="text-sm font-bold text-civic-ink dark:text-slate-100">Department Resolution Leaderboard</h3>
                    </div>
                    <div className="space-y-4">
                      {departments.length === 0 ? (
                        <p className="text-xs text-civic-mute dark:text-slate-400">No department data yet.</p>
                      ) : (
                        departments.slice(0, 5).map((dept, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-civic-ink dark:text-slate-100 truncate pr-2">{dept.department_name}</span>
                              <span className="text-civic-teal dark:text-teal-400 font-bold whitespace-nowrap">
                                {dept.resolution_rate}% ({dept.resolved}/{dept.total})
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-civic-sand dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-civic-teal to-emerald-500 transition-all duration-500"
                                style={{ width: `${dept.resolution_rate}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  <Card className="space-y-5">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-civic-teal" />
                      <h3 className="text-sm font-bold text-civic-ink dark:text-slate-100">Grievance Distribution by Sector</h3>
                    </div>
                    <div className="space-y-4">
                      {categories.length === 0 ? (
                        <p className="text-xs text-civic-mute dark:text-slate-400">No category data yet.</p>
                      ) : (
                        categories.slice(0, 5).map((cat, index) => (
                          <div key={index} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-civic-ink dark:text-slate-100 truncate pr-2">{cat.category_name}</span>
                              <span className="text-civic-mute dark:text-slate-400 whitespace-nowrap">{cat.percentage}% ({cat.count})</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-civic-sand dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-civic-teal to-sky-400 transition-all duration-500"
                                style={{ width: `${Math.min(100, cat.percentage * 2.5)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* 7-day trend */}
              <div>
                <SectionLabel>7-Day Redressal Velocity</SectionLabel>
                <Card className="p-6">
                  {trend.labels.length === 0 ? (
                    <p className="text-xs text-civic-mute dark:text-slate-400">No trend data yet.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-7 gap-2 text-center text-xs">
                        {trend.labels.map((day, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-civic-sand dark:bg-slate-800 border border-civic-line dark:border-civic-night-line space-y-1.5">
                            <span className="text-[10px] text-civic-mute dark:text-slate-400 font-semibold">{day}</span>
                            <div className="flex items-end justify-center gap-1 h-16">
                              <div
                                className="w-2.5 bg-civic-teal rounded-t"
                                style={{ height: `${Math.max(4, (trend.registered[i] / maxTrend) * 100)}%` }}
                                title="Registered"
                              />
                              <div
                                className="w-2.5 bg-emerald-500 rounded-t"
                                style={{ height: `${Math.max(4, (trend.resolved[i] / maxTrend) * 100)}%` }}
                                title="Resolved"
                              />
                            </div>
                            <div className="text-[10px] text-civic-mute dark:text-slate-400">
                              <span className="text-civic-teal dark:text-teal-400">{trend.registered[i]}</span>
                              {' / '}
                              <span className="text-emerald-600 dark:text-emerald-400">{trend.resolved[i]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-6 mt-5 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-civic-teal" />
                          <span className="text-civic-mute dark:text-slate-400">New Grievances Registered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-emerald-500" />
                          <span className="text-civic-mute dark:text-slate-400">Cases Successfully Resolved</span>
                        </div>
                      </div>
                    </>
                  )}
                </Card>
              </div>
            </>
          )}
        </PageTransition>
      </div>
    </div>
  );
}

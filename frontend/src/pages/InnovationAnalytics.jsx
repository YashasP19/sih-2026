import React, { useState, useEffect } from 'react';
import { innovationService } from '../services/innovationService';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import StatsCard from '../components/StatsCard';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { PROJECT_STATUS_TYPES } from '../utils/constants';
import {
  Inbox,
  GraduationCap,
  FlaskConical,
  Handshake,
  Layers,
  Building2,
  Trophy,
  ShieldCheck,
  IndianRupee,
  CheckCircle2,
  Users2,
  MapPinned,
  ScrollText,
  Rocket,
} from 'lucide-react';

export default function InnovationAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await innovationService.getInnovationStats();
        setStats(data);
      } catch (e) {
        console.warn('Innovation analytics loading fallback:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8">
          {user && <Sidebar role={user.role} />}
          <div className="flex-1">
            <Loader text="Loading state-wide innovation ecosystem metrics..." />
          </div>
        </div>
      </div>
    );
  }

  const s = stats || {};
  const totalChallenges = s.total_challenges ?? 0;
  const totalProjects = s.total_projects ?? 0;
  const deployedSolutions = s.deployed_solutions ?? 0;
  const totalUniversities = s.total_universities ?? 0;
  const participatingUniversities = s.participating_universities ?? 0;
  const totalIndustryPartners = s.total_industry_partners ?? 0;
  const totalSupportOffers = s.total_support_offers ?? 0;
  const totalFunding = s.total_funding_committed ?? 0;

  const domains = s.challenges_by_domain || [];
  const projectStatuses = s.projects_by_status || [];
  const topUniversities = s.top_universities || [];
  const impact = s.community_impact || {};

  const maxDomainCount = Math.max(1, ...domains.map((d) => d.count || 0));
  const maxStatusCount = Math.max(1, ...projectStatuses.map((p) => p.count || 0));

  const participationRate = totalUniversities
    ? ((participatingUniversities / totalUniversities) * 100).toFixed(1)
    : '0.0';
  const conversionRate = totalChallenges ? ((totalProjects / totalChallenges) * 100).toFixed(1) : '0.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-8">
        {user && <Sidebar role={user.role} />}
        <div className="flex-1 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Societal Innovation Collaboration Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-civic-ink tracking-tight">
          Community Challenges to Deployed Innovation
        </h1>
        <p className="text-sm text-civic-mute mt-2">
          Live governance dashboard tracking crowdsourced societal challenges, institutional participation, industry
          collaboration, and measurable social outcomes across districts and thematic domains.
        </p>
      </div>

      {/* Headline KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Challenges Crowdsourced"
          value={totalChallenges.toLocaleString('en-IN')}
          subtitle="Submitted by citizens & local bodies"
          icon={Inbox}
          color="blue"
        />
        <StatsCard
          title="Projects Constituted"
          value={totalProjects.toLocaleString('en-IN')}
          subtitle={`${conversionRate}% of challenges picked up`}
          icon={FlaskConical}
          color="purple"
        />
        <StatsCard
          title="Solutions Deployed"
          value={deployedSolutions.toLocaleString('en-IN')}
          subtitle="Validated & implemented in field"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Funding Committed"
          value={`₹${Number(totalFunding).toLocaleString('en-IN')}`}
          subtitle={`${totalSupportOffers} industry support offers`}
          icon={IndianRupee}
          color="amber"
        />
      </div>

      {/* Ecosystem Participation Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-civic-teal-soft text-civic-teal border border-civic-teal/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-civic-mute uppercase">Institutions Onboarded</p>
            <p className="text-2xl font-extrabold text-civic-ink mt-0.5">{totalUniversities}</p>
            <p className="text-[11px] text-civic-mute mt-0.5">
              {participatingUniversities} actively running projects ({participationRate}%)
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-civic-teal-soft text-civic-teal border border-civic-teal/25">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-civic-mute uppercase">Industry Partners</p>
            <p className="text-2xl font-extrabold text-civic-teal mt-0.5">{totalIndustryPartners}</p>
            <p className="text-[11px] text-civic-mute mt-0.5">
              Startups, MSMEs, CSR arms & research labs
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-civic-mute uppercase">Deployment Rate</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {totalProjects ? ((deployedSolutions / totalProjects) * 100).toFixed(1) : '0.0'}%
            </p>
            <p className="text-[11px] text-civic-mute mt-0.5">Projects reaching field deployment</p>
          </div>
        </Card>
      </div>

      {/* Community Impact & IP Outcomes — measured, not just counted */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
            <Rocket className="w-4 h-4 text-emerald-600" />
            <span>Community Impact & IP Outcomes</span>
          </h3>
          <p className="text-xs text-civic-mute mt-0.5">
            Measured across every solution that has actually reached deployment.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="People Benefited"
            value={Number(impact.people_benefited || 0).toLocaleString('en-IN')}
            subtitle="Citizens reached by deployed solutions"
            icon={Users2}
            color="emerald"
          />
          <StatsCard
            title="Villages / Wards Covered"
            value={Number(impact.villages_covered || 0).toLocaleString('en-IN')}
            subtitle="Localities with a deployed solution"
            icon={MapPinned}
            color="blue"
          />
          <StatsCard
            title="Patents & Startups"
            value={`${impact.patents_filed || 0} / ${impact.startups_created || 0}`}
            subtitle="IP filed / startups incorporated"
            icon={ScrollText}
            color="purple"
          />
          <StatsCard
            title="Deployment Spend"
            value={`₹${Number(impact.total_solution_cost || 0).toLocaleString('en-IN')}`}
            subtitle="Total cost of deployed solutions"
            icon={IndianRupee}
            color="amber"
          />
        </div>
      </div>

      {/* 2-Column: Domain Distribution & Project Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain-wise Distribution */}
        <Card className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
              <Layers className="w-4 h-4 text-civic-teal" />
              <span>Challenge Distribution by Thematic Domain</span>
            </h3>
            <p className="text-xs text-civic-mute mt-0.5">
              AI-classified share of crowdsourced societal challenges per sector.
            </p>
          </div>

          {domains.length === 0 ? (
            <p className="text-xs text-civic-mute text-center py-6">No challenges classified yet.</p>
          ) : (
            <div className="space-y-4">
              {domains.map((domain, index) => (
                <div key={domain.domain || index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-civic-ink">{domain.domain_display || domain.domain}</span>
                    <span className="text-civic-mute">
                      {domain.count} challenge{domain.count === 1 ? '' : 's'}
                      {totalChallenges ? ` (${((domain.count / totalChallenges) * 100).toFixed(1)}%)` : ''}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-civic-sand overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-civic-teal to-sky-400 transition-all duration-500"
                      style={{ width: `${(domain.count / maxDomainCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Project Pipeline by Status */}
        <Card className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-civic-teal" />
              <span>Innovation Project Pipeline</span>
            </h3>
            <p className="text-xs text-civic-mute mt-0.5">
              Where student-faculty projects currently sit in the lifecycle.
            </p>
          </div>

          {projectStatuses.length === 0 ? (
            <p className="text-xs text-civic-mute text-center py-6">No projects constituted yet.</p>
          ) : (
            <div className="space-y-4">
              {projectStatuses.map((row, index) => (
                <div key={row.status || index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-civic-ink">
                      {row.status_display || PROJECT_STATUS_TYPES[row.status]?.label || row.status}
                    </span>
                    <span className="text-civic-teal font-bold">
                      {row.count} project{row.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-civic-sand overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        row.status === 'DEPLOYED'
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          : row.status === 'REJECTED' || row.status === 'ON_HOLD'
                          ? 'bg-gradient-to-r from-slate-400 to-slate-300'
                          : 'bg-gradient-to-r from-civic-teal to-emerald-500'
                      }`}
                      style={{ width: `${(row.count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Top Participating Universities */}
      <Card className="space-y-5">
        <div>
          <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
            <Building2 className="w-4 h-4 text-civic-teal" />
            <span>Top Participating Institutions</span>
          </h3>
          <p className="text-xs text-civic-mute mt-0.5">
            Higher Education Institutions ranked by projects undertaken and solutions deployed.
          </p>
        </div>

        {topUniversities.length === 0 ? (
          <p className="text-xs text-civic-mute text-center py-6">
            No institutional participation recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase font-bold text-civic-mute border-b border-civic-line dark:border-civic-night-line">
                  <th className="py-2.5 pr-4">#</th>
                  <th className="py-2.5 pr-4">Institution</th>
                  <th className="py-2.5 pr-4 text-right">Projects</th>
                  <th className="py-2.5 pr-4 text-right">Deployed</th>
                  <th className="py-2.5 text-right">Deployment Rate</th>
                </tr>
              </thead>
              <tbody>
                {topUniversities.map((uni, index) => {
                  const rate = uni.projects_count
                    ? ((uni.deployed_count / uni.projects_count) * 100).toFixed(0)
                    : '0';
                  return (
                    <tr
                      key={uni.name || index}
                      className="border-b border-civic-line/60 last:border-0 dark:border-civic-night-line/60"
                    >
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-bold text-[11px] ${
                            index === 0
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'bg-civic-sand text-civic-mute dark:bg-slate-800'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-bold text-civic-ink">{uni.name}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-civic-teal">{uni.projects_count}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {uni.deployed_count}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 rounded-full bg-civic-sand overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-civic-teal to-emerald-500"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-civic-mute font-semibold w-9 text-right">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
        </div>
      </div>
    </div>
  );
}

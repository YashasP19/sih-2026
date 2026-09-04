import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  GraduationCap,
  Handshake,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Layers,
  Building2,
  Rocket,
} from 'lucide-react';
import { complaintService } from '../services/complaintService';
import { innovationService } from '../services/innovationService';
import StatsCard from '../components/StatsCard';
import MapComponent from '../components/MapComponent';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [geoPins, setGeoPins] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, pinRes] = await Promise.allSettled([
          innovationService.getInnovationStats(),
          complaintService.getGeoPins(),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value) {
          setStats(statsRes.value);
        }
        if (pinRes.status === 'fulfilled' && pinRes.value.pins) {
          setGeoPins(pinRes.value.pins);
        }
      } catch (e) {
        console.warn('Backend loading fallback:', e);
      }
    }
    loadData();
  }, []);

  const s = stats || {};
  const defaultKpis = {
    total_challenges: s.total_challenges ?? 1482,
    total_projects: s.total_projects ?? 96,
    deployed_solutions: s.deployed_solutions ?? 34,
    total_universities: s.total_universities ?? 8,
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-x-0 -top-10 h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(193,105,79,0.14),transparent_65%)] pointer-events-none" />

        <div className="relative text-center animate-fade-up">
          <p className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-civic-ink">
            Urban <span className="text-civic-teal">Lens</span>
          </p>
          <h1 className="mt-5 text-xl sm:text-2xl lg:text-3xl font-semibold text-civic-ink/90 dark:text-slate-100/90 max-w-3xl mx-auto leading-snug">
            Societal Innovation Collaboration Portal
          </h1>
          <p className="mt-4 text-base sm:text-lg text-civic-mute max-w-2xl mx-auto leading-relaxed">
            Turning community problems into research, innovation and deployed solutions — connecting citizens,
            universities, industry and government on one platform.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/submit" className="btn-primary !px-7 !py-3.5">
              <span>Report a Challenge</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/innovation-analytics" className="btn-secondary !px-7 !py-3.5">
              <TrendingUp className="w-5 h-5 text-civic-teal" />
              <span>Explore the Ecosystem</span>
            </Link>
          </div>
        </div>

        <div className="relative mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left animate-fade-up" style={{ animationDelay: '120ms' }}>
          <StatsCard
            title="Challenges Crowdsourced"
            value={<CountUp value={defaultKpis.total_challenges} />}
            subtitle="Reported by citizens city-wide"
            icon={Building2}
            color="teal"
          />
          <StatsCard
            title="Projects Constituted"
            value={<CountUp value={defaultKpis.total_projects} />}
            subtitle="Taken up by student teams"
            icon={GraduationCap}
            color="blue"
          />
          <StatsCard
            title="Solutions Deployed"
            value={<CountUp value={defaultKpis.deployed_solutions} />}
            subtitle="Validated & implemented in field"
            icon={CheckCircle2}
            color="brown"
          />
          <StatsCard
            title="Institutions Onboarded"
            value={<CountUp value={defaultKpis.total_universities} />}
            subtitle="Universities & research labs"
            icon={Handshake}
            color="amber"
          />
        </div>
      </section>

      <section className="py-20 border-y border-civic-line/70 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-teal">The Missing Pipeline</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-civic-ink mt-2">
              Why Urban Lens outperforms traditional portals
            </h2>
            <p className="text-civic-mute mt-3 text-sm sm:text-base">
              Automated triage, deduplication and institutional routing — connecting citizens, universities and
              industry without the bureaucratic lag.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: 'Classify, Prioritize & Route',
                body: 'A multilingual keyword/lexicon classifier maps each challenge to one of 10 academic domains, scores its priority, and routes it to the best-matched institution.',
              },
              {
                icon: Layers,
                title: 'Deduplicate Automatically',
                body: 'Haversine distance plus text similarity clusters repeat reports of the same incident into one high-priority challenge instead of twenty tickets.',
              },
              {
                icon: Rocket,
                title: 'Track to Deployment',
                body: 'Every project is followed through Proposed → Approved → In Progress → Prototype → Testing → Deployed, with milestones, funding and measured community impact.',
              },
            ].map(({ icon: Icon, title, body }, index) => (
              <Reveal key={title} delay={index * 120}>
                <div className="p-8 rounded-2xl surface group h-full transition-transform duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-civic-teal-soft border border-civic-teal/20 flex items-center justify-center text-civic-teal mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-civic-ink mb-3">{title}</h3>
                  <p className="text-sm text-civic-mute leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-teal">Live Challenge Geolocation</p>
            <h2 className="font-display text-3xl font-bold text-civic-ink mt-1">Where societal challenges are being reported</h2>
            <p className="text-sm text-civic-mute mt-2">Transparent live view of citizen-reported challenges across wards and districts.</p>
          </div>
          <Link to="/analytics" className="inline-flex items-center gap-1.5 text-sm font-semibold text-civic-teal hover:text-civic-teal-dark">
            <span>Explore full heatmaps</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <Reveal className="rounded-2xl border border-civic-line overflow-hidden shadow-soft bg-white">
          <MapComponent
            complaints={geoPins.length > 0 ? geoPins : [
              {
                id: 1,
                ticket_id: 'CIV-2026-8921',
                title: 'High Voltage Electric Cable Sparking near School Gate',
                category: 'STREETLIGHT_POWER',
                urgency: 'CRITICAL',
                priority_score: 95,
                status: 'IN_PROGRESS',
                latitude: 28.6328,
                longitude: 77.2197,
                address: 'Connaught Place, New Delhi',
                upvotes_count: 18,
              },
              {
                id: 2,
                ticket_id: 'CIV-2026-7840',
                title: 'Dangerous Open Manhole on Main Market Road',
                category: 'PUBLIC_SAFETY_HAZARD',
                urgency: 'CRITICAL',
                priority_score: 92,
                status: 'VERIFIED',
                latitude: 28.6517,
                longitude: 77.1906,
                address: 'Karol Bagh, New Delhi',
                upvotes_count: 24,
              },
              {
                id: 3,
                ticket_id: 'CIV-2026-5419',
                title: 'Overflowing Garbage Dump',
                category: 'WASTE_GARBAGE',
                urgency: 'HIGH',
                priority_score: 74,
                status: 'RESOLVED',
                latitude: 28.6480,
                longitude: 77.1850,
                address: 'Sector 4, Karol Bagh',
                upvotes_count: 9,
              },
            ]}
            height="460px"
          />
        </Reveal>
      </section>

      <section className="py-20 border-t border-civic-line/70 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-teal">Simple 4-Step Process</p>
            <h2 className="font-display text-3xl font-bold text-civic-ink mt-2">How Urban Lens turns a problem into a deployed solution</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: '1', title: 'Citizen Reports a Challenge', body: 'Submit a societal problem with photo, GPS and voice input. The AI engine classifies it into one of 10 academic domains and scores its priority.' },
              { n: '2', title: 'AI Routes to an Institution', body: 'Duplicate reports are merged, and the challenge is routed to the university best matched by domain, district and current project load.' },
              { n: '3', title: 'University Forms a Student Team', body: 'A faculty coordinator claims the challenge, mentors a multidisciplinary student team, and tracks milestones through to a working prototype.' },
              { n: '4', title: 'Industry Funds & Deploys', body: 'Industry and CSR partners offer funding, labs or tech transfer; the state tracks the pipeline live until the solution is deployed.' },
            ].map((step, index) => (
              <Reveal key={step.n} delay={index * 100}>
                <div className="p-6 rounded-2xl surface group h-full transition-transform duration-300 hover:-translate-y-1">
                  <span className="w-8 h-8 rounded-full bg-civic-teal text-white font-black text-sm flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    {step.n}
                  </span>
                  <h3 className="font-bold text-civic-ink text-base mb-2">{step.title}</h3>
                  <p className="text-xs text-civic-mute leading-relaxed">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer is rendered globally from App.jsx */}
    </div>
  );
}

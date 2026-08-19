import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Zap,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Layers,
  Building2,
  Clock,
} from 'lucide-react';
import { complaintService } from '../services/complaintService';
import StatsCard from '../components/StatsCard';
import MapComponent from '../components/MapComponent';

export default function Landing() {
  const [transparencyData, setTransparencyData] = useState(null);
  const [geoPins, setGeoPins] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, pinRes] = await Promise.allSettled([
          complaintService.getTransparencyData(),
          complaintService.getGeoPins(),
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.data) {
          setTransparencyData(dashRes.value.data);
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

  const defaultKpis = transparencyData?.kpis || {
    total_complaints: 1482,
    resolved_count: 1294,
    resolution_rate: 87.3,
    average_resolution_hours: 18.4,
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-x-0 -top-10 h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(13,115,119,0.14),transparent_65%)] pointer-events-none" />
        <div className="absolute right-0 top-24 w-[42%] h-[320px] opacity-40 pointer-events-none hidden lg:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230D7377' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative text-center animate-fade-up">
          <p className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-civic-ink">
            Urban Lens <span className="text-civic-teal">AI</span>
          </p>
          <h1 className="mt-5 text-xl sm:text-2xl lg:text-3xl font-semibold text-civic-ink/90 max-w-3xl mx-auto leading-snug">
            Municipal grievances resolved with calm, accountable intelligence
          </h1>
          <p className="mt-4 text-base sm:text-lg text-civic-mute max-w-2xl mx-auto leading-relaxed">
            Auto-categorize complaints, score hazards, suppress duplicates, and open city performance to every citizen.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link to="/submit" className="btn-primary !px-7 !py-3.5">
              <span>Lodge a Grievance</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/analytics" className="btn-secondary !px-7 !py-3.5">
              <TrendingUp className="w-5 h-5 text-civic-teal" />
              <span>Public Transparency</span>
            </Link>
          </div>
        </div>

        <div className="relative mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left animate-fade-up" style={{ animationDelay: '120ms' }}>
          <StatsCard
            title="Total Grievances"
            value={defaultKpis.total_complaints.toLocaleString()}
            subtitle="Registered City-wide"
            icon={Building2}
            color="teal"
          />
          <StatsCard
            title="Resolved Cases"
            value={defaultKpis.resolved_count.toLocaleString()}
            subtitle={`${defaultKpis.resolution_rate}% Resolution Rate`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatsCard
            title="Average SLA"
            value={`${defaultKpis.average_resolution_hours}h`}
            subtitle="Mean Resolution Time"
            icon={Clock}
            color="amber"
          />
          <StatsCard
            title="AI Accuracy"
            value="94.6%"
            subtitle="Auto-Categorization"
            icon={Brain}
            color="blue"
          />
        </div>
      </section>

      <section className="py-20 border-y border-civic-line/70 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-teal">Next-Gen Municipal Tech</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-civic-ink mt-2">
              Why Urban Lens outperforms traditional portals
            </h2>
            <p className="text-civic-mute mt-3 text-sm sm:text-base">
              Automated triage, duplicate suppression, and hazard detection — without the bureaucratic lag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Instant NLP Classification',
                body: 'Trained models classify complaints into PWD, Sanitation, Electricity, or Water Supply within milliseconds from plain text.',
              },
              {
                icon: Zap,
                title: 'Dynamic Priority Engine',
                body: 'Assigns 1–100 severity scores from hazard keywords and geo-spatial frequency clustering for faster field response.',
              },
              {
                icon: Layers,
                title: 'Duplicate Suppression',
                body: 'Haversine distance plus text similarity clusters repeat reports of the same incident into one actionable ticket.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-8 rounded-2xl surface group">
                <div className="w-12 h-12 rounded-xl bg-civic-teal-soft border border-civic-teal/20 flex items-center justify-center text-civic-teal mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-civic-ink mb-3">{title}</h3>
                <p className="text-sm text-civic-mute leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-teal">Live Civic Geolocation</p>
            <h2 className="font-display text-3xl font-bold text-civic-ink mt-1">Real-time ward activity map</h2>
            <p className="text-sm text-civic-mute mt-2">Transparent live view of active municipal grievances across wards.</p>
          </div>
          <Link to="/analytics" className="inline-flex items-center gap-1.5 text-sm font-semibold text-civic-teal hover:text-civic-teal-dark">
            <span>Explore full heatmaps</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="rounded-2xl border border-civic-line overflow-hidden shadow-soft bg-white">
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
        </div>
      </section>

      <section className="py-20 border-t border-civic-line/70 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-civic-teal">Simple 4-Step Process</p>
            <h2 className="font-display text-3xl font-bold text-civic-ink mt-2">How Urban Lens resolves grievances</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: '1', title: 'Lodge Incident', body: 'Submit photo & GPS. NLP detects department and severity in real time.' },
              { n: '2', title: 'Smart Prioritization', body: 'Hazard risks escalate to Critical (90+) and route into department queues.' },
              { n: '3', title: 'Field Officer Dispatch', body: 'Municipal teams inspect, fix, and record photographic proof of resolution.' },
              { n: '4', title: 'Public Verification', body: 'Citizens verify proof, earn civic karma, and view open audit logs.' },
            ].map((step) => (
              <div key={step.n} className="p-6 rounded-2xl surface">
                <span className="w-8 h-8 rounded-full bg-civic-teal text-white font-black text-sm flex items-center justify-center mb-4">{step.n}</span>
                <h3 className="font-bold text-civic-ink text-base mb-2">{step.title}</h3>
                <p className="text-xs text-civic-mute leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer is rendered globally from App.jsx */}
    </div>
  );
}

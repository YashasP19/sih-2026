import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { innovationService } from '../services/innovationService';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import PageTransition from '../components/PageTransition';
import Loader from '../components/Loader';
import { timeAgo, parseApiError } from '../utils/helpers';
import {
  DOMAINS,
  PROJECT_STATUS_TYPES,
  SUPPORT_TYPES,
  SUPPORT_OFFER_STATUS_TYPES,
} from '../utils/constants';
import {
  Briefcase,
  Handshake,
  Search,
  Building2,
  Clock,
  ChevronRight,
  IndianRupee,
  Layers,
  Inbox,
} from 'lucide-react';

export default function IndustryPortal() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Offer modal state
  const [offerTarget, setOfferTarget] = useState(null);
  const [offerForm, setOfferForm] = useState({ support_type: 'MENTORSHIP', description: '', amount: '' });
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await innovationService.getProjects();
      setProjects(res.results || []);
    } catch (e) {
      console.warn('Industry portal load failed:', e);
      if (!silent) {
        setProjects([]);
        addToast('Could not load innovation projects. Start the backend server.', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openOfferModal = (project) => {
    setOfferTarget(project);
    setOfferForm({ support_type: 'MENTORSHIP', description: '', amount: '' });
  };

  const handleOfferSupport = async (e) => {
    e.preventDefault();
    if (!offerTarget) return;

    setSubmittingOffer(true);
    try {
      const payload = {
        support_type: offerForm.support_type,
        description: offerForm.description,
      };
      if (offerForm.amount) payload.amount = offerForm.amount;

      await innovationService.offerSupport(offerTarget.id, payload);
      addToast(`Support offer sent for "${offerTarget.title}".`, 'success');
      setOfferTarget(null);
      loadData();
    } catch (err) {
      addToast(parseApiError(err, 'Could not submit your support offer. Please try again.'), 'error');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesDomain = domainFilter === 'ALL' || project.domain === domainFilter;
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      project.title?.toLowerCase().includes(q) ||
      project.code?.toLowerCase().includes(q) ||
      project.university_name?.toLowerCase().includes(q) ||
      project.proposal_summary?.toLowerCase().includes(q);
    return matchesDomain && matchesStatus && matchesSearch;
  });

  // Offers this partner has already made, harvested from the project payloads
  const myOffers = projects.flatMap((project) =>
    (project.support_offers || [])
      .filter((offer) => !user?.organization_name || offer.partner_name === user.organization_name)
      .map((offer) => ({ ...offer, project }))
  );

  const acceptedOffers = myOffers.filter((o) => o.status === 'ACCEPTED');
  const totalCommitted = myOffers
    .filter((o) => o.status === 'ACCEPTED' && o.amount)
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const filtersActive = domainFilter !== 'ALL' || statusFilter !== 'ALL' || Boolean(searchQuery.trim());

  const clearFilters = () => {
    setDomainFilter('ALL');
    setStatusFilter('ALL');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role="INDUSTRY" />

        <PageTransition className="flex-1 space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl glass-panel bg-gradient-to-r from-civic-sand via-white to-civic-teal-soft dark:from-slate-800 dark:via-civic-night-paper dark:to-teal-950/40 border border-civic-teal/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-civic-teal" />
                <h1 className="text-2xl font-extrabold text-civic-ink">Industry Partnership Portal</h1>
              </div>
              <p className="text-xs text-civic-mute mt-1">
                Browse university innovation projects and offer mentorship, funding, prototyping, or pilot deployment.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadData(false)}
              className="px-3 py-1 rounded-xl bg-civic-teal-soft text-civic-teal-dark dark:bg-teal-950/40 dark:text-teal-300 text-xs font-semibold border border-civic-teal/25 self-start sm:self-auto"
            >
              Refresh
            </button>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-civic-teal-soft text-civic-teal border border-civic-teal/25">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">Open Projects</p>
                <p className="text-2xl font-extrabold text-civic-ink mt-0.5">{projects.length}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-civic-teal-soft text-civic-teal border border-civic-teal/25">
                <Handshake className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">My Offers Accepted</p>
                <p className="text-2xl font-extrabold text-civic-teal mt-0.5">
                  {acceptedOffers.length}/{myOffers.length}
                </p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">Funding Committed</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
                  ₹{totalCommitted.toLocaleString('en-IN')}
                </p>
              </div>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-civic-mute" />
              <input
                type="text"
                placeholder="Search project, institution, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-civic-line rounded-xl text-civic-mute font-semibold focus:outline-none focus:border-civic-teal"
              >
                <option value="ALL">All Domains</option>
                {DOMAINS.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-civic-line rounded-xl text-civic-mute font-semibold focus:outline-none focus:border-civic-teal"
              >
                <option value="ALL">All Stages</option>
                {Object.entries(PROJECT_STATUS_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-2 rounded-xl border border-civic-line text-civic-teal font-semibold hover:bg-civic-teal-soft whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filtersActive && projects.length > 0 && (
            <p className="text-[11px] text-civic-mute -mt-2">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          )}

          {/* Project Feed */}
          {loading ? (
            <Loader text="Loading university innovation projects..." />
          ) : filteredProjects.length === 0 ? (
            <Card className="text-center py-16">
              <Inbox className="w-12 h-12 text-civic-mute mx-auto mb-3" />
              <h3 className="text-base font-bold text-civic-ink">
                {filtersActive ? 'No projects match these filters' : 'No open projects yet'}
              </h3>
              <p className="text-xs text-civic-mute mt-1 max-w-md mx-auto">
                {filtersActive
                  ? `There are ${projects.length} projects available, but none match the current filters.`
                  : 'Universities have not opened any innovation projects for industry collaboration yet.'}
              </p>
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="btn-primary mt-4 !py-2 !px-4 !text-xs inline-flex">
                  Show all {projects.length} projects
                </button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <div key={project.id} className="p-5 rounded-2xl glass-card flex flex-col gap-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {project.code && (
                          <span className="px-2 py-0.5 rounded bg-civic-sand text-civic-teal font-mono text-[11px] font-bold border border-civic-line">
                            {project.code}
                          </span>
                        )}
                        <StatusBadge status={project.status} types={PROJECT_STATUS_TYPES} />
                        {(project.domain_display || project.challenge?.domain_display) && (
                          <span className="text-[11px] font-semibold text-civic-teal px-2 py-0.5 rounded-full bg-civic-teal-soft">
                            {project.domain_display || project.challenge.domain_display}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-civic-ink leading-snug">{project.title}</h3>
                      <p className="text-sm text-civic-mute leading-relaxed line-clamp-2">{project.proposal_summary}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-civic-mute pt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{project.university_name}</span>
                        </span>
                        {project.faculty_mentor_name && (
                          <span>Mentor: <strong className="text-civic-ink">{project.faculty_mentor_name}</strong></span>
                        )}
                        <span>
                          Team: <strong className="text-civic-ink">{(project.student_members || []).length} students</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Updated {timeAgo(project.updated_at)}</span>
                        </span>
                      </div>

                      {(project.challenge_title || project.challenge?.title) && (
                        <p className="text-[11px] text-civic-mute pt-1 flex flex-wrap items-center gap-1.5">
                          <span>Addressing citizen challenge:</span>
                          {(project.challenge_ticket_id || project.challenge?.ticket_id) && (
                            <span className="px-1.5 py-0.5 rounded bg-civic-sand text-civic-teal font-mono text-[10px] font-bold border border-civic-line">
                              {project.challenge_ticket_id || project.challenge.ticket_id}
                            </span>
                          )}
                          <strong className="text-civic-ink">
                            {project.challenge_title || project.challenge.title}
                          </strong>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-end gap-2 self-end lg:self-start">
                      <Link
                        to={`/project/${project.id}`}
                        className="px-4 py-2 rounded-xl border border-civic-line text-xs font-semibold text-civic-ink hover:bg-civic-sand text-center"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        onClick={() => openOfferModal(project)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-civic-teal to-civic-teal-dark text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 whitespace-nowrap"
                      >
                        <Handshake className="w-3.5 h-3.5" />
                        <span>Offer Support</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* My Support Offers */}
          {myOffers.length > 0 && (
            <div className="space-y-4 pt-2">
              <div>
                <h2 className="text-lg font-bold text-civic-ink flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-civic-teal" />
                  <span>My Support Offers</span>
                </h2>
                <p className="text-xs text-civic-mute">
                  Mentorship, funding, and deployment commitments extended to student innovation teams.
                </p>
              </div>

              <Card className="space-y-3">
                {myOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-civic-sand border border-civic-line dark:bg-slate-800 dark:border-civic-night-line"
                  >
                    <div className="text-xs space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-civic-ink">{offer.support_type_display}</span>
                        <StatusBadge status={offer.status} types={SUPPORT_OFFER_STATUS_TYPES} size="xs" />
                        {offer.amount ? (
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{Number(offer.amount).toLocaleString('en-IN')}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-civic-mute">
                        Project: <strong className="text-civic-ink">{offer.project.title}</strong> ·{' '}
                        {offer.project.university_name}
                      </p>
                      {offer.description && <p className="text-civic-mute leading-relaxed">{offer.description}</p>}
                    </div>

                    <Link
                      to={`/project/${offer.project.id}`}
                      className="p-2 rounded-xl bg-white hover:bg-civic-teal text-civic-mute hover:text-white transition-all self-end sm:self-center dark:bg-civic-night-paper"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </PageTransition>
      </div>

      {/* Offer Support Modal */}
      {offerTarget && (
        <Modal
          isOpen={Boolean(offerTarget)}
          onClose={() => setOfferTarget(null)}
          title="Offer Collaboration Support"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleOfferSupport} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-civic-sand border border-civic-line">
              <p className="text-[10px] uppercase font-bold text-civic-mute mb-1">Innovation Project</p>
              <p className="text-sm font-bold text-civic-ink">{offerTarget.title}</p>
              <p className="text-civic-mute mt-1">{offerTarget.university_name}</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Type of Support <span className="text-rose-600">*</span>
              </label>
              <select
                value={offerForm.support_type}
                onChange={(e) => setOfferForm({ ...offerForm, support_type: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink focus:outline-none focus:border-civic-teal"
              >
                {SUPPORT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                What You Are Offering <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={offerForm.description}
                onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                required
                placeholder="Scope of mentorship, lab facilities, pilot site, deployment support, or funding conditions..."
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
              />
            </div>

            {offerForm.support_type === 'FUNDING' && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                  Funding Amount (INR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={offerForm.amount}
                  onChange={(e) => setOfferForm({ ...offerForm, amount: e.target.value })}
                  placeholder="e.g. 250000"
                  className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                />
              </div>
            )}

            <div className="pt-4 border-t border-civic-line flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOfferTarget(null)}
                className="px-4 py-2 bg-civic-sand hover:bg-civic-line text-civic-mute rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingOffer}
                className="px-5 py-2 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl font-bold shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingOffer ? 'Sending Offer...' : 'Send Support Offer'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

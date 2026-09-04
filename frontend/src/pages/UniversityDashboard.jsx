import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { innovationService } from '../services/innovationService';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Modal from '../components/Modal';
import PageTransition from '../components/PageTransition';
import Loader from '../components/Loader';
import { timeAgo, parseApiError } from '../utils/helpers';
import { PROJECT_STATUS_TYPES } from '../utils/constants';
import {
  GraduationCap,
  Inbox,
  FlaskConical,
  Handshake,
  MapPin,
  Clock,
  Plus,
  X,
  ChevronRight,
  CheckCircle2,
  Layers,
  Search,
  Target,
} from 'lucide-react';

export default function UniversityDashboard() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [challenges, setChallenges] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Claim modal state
  const [claimTarget, setClaimTarget] = useState(null);
  const [claimForm, setClaimForm] = useState({ title: '', proposal_summary: '', faculty_mentor_name: '' });
  const [studentMembers, setStudentMembers] = useState([]);
  const [studentInput, setStudentInput] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [challengeRes, projectRes] = await Promise.allSettled([
        innovationService.getRoutedChallenges(),
        innovationService.getProjects(),
      ]);

      if (challengeRes.status === 'fulfilled') {
        setChallenges(challengeRes.value?.results || []);
      } else if (!silent) {
        setChallenges([]);
        addToast('Could not load routed challenges. Start the backend server.', 'error');
      }

      if (projectRes.status === 'fulfilled') {
        setProjects(projectRes.value?.results || []);
      } else if (!silent) {
        setProjects([]);
      }
    } catch (e) {
      console.warn('University dashboard load failed:', e);
      if (!silent) {
        setChallenges([]);
        setProjects([]);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openClaimModal = (challenge) => {
    setClaimTarget(challenge);
    setClaimForm({
      title: `Solution for: ${challenge.title}`,
      proposal_summary: '',
      faculty_mentor_name: '',
    });
    setStudentMembers([]);
    setStudentInput('');
  };

  const addStudentMember = () => {
    const value = studentInput.trim();
    if (!value) return;
    setStudentMembers((prev) => [...prev, value]);
    setStudentInput('');
  };

  const removeStudentMember = (index) => {
    setStudentMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!claimTarget) return;

    setSubmittingClaim(true);
    try {
      await innovationService.claimChallenge(claimTarget.id, {
        title: claimForm.title,
        proposal_summary: claimForm.proposal_summary,
        faculty_mentor_name: claimForm.faculty_mentor_name,
        student_members: studentMembers,
      });
      addToast(`Challenge ${claimTarget.ticket_id} claimed. Project team created.`, 'success');
      setClaimTarget(null);
      loadData();
    } catch (err) {
      addToast(parseApiError(err, 'Could not claim this challenge. Please try again.'), 'error');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleOfferResponse = async (offerId, status) => {
    try {
      await innovationService.respondToSupportOffer(offerId, status);
      addToast(`Industry support offer ${status === 'ACCEPTED' ? 'accepted' : 'declined'}.`, 'success');
      loadData();
    } catch (err) {
      addToast(parseApiError(err, 'Could not update this support offer.'), 'error');
    }
  };

  const unclaimedChallenges = challenges.filter((c) => !c.has_project);

  const filteredChallenges = unclaimedChallenges.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.ticket_id?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.domain_display?.toLowerCase().includes(q)
    );
  });

  const pendingOffers = projects.flatMap((project) =>
    (project.support_offers || [])
      .filter((offer) => offer.status === 'OFFERED')
      .map((offer) => ({ ...offer, project }))
  );

  const deployedCount = projects.filter((p) => p.status === 'DEPLOYED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role="UNIVERSITY" />

        <PageTransition className="flex-1 space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl glass-panel bg-gradient-to-r from-civic-sand via-white to-civic-teal-soft dark:from-slate-800 dark:via-civic-night-paper dark:to-teal-950/40 border border-civic-teal/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-civic-teal" />
                <h1 className="text-2xl font-extrabold text-civic-ink">Institution Innovation Desk</h1>
              </div>
              <p className="text-xs text-civic-mute mt-1">
                Societal challenges routed to{' '}
                <span className="text-civic-teal font-bold">
                  {user?.organization_name || user?.first_name || 'your institution'}
                </span>{' '}
                by thematic domain and faculty expertise.
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
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">Open Challenges</p>
                <p className="text-2xl font-extrabold text-civic-ink mt-0.5">{unclaimedChallenges.length}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-civic-teal-soft text-civic-teal border border-civic-teal/25">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">Active Projects</p>
                <p className="text-2xl font-extrabold text-civic-teal mt-0.5">{projects.length}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">Deployed Solutions</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{deployedCount}</p>
              </div>
            </Card>
          </div>

          {/* Pending Industry Support Offers */}
          {pendingOffers.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 dark:bg-amber-950/40 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <Handshake className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  {pendingOffers.length} Industry Support Offer{pendingOffers.length > 1 ? 's' : ''} Awaiting Your Response
                </h3>
              </div>

              <div className="space-y-2">
                {pendingOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white border border-amber-200 dark:bg-civic-night-paper dark:border-amber-800"
                  >
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-civic-ink">
                        {offer.partner_name} · {offer.support_type_display}
                        {offer.amount ? ` · ₹${Number(offer.amount).toLocaleString('en-IN')}` : ''}
                      </p>
                      <p className="text-civic-mute">
                        For project: <strong className="text-civic-ink">{offer.project.title}</strong>
                      </p>
                      {offer.description && <p className="text-civic-mute leading-relaxed">{offer.description}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOfferResponse(offer.id, 'DECLINED')}
                        className="px-3 py-1.5 rounded-xl border border-civic-line text-xs font-semibold text-civic-mute hover:bg-civic-sand"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOfferResponse(offer.id, 'ACCEPTED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <Loader text="Loading routed challenges and institutional projects..." />
          ) : (
            <>
              {/* Section A: Challenges Routed To Us */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-civic-ink flex items-center gap-2">
                      <Inbox className="w-5 h-5 text-civic-teal" />
                      <span>Challenges Routed to Us</span>
                    </h2>
                    <p className="text-xs text-civic-mute">
                      AI-classified, deduplicated citizen challenges matched to your academic disciplines.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-civic-mute" />
                    <input
                      type="text"
                      placeholder="Search challenge, domain, ticket..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                    />
                  </div>
                </div>

                {filteredChallenges.length === 0 ? (
                  <Card className="text-center py-14">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-civic-ink">No unclaimed challenges</h3>
                    <p className="text-xs text-civic-mute mt-1 max-w-md mx-auto">
                      {searchQuery
                        ? 'No routed challenges match your search. Clear the search to see all.'
                        : 'Every challenge routed to your institution has been picked up by a project team.'}
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {filteredChallenges.map((item) => (
                      <div key={item.id || item.ticket_id} className="p-5 rounded-2xl glass-card flex flex-col gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-civic-sand text-civic-teal font-mono text-[11px] font-bold border border-civic-line">
                                {item.ticket_id}
                              </span>
                              <PriorityBadge urgency={item.urgency} score={item.priority_score} />
                              <StatusBadge status={item.status} />
                              {item.domain_display && (
                                <span className="text-[11px] font-semibold text-civic-teal px-2 py-0.5 rounded-full bg-civic-teal-soft">
                                  {item.domain_display}
                                </span>
                              )}
                            </div>

                            <h3 className="text-base font-bold text-civic-ink leading-snug">{item.title}</h3>
                            <p className="text-sm text-civic-mute leading-relaxed line-clamp-2">{item.description}</p>

                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-civic-mute pt-1">
                              {item.address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{item.address}</span>
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Reported {timeAgo(item.created_at)}</span>
                              </span>
                              {item.ward_number && <span>Ward: <strong className="text-civic-ink">{item.ward_number}</strong></span>}
                              <Link to={`/challenge/${item.id}/timeline`} className="font-bold text-civic-teal hover:underline">
                                View Full Timeline →
                              </Link>
                            </div>

                            {item.routing_reason && (
                              <div className="flex items-start gap-1.5 text-[11px] text-civic-teal bg-civic-teal-soft/60 rounded-lg px-2.5 py-1.5 mt-1">
                                <Target className="w-3.5 h-3.5 mt-[1px] shrink-0" />
                                <span><strong className="font-semibold">Why your institution:</strong> {item.routing_reason}</span>
                              </div>
                            )}
                          </div>

                          <div className="self-end lg:self-start">
                            <button
                              type="button"
                              onClick={() => openClaimModal(item)}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-civic-teal to-civic-teal-dark text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 whitespace-nowrap"
                            >
                              <FlaskConical className="w-3.5 h-3.5" />
                              <span>Claim Challenge</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section B: Our Projects */}
              <div className="space-y-4 pt-2">
                <div>
                  <h2 className="text-lg font-bold text-civic-ink flex items-center gap-2">
                    <Layers className="w-5 h-5 text-civic-teal" />
                    <span>Our Student Innovation Projects</span>
                  </h2>
                  <p className="text-xs text-civic-mute">
                    Multidisciplinary teams, faculty mentors, and milestone progress against each claimed challenge.
                  </p>
                </div>

                {projects.length === 0 ? (
                  <Card className="text-center py-14">
                    <FlaskConical className="w-12 h-12 text-civic-mute mx-auto mb-3" />
                    <h3 className="text-base font-bold text-civic-ink">No projects yet</h3>
                    <p className="text-xs text-civic-mute mt-1 max-w-md mx-auto">
                      Claim a routed challenge above to constitute a student-faculty team and open a project.
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => {
                      const milestones = project.milestones || [];
                      const completed = milestones.filter((m) => m.status === 'COMPLETED').length;
                      const milestoneTotal = project.milestones_count ?? milestones.length;
                      const progress = project.progress_percent ?? 0;

                      return (
                        <Link key={project.id} to={`/project/${project.id}`} className="block">
                          <Card hover={true} className="cursor-pointer group space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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

                                <h3 className="text-base font-bold text-civic-ink group-hover:text-civic-teal transition-colors">
                                  {project.title}
                                </h3>

                                {(project.challenge_ticket_id || project.challenge_title) && (
                                  <p className="text-[11px] text-civic-mute flex flex-wrap items-center gap-1.5">
                                    <span>From challenge:</span>
                                    {project.challenge_ticket_id && (
                                      <span className="px-1.5 py-0.5 rounded bg-civic-sand text-civic-teal font-mono text-[10px] font-bold border border-civic-line">
                                        {project.challenge_ticket_id}
                                      </span>
                                    )}
                                    {project.challenge_title && (
                                      <strong className="text-civic-ink">{project.challenge_title}</strong>
                                    )}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-[11px] text-civic-mute">
                                  {project.faculty_mentor_name && (
                                    <span>Mentor: <strong className="text-civic-ink">{project.faculty_mentor_name}</strong></span>
                                  )}
                                  <span>
                                    Team: <strong className="text-civic-ink">{(project.student_members || []).length} students</strong>
                                  </span>
                                  <span>
                                    Milestones: <strong className="text-civic-ink">{completed}/{milestoneTotal}</strong>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Updated {timeAgo(project.updated_at)}</span>
                                  </span>
                                </div>
                              </div>

                              <div className="self-end sm:self-center">
                                <span className="p-2 rounded-xl bg-civic-sand group-hover:bg-civic-teal text-civic-mute group-hover:text-white transition-all inline-flex">
                                  <ChevronRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-semibold">
                                <span className="text-civic-mute">Project Progress</span>
                                <span className="text-civic-teal font-bold">{progress}%</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-civic-sand overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-civic-teal to-emerald-500 transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </PageTransition>
      </div>

      {/* Claim Challenge Modal */}
      {claimTarget && (
        <Modal
          isOpen={Boolean(claimTarget)}
          onClose={() => setClaimTarget(null)}
          title={`Claim Challenge: ${claimTarget.ticket_id}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleClaim} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-civic-sand border border-civic-line">
              <p className="text-[10px] uppercase font-bold text-civic-mute mb-1">Societal Challenge</p>
              <p className="text-sm font-bold text-civic-ink">{claimTarget.title}</p>
              <p className="text-civic-mute mt-1 leading-relaxed line-clamp-3">{claimTarget.description}</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Project Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={claimForm.title}
                onChange={(e) => setClaimForm({ ...claimForm, title: e.target.value })}
                required
                placeholder="e.g. Low-cost iron removal filter for village handpumps"
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Solution Proposal Summary <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={claimForm.proposal_summary}
                onChange={(e) => setClaimForm({ ...claimForm, proposal_summary: e.target.value })}
                required
                placeholder="Approach, methodology, expected deliverables, and measurable social outcome..."
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Faculty Mentor <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={claimForm.faculty_mentor_name}
                onChange={(e) => setClaimForm({ ...claimForm, faculty_mentor_name: e.target.value })}
                required
                placeholder="e.g. Dr. S. Mahato (Civil Engineering)"
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Multidisciplinary Student Team
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addStudentMember();
                    }
                  }}
                  placeholder="e.g. Priya Kumari (B.Tech CSE, 3rd Yr)"
                  className="flex-1 px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                />
                <button
                  type="button"
                  onClick={addStudentMember}
                  className="flex items-center gap-1 px-3 py-2.5 bg-civic-teal-soft text-civic-teal-dark border border-civic-teal/25 rounded-xl font-bold whitespace-nowrap dark:bg-teal-950/40 dark:text-teal-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {studentMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {studentMembers.map((member, index) => (
                    <span
                      key={`${member}-${index}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-civic-sand border border-civic-line text-[11px] font-semibold text-civic-ink"
                    >
                      {member}
                      <button
                        type="button"
                        onClick={() => removeStudentMember(index)}
                        className="text-civic-mute hover:text-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-civic-line flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClaimTarget(null)}
                className="px-4 py-2 bg-civic-sand hover:bg-civic-line text-civic-mute rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingClaim}
                className="px-5 py-2 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl font-bold shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingClaim ? 'Creating Project...' : 'Constitute Team & Claim'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

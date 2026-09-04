import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { innovationService } from '../services/innovationService';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import PageTransition from '../components/PageTransition';
import Loader from '../components/Loader';
import { formatDate, timeAgo, parseApiError } from '../utils/helpers';
import {
  PROJECT_STATUS_TYPES,
  PROJECT_STATUS_FLOW,
  MILESTONE_STATUS_TYPES,
  SUPPORT_OFFER_STATUS_TYPES,
} from '../utils/constants';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Users,
  FileText,
  Flag,
  Handshake,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  CircleDot,
  Circle,
  Ban,
  IndianRupee,
  Award,
  BadgeCheck,
  Users2,
  MapPinned,
  Rocket,
  ScrollText,
} from 'lucide-react';

const MILESTONE_ICONS = {
  COMPLETED: CheckCircle2,
  IN_PROGRESS: CircleDot,
  BLOCKED: Ban,
  PENDING: Circle,
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [remarks, setRemarks] = useState('');
  const [academicCredits, setAcademicCredits] = useState(0);
  const [countsAsCapstone, setCountsAsCapstone] = useState(false);
  const [countsAsInternship, setCountsAsInternship] = useState(false);
  const [peopleBenefited, setPeopleBenefited] = useState('');
  const [villagesCovered, setVillagesCovered] = useState('');
  const [solutionCost, setSolutionCost] = useState('');
  const [patentFiled, setPatentFiled] = useState(false);
  const [patentDetails, setPatentDetails] = useState('');
  const [startupCreated, setStartupCreated] = useState(false);
  const [startupName, setStartupName] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Milestone form
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' });
  const [submittingMilestone, setSubmittingMilestone] = useState(false);

  // Student contribution form
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [contributionForm, setContributionForm] = useState({
    student_name: '', role: '', contribution_summary: '', credits_earned: 0,
  });
  const [submittingContribution, setSubmittingContribution] = useState(false);

  const isUniversity = user?.role === 'UNIVERSITY' || user?.role === 'ADMIN';

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await innovationService.getProjectById(id);
      setProject(data);
      setNewStatus(data.status);
      setAcademicCredits(data.academic_credits || 0);
      setCountsAsCapstone(!!data.counts_as_capstone);
      setCountsAsInternship(!!data.counts_as_internship);
      setPeopleBenefited(data.people_benefited ?? '');
      setVillagesCovered(data.villages_covered ?? '');
      setSolutionCost(data.solution_cost ?? '');
      setPatentFiled(!!data.patent_filed);
      setPatentDetails(data.patent_details || '');
      setStartupCreated(!!data.startup_created);
      setStartupName(data.startup_name || '');
    } catch (e) {
      console.warn('Project detail load failed:', e);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSubmittingStatus(true);
    try {
      await innovationService.updateProjectStatus(id, {
        status: newStatus,
        remarks,
        academic_credits: academicCredits,
        counts_as_capstone: countsAsCapstone,
        counts_as_internship: countsAsInternship,
        ...(newStatus === 'DEPLOYED' ? {
          people_benefited: peopleBenefited === '' ? null : Number(peopleBenefited),
          villages_covered: villagesCovered === '' ? null : Number(villagesCovered),
          solution_cost: solutionCost === '' ? null : Number(solutionCost),
          patent_filed: patentFiled,
          patent_details: patentDetails,
          startup_created: startupCreated,
          startup_name: startupName,
        } : {}),
      });
      addToast('Project stage updated.', 'success');
      setStatusModalOpen(false);
      setRemarks('');
      loadProject();
    } catch (err) {
      addToast(parseApiError(err, 'Could not update the project stage.'), 'error');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    setSubmittingMilestone(true);
    try {
      await innovationService.addMilestone(id, milestoneForm);
      addToast('Milestone added to the project plan.', 'success');
      setMilestoneModalOpen(false);
      setMilestoneForm({ title: '', description: '', due_date: '' });
      loadProject();
    } catch (err) {
      addToast(parseApiError(err, 'Could not add this milestone.'), 'error');
    } finally {
      setSubmittingMilestone(false);
    }
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    setSubmittingContribution(true);
    try {
      await innovationService.addStudentContribution(id, contributionForm);
      addToast('Student contribution logged to their Innovation Record.', 'success');
      setContributionModalOpen(false);
      setContributionForm({ student_name: '', role: '', contribution_summary: '', credits_earned: 0 });
      loadProject();
    } catch (err) {
      addToast(parseApiError(err, 'Could not log this contribution.'), 'error');
    } finally {
      setSubmittingContribution(false);
    }
  };

  const cycleMilestoneStatus = async (milestone) => {
    const order = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = order.indexOf(milestone.status);
    const next = order[(currentIndex + 1) % order.length];

    try {
      await innovationService.updateMilestoneStatus(milestone.id, next);
      addToast(`Milestone marked ${MILESTONE_STATUS_TYPES[next]?.label || next}.`, 'success');
      loadProject();
    } catch (err) {
      addToast(parseApiError(err, 'Could not update this milestone.'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar role={user?.role} />
          <div className="flex-1">
            <Loader text="Loading innovation project..." />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar role={user?.role} />
          <Card className="flex-1 text-center py-16">
            <FileText className="w-12 h-12 text-civic-mute mx-auto mb-3" />
            <h3 className="text-base font-bold text-civic-ink">Project not found</h3>
            <p className="text-xs text-civic-mute mt-1 max-w-md mx-auto">
              This innovation project could not be loaded. It may have been removed, or the backend is not running.
            </p>
            <Link to="/" className="btn-primary mt-4 !py-2 !px-4 !text-xs inline-flex">
              Back to Home
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const milestones = project.milestones || [];
  const supportOffers = project.support_offers || [];
  const studentMembers = project.student_members || [];
  const studentContributions = project.student_contributions || [];
  const progress = project.progress_percent ?? 0;
  const completedMilestones = milestones.filter((m) => m.status === 'COMPLETED').length;
  const acceptedFunding = supportOffers
    .filter((o) => o.status === 'ACCEPTED' && o.amount)
    .reduce((sum, o) => sum + Number(o.amount), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role={user?.role} />
        <PageTransition className="flex-1 space-y-6">
        {/* Back link */}
        <Link
          to={user?.role === 'INDUSTRY' ? '/industry' : '/university'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-civic-mute hover:text-civic-teal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to workspace</span>
        </Link>

        {/* Header */}
        <div className="p-6 rounded-3xl glass-panel bg-gradient-to-r from-civic-sand via-white to-civic-teal-soft dark:from-slate-800 dark:via-civic-night-paper dark:to-teal-950/40 border border-civic-teal/25 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {project.code && (
                  <span className="px-2 py-0.5 rounded bg-white text-civic-teal font-mono text-[11px] font-bold border border-civic-line dark:bg-civic-night-paper">
                    {project.code}
                  </span>
                )}
                <StatusBadge status={project.status} types={PROJECT_STATUS_TYPES} size="lg" />
                {project.challenge?.domain_display && (
                  <span className="text-[11px] font-semibold text-civic-teal px-2 py-0.5 rounded-full bg-civic-teal-soft">
                    {project.challenge.domain_display}
                  </span>
                )}
                {project.academic_credits > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
                    <Award className="w-3 h-3" />
                    {project.academic_credits} credit{project.academic_credits === 1 ? '' : 's'}
                  </span>
                )}
                {project.counts_as_capstone && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-700 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300">
                    <BadgeCheck className="w-3 h-3" />
                    Capstone
                  </span>
                )}
                {project.counts_as_internship && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                    <BadgeCheck className="w-3 h-3" />
                    Internship
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold text-civic-ink leading-snug">{project.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-civic-mute">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{project.university_name}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updated {timeAgo(project.updated_at)}</span>
                </span>
                <span>Opened {formatDate(project.created_at)}</span>
              </div>
            </div>

            {isUniversity && (
              <button
                type="button"
                onClick={() => setStatusModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-civic-teal to-civic-teal-dark text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105 whitespace-nowrap self-start"
              >
                Update Project Stage
              </button>
            )}
          </div>

          {/* Progress + Stage Stepper */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="text-civic-mute">
                  Lifecycle Progress · {completedMilestones}/{milestones.length} milestones complete
                </span>
                <span className="text-civic-teal font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-white/70 overflow-hidden dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-civic-teal to-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
              {PROJECT_STATUS_FLOW.map((stage, index) => {
                const currentIndex = PROJECT_STATUS_FLOW.indexOf(project.status);
                const reached = currentIndex >= index && currentIndex !== -1;
                return (
                  <div
                    key={stage}
                    className={`p-2 rounded-lg font-bold border ${
                      reached
                        ? 'bg-civic-teal/20 text-civic-teal border-civic-teal/35'
                        : 'bg-white/60 text-civic-mute border-civic-line dark:bg-slate-800/60'
                    }`}
                  >
                    {index + 1}. {PROJECT_STATUS_TYPES[stage]?.label || stage}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Originating Challenge Context */}
        {project.challenge && (
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
                <FileText className="w-4 h-4 text-civic-teal" />
                <span>Originating Citizen Challenge</span>
              </h3>
              <Link
                to={`/challenge/${project.challenge.id}/timeline`}
                className="text-[11px] font-bold text-civic-teal hover:underline whitespace-nowrap"
              >
                View Full Timeline →
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-civic-sand border border-civic-line space-y-2 dark:bg-slate-800 dark:border-civic-night-line">
              <div className="flex flex-wrap items-center gap-2">
                {project.challenge.ticket_id && (
                  <span className="px-2 py-0.5 rounded bg-white text-civic-teal font-mono text-[11px] font-bold border border-civic-line dark:bg-civic-night-paper">
                    {project.challenge.ticket_id}
                  </span>
                )}
                {project.challenge.domain_display && (
                  <span className="text-[11px] font-semibold text-civic-teal px-2 py-0.5 rounded-full bg-civic-teal-soft">
                    {project.challenge.domain_display}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-civic-ink">{project.challenge.title}</p>
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-civic-mute">
                {project.challenge.ward_number && (
                  <span>Ward: <strong className="text-civic-ink">{project.challenge.ward_number}</strong></span>
                )}
                {project.challenge.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{project.challenge.address}</span>
                  </span>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Team + Proposal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
              <Users className="w-4 h-4 text-civic-teal" />
              <span>Project Team</span>
            </h3>

            {project.faculty_mentor_name && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-civic-teal-soft border border-civic-teal/25 dark:bg-teal-950/40 dark:border-teal-500/20">
                <div className="p-2 rounded-lg bg-civic-teal text-white dark:bg-teal-600">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="text-[10px] uppercase font-bold text-civic-mute">Faculty Mentor</p>
                  <p className="font-bold text-civic-ink">{project.faculty_mentor_name}</p>
                </div>
              </div>
            )}

            {studentMembers.length === 0 ? (
              <p className="text-xs text-civic-mute">No student members recorded for this project yet.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-civic-mute">
                  Student Members ({studentMembers.length})
                </p>
                {studentMembers.map((member, index) => (
                  <div
                    key={`${member}-${index}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-civic-sand border border-civic-line dark:bg-slate-800 dark:border-civic-night-line"
                  >
                    <div className="w-7 h-7 rounded-lg bg-civic-teal flex items-center justify-center font-bold text-white text-[11px] uppercase dark:bg-teal-600">
                      {member[0]}
                    </div>
                    <span className="text-xs font-semibold text-civic-ink">{member}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-civic-teal" />
              <span>Solution Proposal</span>
            </h3>
            <p className="text-xs text-civic-mute leading-relaxed bg-civic-sand p-4 rounded-xl border border-civic-line dark:bg-slate-800 dark:border-civic-night-line">
              {project.proposal_summary || 'No proposal summary submitted yet.'}
            </p>
          </Card>
        </div>

        {/* Community Impact — captured once the solution is deployed */}
        {project.status === 'DEPLOYED' && (
          <Card className="space-y-4 border-emerald-200 dark:border-emerald-800/40">
            <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-600" />
              <span>Community Impact</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/30 dark:border-emerald-800/40">
                <Users2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-extrabold text-civic-ink">
                  {project.people_benefited != null ? project.people_benefited.toLocaleString('en-IN') : '—'}
                </p>
                <p className="text-[10px] uppercase font-bold text-civic-mute">People Benefited</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/30 dark:border-emerald-800/40">
                <MapPinned className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-extrabold text-civic-ink">
                  {project.villages_covered != null ? project.villages_covered : '—'}
                </p>
                <p className="text-[10px] uppercase font-bold text-civic-mute">Villages / Wards</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/30 dark:border-emerald-800/40">
                <IndianRupee className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-extrabold text-civic-ink">
                  {project.solution_cost != null ? `₹${Number(project.solution_cost).toLocaleString('en-IN')}` : '—'}
                </p>
                <p className="text-[10px] uppercase font-bold text-civic-mute">Solution Cost</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center dark:bg-emerald-950/30 dark:border-emerald-800/40">
                <ScrollText className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-lg font-extrabold text-civic-ink">
                  {(project.patent_filed ? 1 : 0) + (project.startup_created ? 1 : 0)}
                </p>
                <p className="text-[10px] uppercase font-bold text-civic-mute">IP / Startups</p>
              </div>
            </div>

            {(project.patent_filed || project.startup_created) && (
              <div className="flex flex-wrap gap-2">
                {project.patent_filed && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-700 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Patent filed{project.patent_details ? `: ${project.patent_details}` : ''}
                  </span>
                )}
                {project.startup_created && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                    <Rocket className="w-3.5 h-3.5" />
                    Startup created{project.startup_name ? `: ${project.startup_name}` : ''}
                  </span>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Student Innovation Record */}
        <Card className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
                <Award className="w-4 h-4 text-civic-teal" />
                <span>Student Innovation Record</span>
              </h3>
              <p className="text-xs text-civic-mute mt-0.5">
                Per-student credits and contribution, feeding each student's NEP 2020 outcome record.
              </p>
            </div>

            {isUniversity && (
              <button
                type="button"
                onClick={() => setContributionModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-civic-teal-soft text-civic-teal-dark border border-civic-teal/25 rounded-xl text-xs font-bold whitespace-nowrap dark:bg-teal-950/40 dark:text-teal-300 self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Contribution</span>
              </button>
            )}
          </div>

          {studentContributions.length === 0 ? (
            <p className="text-xs text-civic-mute text-center py-6">
              No student contributions logged yet.{' '}
              {isUniversity ? 'Log each student\'s role and credits as the project progresses.' : ''}
            </p>
          ) : (
            <div className="space-y-2">
              {studentContributions.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-civic-sand border border-civic-line space-y-1 dark:bg-slate-800 dark:border-civic-night-line"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-civic-ink">{c.student_name}</span>
                    {c.role && (
                      <span className="text-[11px] font-semibold text-civic-teal px-2 py-0.5 rounded-full bg-civic-teal-soft">
                        {c.role}
                      </span>
                    )}
                    {c.credits_earned > 0 && (
                      <span className="text-[11px] font-semibold text-amber-700 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
                        {c.credits_earned} credit{c.credits_earned === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                  {c.contribution_summary && (
                    <p className="text-[11px] text-civic-mute leading-relaxed">{c.contribution_summary}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Milestone Timeline */}
        <Card className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
                <Flag className="w-4 h-4 text-civic-teal" />
                <span>Milestone & Deliverable Timeline</span>
              </h3>
              <p className="text-xs text-civic-mute mt-0.5">
                Track research milestones, prototyping deliverables, and validation outcomes.
              </p>
            </div>

            {isUniversity && (
              <button
                type="button"
                onClick={() => setMilestoneModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-civic-teal-soft text-civic-teal-dark border border-civic-teal/25 rounded-xl text-xs font-bold whitespace-nowrap dark:bg-teal-950/40 dark:text-teal-300 self-start"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            )}
          </div>

          {milestones.length === 0 ? (
            <p className="text-xs text-civic-mute text-center py-6">
              No milestones defined yet. {isUniversity ? 'Add the first deliverable to open the project plan.' : ''}
            </p>
          ) : (
            <div className="space-y-3">
              {milestones.map((milestone) => {
                const Icon = MILESTONE_ICONS[milestone.status] || Circle;
                return (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-3 p-4 rounded-xl bg-civic-sand border border-civic-line dark:bg-slate-800 dark:border-civic-night-line"
                  >
                    <button
                      type="button"
                      onClick={() => isUniversity && cycleMilestoneStatus(milestone)}
                      disabled={!isUniversity}
                      title={isUniversity ? 'Click to advance milestone status' : undefined}
                      className={`p-2 rounded-lg border transition-all ${
                        MILESTONE_STATUS_TYPES[milestone.status]?.bg ||
                        'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      } ${isUniversity ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-civic-ink">{milestone.title}</p>
                        <StatusBadge status={milestone.status} types={MILESTONE_STATUS_TYPES} size="xs" />
                      </div>
                      {milestone.description && (
                        <p className="text-[11px] text-civic-mute leading-relaxed">{milestone.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-civic-mute">
                        {milestone.due_date && <span>Due {formatDate(milestone.due_date)}</span>}
                        {milestone.completed_at && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Completed {formatDate(milestone.completed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Industry Support Offers */}
        <Card className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-civic-ink flex items-center gap-2">
              <Handshake className="w-4 h-4 text-civic-teal" />
              <span>Industry & Ecosystem Support</span>
            </h3>
            {acceptedFunding > 0 && (
              <p className="text-xs text-civic-mute mt-0.5 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    ₹{acceptedFunding.toLocaleString('en-IN')}
                  </strong>{' '}
                  in committed funding accepted
                </span>
              </p>
            )}
          </div>

          {supportOffers.length === 0 ? (
            <p className="text-xs text-civic-mute text-center py-6">
              No industry partner has offered support to this project yet.
            </p>
          ) : (
            <div className="space-y-2">
              {supportOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-3 rounded-xl bg-civic-sand border border-civic-line space-y-1 dark:bg-slate-800 dark:border-civic-night-line"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-civic-ink">{offer.partner_name}</span>
                    <span className="text-[11px] font-semibold text-civic-teal px-2 py-0.5 rounded-full bg-civic-teal-soft">
                      {offer.support_type_display}
                    </span>
                    <StatusBadge status={offer.status} types={SUPPORT_OFFER_STATUS_TYPES} size="xs" />
                    {offer.amount ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{Number(offer.amount).toLocaleString('en-IN')}
                      </span>
                    ) : null}
                  </div>
                  {offer.description && (
                    <p className="text-[11px] text-civic-mute leading-relaxed">{offer.description}</p>
                  )}
                  <p className="text-[10px] text-civic-mute">Offered {timeAgo(offer.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
        </PageTransition>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Project Stage"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1">Project</label>
            <p className="text-sm font-bold text-civic-ink">{project.title}</p>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
              Lifecycle Stage <span className="text-rose-600">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink focus:outline-none focus:border-civic-teal"
            >
              {Object.entries(PROJECT_STATUS_TYPES).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
              Progress Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Testing outcomes, prototype results, deployment notes, IP filed..."
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Academic Credits
              </label>
              <input
                type="number"
                min={0}
                value={academicCredits}
                onChange={(e) => setAcademicCredits(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink focus:outline-none focus:border-civic-teal"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-civic-ink pt-6">
              <input
                type="checkbox"
                checked={countsAsCapstone}
                onChange={(e) => setCountsAsCapstone(e.target.checked)}
                className="w-4 h-4 accent-civic-teal"
              />
              Counts as capstone
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-civic-ink pt-6">
              <input
                type="checkbox"
                checked={countsAsInternship}
                onChange={(e) => setCountsAsInternship(e.target.checked)}
                className="w-4 h-4 accent-civic-teal"
              />
              Counts as internship
            </label>
          </div>

          {newStatus === 'DEPLOYED' && (
            <div className="space-y-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40">
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                Deployment Impact — this is what gets counted as a real-world outcome.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                    People Benefited
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={peopleBenefited}
                    onChange={(e) => setPeopleBenefited(e.target.value)}
                    placeholder="e.g. 4200"
                    className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                    Villages / Wards Covered
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={villagesCovered}
                    onChange={(e) => setVillagesCovered(e.target.value)}
                    placeholder="e.g. 6"
                    className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                    Solution Cost (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={solutionCost}
                    onChange={(e) => setSolutionCost(e.target.value)}
                    placeholder="e.g. 150000"
                    className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-civic-ink">
                    <input
                      type="checkbox"
                      checked={patentFiled}
                      onChange={(e) => setPatentFiled(e.target.checked)}
                      className="w-4 h-4 accent-civic-teal"
                    />
                    Patent / IP filed
                  </label>
                  {patentFiled && (
                    <input
                      type="text"
                      value={patentDetails}
                      onChange={(e) => setPatentDetails(e.target.value)}
                      placeholder="Application number / title"
                      className="w-full px-4 py-2 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-civic-ink">
                    <input
                      type="checkbox"
                      checked={startupCreated}
                      onChange={(e) => setStartupCreated(e.target.checked)}
                      className="w-4 h-4 accent-civic-teal"
                    />
                    Startup created
                  </label>
                  {startupCreated && (
                    <input
                      type="text"
                      value={startupName}
                      onChange={(e) => setStartupName(e.target.value)}
                      placeholder="Startup name"
                      className="w-full px-4 py-2 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-civic-line flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 bg-civic-sand hover:bg-civic-line text-civic-mute rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStatus}
              className="px-5 py-2 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
            >
              {submittingStatus ? 'Updating...' : 'Save Stage Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={milestoneModalOpen}
        onClose={() => setMilestoneModalOpen(false)}
        title="Add Project Milestone"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddMilestone} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
              Milestone Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={milestoneForm.title}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
              required
              placeholder="e.g. Literature review & baseline water quality survey"
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
              Deliverable Description
            </label>
            <textarea
              rows={3}
              value={milestoneForm.description}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
              placeholder="Expected output, validation method, documentation to be submitted..."
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">Target Due Date</label>
            <input
              type="date"
              value={milestoneForm.due_date}
              onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink focus:outline-none focus:border-civic-teal"
            />
          </div>

          <div className="pt-4 border-t border-civic-line flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMilestoneModalOpen(false)}
              className="px-4 py-2 bg-civic-sand hover:bg-civic-line text-civic-mute rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingMilestone}
              className="px-5 py-2 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
            >
              {submittingMilestone ? 'Adding...' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Student Contribution Modal */}
      <Modal
        isOpen={contributionModalOpen}
        onClose={() => setContributionModalOpen(false)}
        title="Log Student Contribution"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddContribution} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
              Student Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={contributionForm.student_name}
              onChange={(e) => setContributionForm({ ...contributionForm, student_name: e.target.value })}
              required
              placeholder="e.g. Asha Kumari (Civil)"
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">Role Played</label>
            <input
              type="text"
              value={contributionForm.role}
              onChange={(e) => setContributionForm({ ...contributionForm, role: e.target.value })}
              placeholder="e.g. Lead Researcher, Field Data Collection"
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
              Contribution Summary
            </label>
            <textarea
              rows={3}
              value={contributionForm.contribution_summary}
              onChange={(e) => setContributionForm({ ...contributionForm, contribution_summary: e.target.value })}
              placeholder="What this student specifically did or delivered..."
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
              Credits Earned
            </label>
            <input
              type="number"
              min={0}
              value={contributionForm.credits_earned}
              onChange={(e) => setContributionForm({ ...contributionForm, credits_earned: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink focus:outline-none focus:border-civic-teal"
            />
          </div>

          <div className="pt-4 border-t border-civic-line flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setContributionModalOpen(false)}
              className="px-4 py-2 bg-civic-sand hover:bg-civic-line text-civic-mute rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingContribution}
              className="px-5 py-2 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
            >
              {submittingContribution ? 'Saving...' : 'Save Contribution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

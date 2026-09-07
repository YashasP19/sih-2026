import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { complaintService } from '../services/complaintService';
import Sidebar from '../components/Sidebar';
import PageTransition from '../components/PageTransition';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { formatDate, timeAgo } from '../utils/helpers';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Award,
  ChevronRight,
  ThumbsUp,
  MapPin,
  Camera,
  GraduationCap,
  Trash2
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useNotification();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadComplaints(false);
    const id = setInterval(() => loadComplaints(true), 12000);
    return () => clearInterval(id);
  }, []);

  const loadComplaints = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await complaintService.getMyComplaints();
      setComplaints(res.results || []);
    } catch (e) {
      console.warn('Failed to load complaints:', e);
      if (!silent) setComplaints([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Withdraw ticket ${item.ticket_id}? This can't be undone.`)) return;
    setDeletingId(item.id);
    try {
      const res = await complaintService.deleteComplaint(item.id);
      addToast(res?.message || 'Grievance withdrawn.', 'success');
      setSelectedComplaint(null);
      loadComplaints();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Could not withdraw this grievance.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (item) => !item.assigned_officer && item.status !== 'IN_PROGRESS' && item.status !== 'RESOLVED';

  const filteredComplaints = complaints.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.address && item.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'VERIFIED').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role="CITIZEN" />

        <PageTransition className="flex-1 space-y-6">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel bg-gradient-to-r from-civic-teal-soft to-white dark:from-teal-950/40 dark:to-civic-night-paper border border-civic-teal/25">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-civic-ink">Citizen Redressal Dashboard</h1>
                <span className="px-2 py-0.5 rounded-md bg-civic-teal-soft text-civic-teal text-[10px] font-bold border border-civic-teal/30">
                  Active Citizen
                </span>
              </div>
              <p className="text-xs text-civic-mute mt-1">
                Track real-time progress, field officer verification, and resolution status of your filed grievances.
              </p>
            </div>

            <Link
              to="/submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl text-xs font-bold shadow-lg shadow-civic-teal/20 transition-all hover:scale-105 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File New Grievance</span>
            </Link>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-civic-teal-soft text-civic-teal border border-civic-teal/25">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">My Complaints</p>
                <p className="text-2xl font-extrabold text-civic-ink mt-0.5">{totalCount}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-civic-teal-soft text-civic-teal border border-civic-teal/25">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">In Resolution</p>
                <p className="text-2xl font-extrabold text-civic-teal mt-0.5">{inProgressCount}</p>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-civic-mute uppercase">Resolved Cases</p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{resolvedCount}</p>
              </div>
            </Card>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-civic-mute" />
              <input
                type="text"
                placeholder="Search ticket, keyword, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    statusFilter === st
                      ? 'bg-civic-teal text-white shadow-md'
                      : 'bg-white text-civic-mute hover:text-civic-ink border border-civic-line'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Grievance Feed */}
          {loading ? (
            <Loader text="Loading your grievance tickets..." />
          ) : filteredComplaints.length === 0 ? (
            <Card className="text-center py-16">
              <FileText className="w-12 h-12 text-civic-mute mx-auto mb-3" />
              <h3 className="text-base font-bold text-civic-ink">No complaints found</h3>
              <p className="text-xs text-civic-mute mt-1 max-w-sm mx-auto">
                You haven't filed any complaints matching this filter. Spot a civic issue? Lodge one now.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-civic-teal text-white rounded-xl text-xs font-bold shadow-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>File Grievance</span>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((item) => (
                <Card
                  key={item.id || item.ticket_id}
                  hover={true}
                  onClick={() => setSelectedComplaint(item)}
                  className="cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-civic-sand text-civic-teal font-mono text-[11px] font-bold border border-civic-line">
                          {item.ticket_id}
                        </span>
                        <StatusBadge status={item.status} />
                        <PriorityBadge urgency={item.urgency} score={item.priority_score} />
                        {item.routed_university_name && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-civic-teal-soft text-civic-teal text-[11px] font-semibold border border-civic-teal/25">
                            <GraduationCap className="w-3.5 h-3.5" />
                            Routed to {item.routed_university_name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-civic-ink group-hover:text-civic-teal transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-civic-mute line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-civic-mute pt-2">
                        {item.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-civic-mute" />
                            <span>{item.address}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Filed {timeAgo(item.created_at)}</span>
                        </span>
                        {item.upvotes_count !== undefined && (
                          <span className="flex items-center gap-1 text-civic-mute">
                            <ThumbsUp className="w-3.5 h-3.5 text-civic-teal" />
                            <span>{item.upvotes_count} community upvotes</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="self-end sm:self-center flex items-center gap-2">
                      {canDelete(item) && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                          disabled={deletingId === item.id}
                          title="Withdraw grievance"
                          className="p-2 rounded-xl bg-civic-sand text-civic-mute hover:bg-rose-100 hover:text-rose-600 transition-all disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 rounded-xl bg-civic-sand group-hover:bg-civic-teal text-civic-mute group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </PageTransition>
      </div>

      {/* Ticket Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={Boolean(selectedComplaint)}
          onClose={() => setSelectedComplaint(null)}
          title={`Grievance Ticket: ${selectedComplaint.ticket_id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-civic-sand border border-civic-line">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedComplaint.status} size="lg" />
                <PriorityBadge urgency={selectedComplaint.urgency} score={selectedComplaint.priority_score} />
              </div>
              <span className="text-civic-mute font-mono">{formatDate(selectedComplaint.created_at)}</span>
            </div>

            <div>
              <h4 className="text-base font-bold text-civic-ink mb-2">{selectedComplaint.title}</h4>
              <p className="text-civic-mute leading-relaxed bg-civic-sand p-4 rounded-xl border border-civic-line">
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.routed_university_name && (
              <div className="p-4 rounded-xl bg-civic-teal-soft border border-civic-teal/25 flex items-start gap-2">
                <GraduationCap className="w-4 h-4 text-civic-teal mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-civic-teal">Routed for Research & Fix</p>
                  <p className="text-civic-ink font-semibold">{selectedComplaint.routed_university_name}</p>
                  {selectedComplaint.domain_display && (
                    <p className="text-civic-mute text-[11px] mt-0.5">Domain: {selectedComplaint.domain_display}</p>
                  )}
                </div>
              </div>
            )}

            {selectedComplaint.image && (
              <div>
                <p className="text-[10px] uppercase font-bold text-civic-mute mb-2">Citizen Uploaded Proof</p>
                <div className="rounded-xl overflow-hidden border border-civic-line max-h-56">
                  <img src={selectedComplaint.image} alt="Grievance proof" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Resolution Proof if resolved */}
            {selectedComplaint.status === 'RESOLVED' && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 dark:bg-emerald-950/40 dark:border-emerald-800">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Field Resolution Report</span>
                </div>
                <p className="text-emerald-800">{selectedComplaint.resolution_notes || 'Grievance verified and closed by municipal team.'}</p>
                {selectedComplaint.resolution_image && (
                  <img src={selectedComplaint.resolution_image} alt="After-fix proof" className="rounded-lg h-40 object-cover mt-2" />
                )}
              </div>
            )}

            {/* Lifecycle Timeline Stepper */}
            <div className="pt-4 border-t border-civic-line">
              <p className="text-[10px] uppercase font-bold text-civic-mute mb-3">Redressal Stepper</p>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2 rounded-lg bg-civic-teal/20 text-civic-teal border border-civic-teal/35 font-bold">
                  1. Lodged
                </div>
                <div className={`p-2 rounded-lg font-bold border ${selectedComplaint.status !== 'PENDING' ? 'bg-civic-teal/20 text-civic-teal border-civic-teal/35' : 'bg-civic-sand text-civic-mute border-civic-line'}`}>
                  2. AI Triaged
                </div>
                <div className={`p-2 rounded-lg font-bold border ${selectedComplaint.status === 'IN_PROGRESS' || selectedComplaint.status === 'RESOLVED' ? 'bg-civic-teal-soft text-civic-teal border-civic-teal/30' : 'bg-civic-sand text-civic-mute border-civic-line'}`}>
                  3. Field Action
                </div>
                <div className={`p-2 rounded-lg font-bold border ${selectedComplaint.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' : 'bg-civic-sand text-civic-mute border-civic-line'}`}>
                  4. Resolved
                </div>
              </div>
            </div>

            {canDelete(selectedComplaint) && (
              <div className="pt-4 border-t border-civic-line">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedComplaint)}
                  disabled={deletingId === selectedComplaint.id}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-semibold hover:bg-rose-50 transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingId === selectedComplaint.id ? 'Withdrawing...' : 'Withdraw This Grievance'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

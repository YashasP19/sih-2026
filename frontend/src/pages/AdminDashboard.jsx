import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { complaintService } from '../services/complaintService';
import { authService } from '../services/authService';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Modal from '../components/Modal';
import PageTransition from '../components/PageTransition';
import Loader from '../components/Loader';
import { formatDate, timeAgo } from '../utils/helpers';
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  Clock,
  UserCheck,
  Filter,
  Search,
  ArrowUpRight,
  Layers,
  Camera,
  AlertTriangle,
  Building,
  Send
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected complaint for status update modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [remarks, setRemarks] = useState('');
  const [assignedOfficerId, setAssignedOfficerId] = useState('');
  const [resolutionFile, setResolutionFile] = useState(null);
  const [submittingUpdate, setSubmittingUpdate] = useState(false);
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [queueRes, officersRes] = await Promise.allSettled([
        complaintService.getDepartmentQueue({ page_size: 100 }),
        authService.getOfficers(),
      ]);

      if (queueRes.status === 'fulfilled') {
        setComplaints(queueRes.value?.results || []);
      } else if (!silent) {
        setComplaints([]);
        addToast('Could not load grievance queue. Start the backend server.', 'error');
      }

      if (officersRes.status === 'fulfilled') {
        const officerData = officersRes.value;
        setOfficers(officerData?.results || (Array.isArray(officerData) ? officerData : []));
      }
    } catch (e) {
      console.warn('Admin queue load failed:', e);
      if (!silent) setComplaints([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openDetailModal = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailModalOpen(true);
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailModalOpen(false);
    setNewStatus(complaint.status === 'PENDING' || complaint.status === 'VERIFIED' ? 'IN_PROGRESS' : complaint.status);
    setRemarks(complaint.resolution_notes || '');
    setAssignedOfficerId(complaint.assigned_officer?.id || complaint.assigned_officer || '');
    setResolutionFile(null);
    setUpdateModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSubmittingUpdate(true);
    try {
      const payload = new FormData();
      payload.append('status', newStatus);
      if (remarks) payload.append('remarks', remarks);
      if (assignedOfficerId) payload.append('assigned_officer_id', assignedOfficerId);
      if (resolutionFile) payload.append('resolution_image', resolutionFile);

      await complaintService.updateStatus(selectedComplaint.id, payload);
      addToast(`Ticket ${selectedComplaint.ticket_id} updated to ${newStatus}.`, 'success');
      setUpdateModalOpen(false);
      loadData();
    } catch (err) {
      addToast('Status update failed. Please try again.', 'error');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleClaim = async (complaint) => {
    setClaimingId(complaint.id);
    try {
      const res = await complaintService.claimComplaint(complaint.id);
      addToast(res?.message || `Ticket ${complaint.ticket_id} claimed.`, 'success');
      loadData();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Could not claim this ticket.', 'error');
    } finally {
      setClaimingId(null);
    }
  };

  const filteredComplaints = complaints.filter((item) => {
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || item.urgency === urgencyFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.ticket_id?.toLowerCase().includes(q) ||
      item.citizen_name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      (item.address && item.address.toLowerCase().includes(q));
    return matchesStatus && matchesUrgency && matchesSearch;
  });

  const filtersActive = statusFilter !== 'ALL' || urgencyFilter !== 'ALL' || Boolean(searchQuery.trim());

  const clearFilters = () => {
    setStatusFilter('ALL');
    setUrgencyFilter('ALL');
    setSearchQuery('');
  };

  const criticalComplaints = complaints.filter(
    (c) => (c.urgency === 'CRITICAL' || c.priority_score >= 85) && c.status !== 'RESOLVED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        <Sidebar role="OFFICER" />

        <PageTransition className="flex-1 space-y-6">
          {/* Header Banner */}
          <div className="p-6 rounded-3xl glass-panel bg-gradient-to-r from-civic-sand via-white to-civic-teal-soft dark:from-slate-800 dark:via-civic-night-paper dark:to-teal-950/40 border border-civic-teal/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-civic-teal" />
                <h1 className="text-2xl font-extrabold text-civic-ink">Municipal Command Center</h1>
              </div>
              <p className="text-xs text-civic-mute mt-1">
                Department Queue: <span className="text-civic-teal font-bold">{user?.department_display || 'All Municipal Departments'}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => loadData(false)}
                className="px-3 py-1 rounded-xl bg-civic-teal-soft text-civic-teal-dark dark:bg-teal-950/40 dark:text-teal-300 text-xs font-semibold border border-civic-teal/25"
              >
                Refresh Queue
              </button>
              <span className="px-3 py-1 rounded-xl bg-civic-sand text-xs text-civic-mute font-semibold border border-civic-line">
                {complaints.length} Total in Queue
              </span>
            </div>
          </div>

          {/* Critical Emergency Ticker */}
          {criticalComplaints.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 animate-pulse-slow dark:bg-rose-950/40 dark:border-rose-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-600 text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                    {criticalComplaints.length} Critical Life-Safety Hazards Pending Action
                  </h4>
                  <p className="text-xs text-civic-mute">
                    Highest priority tickets flagged by AI require immediate field team deployment.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUrgencyFilter('CRITICAL')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow whitespace-nowrap transition-all"
              >
                View Hazards
              </button>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-civic-mute" />
              <input
                type="text"
                placeholder="Search ticket, citizen, keywords, ward..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-civic-line rounded-xl text-civic-mute font-semibold focus:outline-none focus:border-civic-teal"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">AI Verified</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>

              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-civic-line rounded-xl text-civic-mute font-semibold focus:outline-none focus:border-civic-teal"
              >
                <option value="ALL">All Urgencies</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
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

          {filtersActive && complaints.length > 0 && (
            <p className="text-[11px] text-civic-mute -mt-2">
              Showing {filteredComplaints.length} of {complaints.length} tickets
              {urgencyFilter !== 'ALL' ? ` · urgency: ${urgencyFilter}` : ''}
              {statusFilter !== 'ALL' ? ` · status: ${statusFilter}` : ''}
            </p>
          )}

          {/* Complaints Table/Cards */}
          {loading ? (
            <Loader text="Loading department grievance queue..." />
          ) : filteredComplaints.length === 0 ? (
            <Card className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-civic-ink">
                {filtersActive ? 'No tickets match these filters' : 'Queue is clear!'}
              </h3>
              <p className="text-xs text-civic-mute mt-1 max-w-md mx-auto">
                {filtersActive
                  ? `There are ${complaints.length} tickets in the queue, but none match the current filters (e.g. Critical hides High/Medium tickets). Clear filters or choose All Urgencies.`
                  : 'No grievances currently pending in this queue.'}
              </p>
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="btn-primary mt-4 !py-2 !px-4 !text-xs inline-flex">
                  Show all {complaints.length} tickets
                </button>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((item) => (
                <div
                  key={item.id || item.ticket_id}
                  className="p-5 rounded-2xl glass-card flex flex-col gap-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-civic-sand text-civic-teal font-mono text-[11px] font-bold border border-civic-line">
                          {item.ticket_id}
                        </span>
                        <PriorityBadge urgency={item.urgency} score={item.priority_score} />
                        <StatusBadge status={item.status} />
                        <span className="text-[11px] font-semibold text-civic-teal px-2 py-0.5 rounded-full bg-civic-teal-soft">
                          {item.department_display || item.category_display || item.category}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-civic-ink leading-snug">{item.title}</h3>
                      <p className="text-sm text-civic-mute leading-relaxed line-clamp-2">{item.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-civic-mute pt-1">
                        <span>Reporter: <strong className="text-civic-ink">{item.citizen_name || 'Citizen'}</strong></span>
                        <span>Filed: <strong className="text-civic-ink">{timeAgo(item.created_at)}</strong></span>
                        <span>Ward: <strong className="text-civic-ink">{item.ward_number || '—'}</strong></span>
                        <span>Location: <strong className="text-civic-ink">{item.address || item.landmark || 'GPS pinned'}</strong></span>
                        {item.assigned_officer_name && (
                          <span>Officer: <strong className="text-civic-ink">{item.assigned_officer_name}</strong></span>
                        )}
                      </div>

                      {item.is_duplicate && (
                        <span className="inline-flex px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                          DUPLICATE REPORT
                        </span>
                      )}

                      {item.status === 'RESOLVED' && item.resolution_notes && (
                        <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                          <p className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 mb-1">Resolution / Solution</p>
                          <p className="text-xs text-emerald-800 dark:text-emerald-200">{item.resolution_notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-end gap-2 self-end lg:self-start">
                      <button
                        type="button"
                        onClick={() => openDetailModal(item)}
                        className="px-4 py-2 rounded-xl border border-civic-line text-xs font-semibold text-civic-ink hover:bg-civic-sand"
                      >
                        View Details
                      </button>
                      {!item.assigned_officer_name && (
                        <button
                          type="button"
                          onClick={() => handleClaim(item)}
                          disabled={claimingId === item.id}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 border border-civic-teal text-civic-teal rounded-xl text-xs font-bold hover:bg-civic-teal-soft disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{claimingId === item.id ? 'Claiming...' : 'Claim This Issue'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openStatusModal(item)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-civic-teal to-civic-teal-dark text-white rounded-xl text-xs font-bold shadow-md transition-all hover:scale-105"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Update / Resolve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageTransition>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Grievance Details: ${selectedComplaint.ticket_id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={selectedComplaint.status} size="lg" />
              <PriorityBadge urgency={selectedComplaint.urgency} score={selectedComplaint.priority_score} />
            </div>
            <div>
              <h4 className="font-bold text-civic-ink text-base">{selectedComplaint.title}</h4>
              <p className="text-civic-mute mt-2 leading-relaxed">{selectedComplaint.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-civic-sand"><span className="text-civic-mute block">Citizen</span><strong>{selectedComplaint.citizen_name}</strong></div>
              <div className="p-3 rounded-xl bg-civic-sand"><span className="text-civic-mute block">Department</span><strong>{selectedComplaint.department_display}</strong></div>
              <div className="p-3 rounded-xl bg-civic-sand"><span className="text-civic-mute block">Category</span><strong>{selectedComplaint.category_display}</strong></div>
              <div className="p-3 rounded-xl bg-civic-sand"><span className="text-civic-mute block">Ward</span><strong>{selectedComplaint.ward_number}</strong></div>
              <div className="p-3 rounded-xl bg-civic-sand col-span-2"><span className="text-civic-mute block">Address</span><strong>{selectedComplaint.address || 'Not provided'}</strong></div>
            </div>
            {selectedComplaint.resolution_notes && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800">
                <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Official Solution</p>
                <p className="text-sm text-emerald-800">{selectedComplaint.resolution_notes}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => openStatusModal(selectedComplaint)}
              className="btn-primary w-full !py-2.5"
            >
              Update Status / Add Solution
            </button>
          </div>
        </Modal>
      )}

      {/* Action / Status Transition Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={updateModalOpen}
          onClose={() => setUpdateModalOpen(false)}
          title={`Action on Ticket: ${selectedComplaint.ticket_id}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1">
                Grievance Title
              </label>
              <p className="text-sm font-bold text-civic-ink">{selectedComplaint.title}</p>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Update Status Lifecycle <span className="text-rose-600">*</span>
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink focus:outline-none focus:border-civic-teal"
              >
                <option value="VERIFIED">AI / Officer Verified</option>
                <option value="IN_PROGRESS">In Progress (Field Team Dispatched)</option>
                <option value="RESOLVED">Resolved & Fixed</option>
                <option value="REJECTED">Reject / Duplicate</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Assign Field Personnel
              </label>
              <select
                value={assignedOfficerId}
                onChange={(e) => setAssignedOfficerId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink focus:outline-none focus:border-civic-teal"
              >
                <option value="">Select Department Officer...</option>
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.first_name ? `${off.first_name} ${off.last_name} (${off.designation || off.department_display})` : off.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                Resolution Remarks & Action Notes
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Details on repair work performed, equipment replaced, disinfection done..."
                className="w-full px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
              />
            </div>

            {newStatus === 'RESOLVED' && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-civic-mute mb-1.5">
                  Attach Resolution Proof Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setResolutionFile(e.target.files[0])}
                  className="w-full text-xs text-civic-mute file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-civic-teal file:text-white hover:file:bg-civic-teal-dark cursor-pointer"
                />
              </div>
            )}

            <div className="pt-4 border-t border-civic-line flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpdateModalOpen(false)}
                className="px-4 py-2 bg-civic-sand hover:bg-civic-line text-civic-mute rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingUpdate}
                className="px-5 py-2 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl font-bold shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {submittingUpdate ? 'Updating...' : 'Save & Publish Update'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { innovationService } from '../services/innovationService';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/Sidebar';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { parseApiError } from '../utils/helpers';
import { Award, BadgeCheck, GraduationCap, Search, FileText } from 'lucide-react';

export default function StudentRecord() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await innovationService.getStudentRecord(name.trim());
      setRecord(data);
    } catch (err) {
      setRecord(null);
      setError(parseApiError(err, 'Could not load this student record.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex gap-8">
        {user && <Sidebar role={user.role} />}
        <div className="flex-1 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-civic-teal-soft text-civic-teal text-[11px] font-bold">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>NEP 2020 · Student Innovation Record</span>
        </div>
        <h1 className="text-2xl font-extrabold text-civic-ink">Look up a student's innovation record</h1>
        <p className="text-xs text-civic-mute max-w-lg mx-auto">
          Every societal-challenge project a student contributed to, the academic credits
          earned, and whether it counted toward a capstone or internship requirement.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter student name, e.g. Asha Kumari"
            className="flex-1 px-4 py-2.5 bg-white border border-civic-line rounded-xl text-xs text-civic-ink placeholder-civic-mute focus:outline-none focus:border-civic-teal"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-civic-teal hover:bg-civic-teal-dark text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </Card>

      {loading && <Loader text="Loading student record..." />}

      {!loading && error && (
        <Card className="text-center py-8">
          <p className="text-xs text-civic-mute">{error}</p>
        </Card>
      )}

      {!loading && record && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="text-center py-4">
              <p className="text-2xl font-extrabold text-civic-teal">{record.total_credits}</p>
              <p className="text-[10px] uppercase font-bold text-civic-mute mt-1">Credits Earned</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-2xl font-extrabold text-civic-ink">{record.projects_count}</p>
              <p className="text-[10px] uppercase font-bold text-civic-mute mt-1">Projects</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-2xl font-extrabold text-violet-600">{record.capstone_count}</p>
              <p className="text-[10px] uppercase font-bold text-civic-mute mt-1">Capstone</p>
            </Card>
            <Card className="text-center py-4">
              <p className="text-2xl font-extrabold text-blue-600">{record.internship_count}</p>
              <p className="text-[10px] uppercase font-bold text-civic-mute mt-1">Internship</p>
            </Card>
          </div>

          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-civic-ink flex items-center gap-2">
              <FileText className="w-4 h-4 text-civic-teal" />
              <span>Contribution History</span>
            </h3>

            {record.contributions.length === 0 ? (
              <p className="text-xs text-civic-mute text-center py-6">
                No contributions found for "{record.student_name}".
              </p>
            ) : (
              <div className="space-y-2">
                {record.contributions.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-civic-sand border border-civic-line space-y-1 dark:bg-slate-800 dark:border-civic-night-line"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-civic-ink">{c.project_title}</span>
                      <span className="text-[11px] text-civic-mute font-mono">{c.project_code}</span>
                      {c.credits_earned > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
                          <Award className="w-3 h-3" />
                          {c.credits_earned} credit{c.credits_earned === 1 ? '' : 's'}
                        </span>
                      )}
                      {c.counts_as_capstone && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-violet-700 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300">
                          <BadgeCheck className="w-3 h-3" />
                          Capstone
                        </span>
                      )}
                      {c.counts_as_internship && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                          <BadgeCheck className="w-3 h-3" />
                          Internship
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-civic-mute">{c.university_name} · {c.role}</p>
                    {c.contribution_summary && (
                      <p className="text-[11px] text-civic-mute leading-relaxed">{c.contribution_summary}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

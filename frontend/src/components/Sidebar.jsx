import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  ShieldCheck,
  Award,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ role = 'CITIZEN' }) {
  const { user } = useAuth();
  const isOfficerOrAdmin = user?.role === 'OFFICER' || user?.role === 'ADMIN';

  const citizenLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/submit', label: 'File Complaint', icon: PlusCircle },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  const officerLinks = [
    { to: '/admin-dashboard', label: 'Department Queue', icon: LayoutDashboard },
    { to: '/analytics', label: 'Performance Analytics', icon: BarChart3 },
    { to: '/submit', label: 'File New Incident', icon: PlusCircle },
  ];

  const links = isOfficerOrAdmin ? officerLinks : citizenLinks;

  return (
    <aside className="w-80 flex-shrink-0 hidden lg:block">
      <div className="sticky top-24 rounded-3xl surface p-6 space-y-7">
        <div className="p-5 rounded-2xl bg-civic-sand border border-civic-line dark:bg-slate-800 dark:border-civic-night-line">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-civic-teal flex items-center justify-center font-bold text-white uppercase text-base dark:bg-teal-600">
              {user?.first_name ? user.first_name[0] : user?.username?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-base font-bold text-civic-ink dark:text-slate-100 truncate">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}</h4>
              <p className="text-sm text-civic-teal dark:text-teal-400 font-medium">{user?.role_display || user?.role}</p>
            </div>
          </div>

          {user?.civic_points !== undefined && (
            <div className="mt-4 pt-4 border-t border-civic-line dark:border-civic-night-line flex items-center justify-between text-sm">
              <span className="text-civic-mute dark:text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" /> Civic Karma
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{user.civic_points} pts</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-civic-mute dark:text-slate-500 mb-2">Navigation</p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-civic-teal text-white shadow-lift dark:bg-teal-600 dark:shadow-lift-dark'
                      : 'text-civic-mute hover:text-civic-ink hover:bg-civic-sand dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 rounded-2xl bg-civic-teal-soft border border-civic-teal/20 dark:bg-teal-950/40 dark:border-teal-500/20">
          <div className="flex items-center gap-2 text-civic-teal-dark dark:text-teal-300 text-sm font-bold mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Verification Active</span>
          </div>
          <p className="text-xs text-civic-mute dark:text-slate-400 leading-relaxed">
            NLP models dynamically score and prioritize critical civic hazards.
          </p>
        </div>
      </div>
    </aside>
  );
}

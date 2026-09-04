export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

export const USER_ROLES = {
  CITIZEN: 'CITIZEN',
  OFFICER: 'OFFICER',
  ADMIN: 'ADMIN',
  UNIVERSITY: 'UNIVERSITY',
  INDUSTRY: 'INDUSTRY',
};

export const CATEGORIES = [
  { id: 'ROADS_POTHOLES', label: 'Roads & Potholes', icon: 'Construction', color: 'text-amber-400' },
  { id: 'WASTE_GARBAGE', label: 'Garbage & Waste', icon: 'Trash2', color: 'text-emerald-400' },
  { id: 'STREETLIGHT_POWER', label: 'Streetlight & Power', icon: 'Zap', color: 'text-yellow-400' },
  { id: 'WATER_LEAKAGE', label: 'Water Supply & Leakage', icon: 'Droplets', color: 'text-cyan-400' },
  { id: 'DRAINAGE_OVERFLOW', label: 'Drainage & Sewage', icon: 'Waves', color: 'text-blue-400' },
  { id: 'PUBLIC_SAFETY_HAZARD', label: 'Public Safety Hazard', icon: 'AlertTriangle', color: 'text-rose-400' },
  { id: 'POLLUTION_AIR_NOISE', label: 'Pollution & Noise', icon: 'Wind', color: 'text-purple-400' },
  { id: 'OTHER', label: 'Other Grievance', icon: 'HelpCircle', color: 'text-slate-400' },
];

export const STATUS_TYPES = {
  PENDING: { label: 'Pending Review', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  VERIFIED: { label: 'AI Verified', bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-civic-teal-soft text-civic-teal-dark border-civic-teal/25 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800' },
  RESOLVED: { label: 'Resolved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
};

export const URGENCY_LEVELS = {
  CRITICAL: { label: 'Critical', bg: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
  HIGH: { label: 'High Urgency', bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  LOW: { label: 'Low', bg: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
};

export const DEPARTMENTS = [
  { id: 'ROADS', label: 'Roads & Infrastructure (PWD)' },
  { id: 'SANITATION', label: 'Solid Waste & Sanitation' },
  { id: 'ELECTRICITY', label: 'Electricity & Streetlighting' },
  { id: 'WATER_SUPPLY', label: 'Water Supply Board' },
  { id: 'DRAINAGE', label: 'Drainage & Sewage' },
  { id: 'PUBLIC_SAFETY', label: 'Public Safety & Law Enforcement' },
  { id: 'HEALTHCARE', label: 'Public Health & Pollution Control' },
  { id: 'GENERAL', label: 'General Administration' },
];

/* ── Societal Innovation Layer: thematic domains, projects, milestones, industry support ── */

export const DOMAINS = [
  { id: 'EDUCATION', label: 'Education & Literacy', icon: 'GraduationCap', color: 'text-sky-400' },
  { id: 'AGRICULTURE', label: 'Agriculture & Allied', icon: 'Sprout', color: 'text-emerald-400' },
  { id: 'HEALTHCARE', label: 'Healthcare & Public Health', icon: 'HeartPulse', color: 'text-rose-400' },
  { id: 'WATER', label: 'Water Resources & Sanitation', icon: 'Droplets', color: 'text-cyan-400' },
  { id: 'ENVIRONMENT', label: 'Environment & Climate', icon: 'Leaf', color: 'text-emerald-400' },
  { id: 'ENERGY', label: 'Energy & Renewables', icon: 'Zap', color: 'text-yellow-400' },
  { id: 'URBAN_DEV', label: 'Urban Development & Infrastructure', icon: 'Building2', color: 'text-amber-400' },
  { id: 'ACCESSIBILITY', label: 'Accessibility & Inclusion', icon: 'Accessibility', color: 'text-violet-400' },
  { id: 'PUBLIC_ADMIN', label: 'Public Administration & Governance', icon: 'Landmark', color: 'text-indigo-400' },
  { id: 'RURAL_LIVELIHOOD', label: 'Rural Livelihoods & Employment', icon: 'Users', color: 'text-teal-400' },
  { id: 'OTHER', label: 'Other Societal Challenge', icon: 'HelpCircle', color: 'text-slate-400' },
];

export const PROJECT_STATUS_TYPES = {
  PROPOSED: { label: 'Proposal Submitted', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  APPROVED: { label: 'Approved', bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800' },
  IN_PROGRESS: { label: 'Research In Progress', bg: 'bg-civic-teal-soft text-civic-teal-dark border-civic-teal/25 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800' },
  PROTOTYPE: { label: 'Prototype Built', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' },
  TESTING: { label: 'Field Testing', bg: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800' },
  DEPLOYED: { label: 'Deployed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  ON_HOLD: { label: 'On Hold', bg: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
};

export const PROJECT_STATUS_FLOW = [
  'PROPOSED',
  'APPROVED',
  'IN_PROGRESS',
  'PROTOTYPE',
  'TESTING',
  'DEPLOYED',
];

export const MILESTONE_STATUS_TYPES = {
  PENDING: { label: 'Pending', bg: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-civic-teal-soft text-civic-teal-dark border-civic-teal/25 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  BLOCKED: { label: 'Blocked', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
};

export const SUPPORT_TYPES = [
  { id: 'MENTORSHIP', label: 'Technical Mentorship' },
  { id: 'FUNDING', label: 'Funding / Grant' },
  { id: 'PROTOTYPING', label: 'Prototyping Support' },
  { id: 'LAB_ACCESS', label: 'Lab & Equipment Access' },
  { id: 'PILOT_DEPLOYMENT', label: 'Pilot Deployment' },
  { id: 'TECH_TRANSFER', label: 'Technology Transfer' },
];

export const SUPPORT_OFFER_STATUS_TYPES = {
  OFFERED: { label: 'Awaiting Response', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' },
  ACCEPTED: { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' },
  DECLINED: { label: 'Declined', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' },
};

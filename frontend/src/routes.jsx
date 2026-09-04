import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import UniversityDashboard from './pages/UniversityDashboard';
import IndustryPortal from './pages/IndustryPortal';
import ProjectDetail from './pages/ProjectDetail';
import InnovationAnalytics from './pages/InnovationAnalytics';
import StudentRecord from './pages/StudentRecord';
import ChallengeTimeline from './pages/ChallengeTimeline';
import Loader from './components/Loader';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen={true} text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If citizen tries accessing admin, redirect to citizen dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/innovation-analytics" element={<InnovationAnalytics />} />
      <Route path="/student-record" element={<StudentRecord />} />
      <Route path="/challenge/:id/timeline" element={<ChallengeTimeline />} />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        }
      />

      {/* Citizen Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/submit"
        element={
          <ProtectedRoute>
            <SubmitComplaint />
          </ProtectedRoute>
        }
      />

      {/* Societal Innovation Collaboration Routes */}
      <Route
        path="/university"
        element={
          <ProtectedRoute allowedRoles={['UNIVERSITY', 'ADMIN']}>
            <UniversityDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/industry"
        element={
          <ProtectedRoute allowedRoles={['INDUSTRY', 'ADMIN']}>
            <IndustryPortal />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:id"
        element={
          <ProtectedRoute>
            <ProjectDetail />
          </ProtectedRoute>
        }
      />

      {/* Admin / Officer Protected Routes */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/performance"
        element={
          <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
            <PerformanceAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

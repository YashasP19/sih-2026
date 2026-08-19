import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { ShieldAlert, Key, User, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      addToast(`Welcome back, ${res.user.first_name || res.user.username}!`, 'success');
      const role = res.user.role;
      if (role === 'OFFICER' || role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMessage(res.error || 'Invalid credentials. Please try again.');
    }
  };

  const setDemoCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-civic-teal text-white items-center justify-center shadow-lift mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-civic-ink tracking-tight">Welcome back</h1>
          <p className="text-sm text-civic-mute mt-2">
            Access your citizen portal or municipal officer cockpit
          </p>
        </div>

        <div className="mb-6 p-4 rounded-2xl surface">
          <div className="flex items-center gap-1.5 text-xs font-bold text-civic-teal mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>SIH Demo Instant Login</span>
          </div>
          <p className="text-[11px] text-civic-mute mb-2.5 leading-relaxed">
            Requires backend at <span className="font-semibold text-civic-ink">http://127.0.0.1:8000</span>. Keep{' '}
            <code className="font-mono text-[10px] bg-civic-sand px-1 py-0.5 rounded">python manage.py runserver 8000</code> running in{' '}
            <code className="font-mono text-[10px] bg-civic-sand px-1 py-0.5 rounded">backend/</code>.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ['arun_citizen', 'Citizen@123', 'Citizen'],
              ['officer_roads', 'Officer@123', 'PWD Officer'],
              ['admin', 'Admin@123', 'Super Admin'],
            ].map(([u, p, label]) => (
              <button
                key={label}
                type="button"
                onClick={() => setDemoCredentials(u, p)}
                className="px-2 py-2 rounded-xl bg-civic-sand hover:bg-civic-teal-soft text-civic-ink font-semibold border border-civic-line hover:border-civic-teal/40 transition-all text-center"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl surface-strong">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-mute">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. arun_citizen or officer_roads"
                  required
                  className="input-field !pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-civic-mute">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field !pl-10"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 !py-3.5 disabled:opacity-50 disabled:pointer-events-none">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-civic-line text-center text-xs text-civic-mute">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-civic-teal hover:text-civic-teal-dark font-semibold underline underline-offset-4">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

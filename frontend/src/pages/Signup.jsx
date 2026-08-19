import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { DEPARTMENTS } from '../utils/constants';
import { ArrowRight } from 'lucide-react';

export default function Signup() {
  const { register } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'CITIZEN',
    department: 'GENERAL',
    ward_number: 'Ward 1',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    if (formData.password !== formData.password_confirm) {
      setFieldErrors({ password_confirm: 'Passwords do not match.' });
      return;
    }

    if (formData.password.length < 6) {
      setFieldErrors({ password: 'Password must be at least 6 characters.' });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email.trim())) {
      setFieldErrors({ email: 'Enter a valid email address (e.g. name@example.com).' });
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      username: formData.username.trim(),
      department: formData.role === 'OFFICER' ? formData.department : 'GENERAL',
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      addToast('Account created successfully! Welcome to CivicSense AI.', 'success');
      if (formData.role === 'OFFICER' || formData.role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMessage(res.error || 'Registration failed. Please check inputs.');
      if (res.details && typeof res.details === 'object' && !Array.isArray(res.details)) {
        const mapped = {};
        Object.entries(res.details).forEach(([key, value]) => {
          mapped[key] = Array.isArray(value) ? value[0] : String(value);
        });
        setFieldErrors(mapped);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-civic-ink tracking-tight">Create your account</h1>
          <p className="text-sm text-civic-mute mt-1.5">
            Join the smart civic grievance redressal network
          </p>
        </div>

        <div className="p-8 rounded-3xl surface-strong">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <p className="mb-4 text-[11px] text-civic-mute dark:text-slate-400 leading-relaxed">
            Accounts are saved to the project database (backend/db.sqlite3). Keep the backend running while signing up or signing in.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">Select Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'CITIZEN' })}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    formData.role === 'CITIZEN'
                      ? 'bg-civic-teal-soft border-civic-teal text-civic-teal-dark'
                      : 'bg-white border-civic-line text-civic-mute hover:border-civic-teal/40'
                  }`}
                >
                  Citizen / Resident
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'OFFICER' })}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    formData.role === 'OFFICER'
                      ? 'bg-civic-teal-soft border-civic-teal text-civic-teal-dark'
                      : 'bg-white border-civic-line text-civic-mute hover:border-civic-teal/40'
                  }`}
                >
                  Municipal Department Officer
                </button>
              </div>
            </div>

            {formData.role === 'OFFICER' && (
              <div>
                <label className="label-field">Municipal Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="e.g. Arun" className="input-field" />
              </div>
              <div>
                <label className="label-field">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="e.g. Verma" className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="e.g. arun_verma" className="input-field" />
                {fieldErrors.username && <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.username}</p>}
              </div>
              <div>
                <label className="label-field">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="name@example.com" className="input-field" />
                {fieldErrors.email && <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">Phone Number</label>
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+91 9876543210" className="input-field" />
              </div>
              <div>
                <label className="label-field">Ward / Zone</label>
                <input type="text" name="ward_number" value={formData.ward_number} onChange={handleChange} placeholder="Ward 12, Connaught Place" className="input-field" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Min 6 characters" minLength={6} className="input-field" />
                {fieldErrors.password && <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="label-field">Confirm Password</label>
                <input type="password" name="password_confirm" value={formData.password_confirm} onChange={handleChange} required placeholder="Repeat password" minLength={6} className="input-field" />
                {fieldErrors.password_confirm && <p className="mt-1 text-[11px] text-rose-600">{fieldErrors.password_confirm}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-6 !py-3.5 disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-civic-line text-center text-xs text-civic-mute">
            Already have an account?{' '}
            <Link to="/login" className="text-civic-teal hover:text-civic-teal-dark font-semibold underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

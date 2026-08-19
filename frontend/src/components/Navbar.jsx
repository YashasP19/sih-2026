import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import {
  ShieldAlert,
  PlusCircle,
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Award,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const navBase = 'sticky top-0 z-40 w-full border-b border-civic-line/70 bg-white/80 backdrop-blur-xl dark:border-civic-night-line/70 dark:bg-civic-night-paper/80 transition-colors duration-300';

  const textColor = 'text-civic-ink dark:text-slate-100';
  const mutedColor = 'text-civic-mute dark:text-slate-400';
  const hoverBg = 'hover:bg-civic-sand dark:hover:bg-slate-800';
  const logoBg = 'bg-civic-teal dark:bg-teal-600';
  const logoIconColor = 'text-white';

  return (
    <nav className={navBase}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 ${logoBg}`}>
              <ShieldAlert className={`w-5 h-5 ${logoIconColor}`} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className={`font-display text-lg font-bold tracking-tight ${textColor}`}>Urban Lens</span>
                <span className="font-display text-lg font-bold text-civic-teal dark:text-teal-400">AI</span>
              </div>
              <p className={`text-[9px] tracking-[0.14em] font-semibold uppercase ${mutedColor}`}>Smart Civic Redressal</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${textColor} ${hoverBg} ${isActive('/') ? 'bg-civic-teal-soft text-civic-teal-dark' : ''}`}
            >
              Home
            </Link>
            <Link
              to="/analytics"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${textColor} ${hoverBg} ${isActive('/analytics') ? 'bg-civic-teal-soft text-civic-teal-dark' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Transparency</span>
            </Link>
            {user && (
              <Link
                to={user.role === 'OFFICER' || user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard'}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${textColor} ${hoverBg} ${
                  isActive('/dashboard') || isActive('/admin-dashboard') ? 'bg-civic-teal-soft text-civic-teal-dark' : ''
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Workspace</span>
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user && <NotificationBell />}

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-2 pr-4 rounded-xl border transition-all bg-civic-sand hover:bg-civic-teal-soft border-civic-line text-civic-ink dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm uppercase bg-civic-teal text-white dark:bg-teal-600">
                    {user.first_name ? user.first_name[0] : user.username[0]}
                  </div>
                  <div className="text-left text-sm leading-tight whitespace-nowrap">
                    <p className="font-semibold">{user.first_name || user.username}</p>
                    <p className="text-xs font-medium text-civic-teal dark:text-teal-400">{user.role_display || user.role}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-civic-line rounded-2xl shadow-lift py-2 z-50 animate-scale-up dark:bg-civic-night-paper dark:border-civic-night-line dark:shadow-lift-dark">
                    <div className="px-4 py-3 border-b border-civic-line dark:border-civic-night-line">
                      <p className="text-xs text-civic-mute dark:text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-civic-ink dark:text-slate-100 truncate">{user.email || user.username}</p>
                      {user.civic_points !== undefined && (
                        <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Award className="w-3.5 h-3.5" />
                          <span>{user.civic_points} Civic Karma Points</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-3.5 py-2 text-sm font-semibold transition-colors ${mutedColor} ${hoverBg} rounded-xl`}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm bg-civic-teal text-white hover:bg-civic-teal-dark dark:bg-teal-600 dark:hover:bg-teal-500"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            {user && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-all ${mutedColor} ${hoverBg}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 border-t border-white/20 bg-white/95 space-y-2 animate-fade-in dark:border-civic-night-line dark:bg-civic-night-paper/95">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-civic-ink hover:bg-civic-sand dark:text-slate-100 dark:hover:bg-slate-800">
            Home
          </Link>
          <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-civic-ink hover:bg-civic-sand dark:text-slate-100 dark:hover:bg-slate-800">
            Public Transparency
          </Link>
          <Link to="/submit" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-semibold bg-civic-teal text-white text-center dark:bg-teal-600">
            File Grievance
          </Link>

          {user ? (
            <div className="pt-4 border-t border-civic-line dark:border-civic-night-line">
              <Link
                to={user.role === 'OFFICER' || user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-civic-teal hover:bg-civic-sand dark:text-teal-400 dark:hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-xl mt-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-civic-line dark:border-civic-night-line flex gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-semibold bg-civic-sand text-civic-ink rounded-xl dark:bg-slate-800 dark:text-slate-100">
                Log In
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-semibold bg-civic-teal text-white rounded-xl dark:bg-teal-600">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

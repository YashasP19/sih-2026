import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { parseApiError } from '../utils/helpers';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserFromStorage = () => {
    const savedUser = authService.getCurrentUser();
    const token = localStorage.getItem('urbanlens_access_token');

    if (savedUser && token) {
      setUser(savedUser);
      // Verify/Refresh profile in background
      authService.getProfile()
        .then((profile) => {
          setUser(profile);
          localStorage.setItem('urbanlens_user', JSON.stringify(profile));
        })
        .catch(() => {
          // Keep cached user if offline or error
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    syncUserFromStorage();

    // The browser can restore a fully-rendered snapshot of a logged-in page
    // from bfcache when the user hits Back after logging out, without
    // re-running any JS. Re-checking on pageshow catches that stale restore
    // and drops back to the login screen instead of showing cached content.
    const handlePageShow = (event) => {
      if (event.persisted) {
        syncUserFromStorage();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const data = await authService.login(username, password);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: parseApiError(error, 'Login failed. Please verify credentials.') };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const data = await authService.register(formData);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        error: parseApiError(error, 'Registration failed. Please check your inputs.'),
        details: error.response?.data?.error?.details,
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

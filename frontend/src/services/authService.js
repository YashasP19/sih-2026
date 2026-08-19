import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password });
    if (response.data.access) {
      localStorage.setItem('civicsense_access_token', response.data.access);
      localStorage.setItem('civicsense_refresh_token', response.data.refresh);
      localStorage.setItem('civicsense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    if (response.data.tokens?.access) {
      localStorage.setItem('civicsense_access_token', response.data.tokens.access);
      localStorage.setItem('civicsense_refresh_token', response.data.tokens.refresh);
      localStorage.setItem('civicsense_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch('/auth/profile/', profileData);
    return response.data;
  },

  async getOfficers(department = '') {
    const url = department ? `/auth/officers/?department=${department}` : '/auth/officers/';
    const response = await api.get(url);
    return response.data;
  },

  logout() {
    localStorage.removeItem('civicsense_access_token');
    localStorage.removeItem('civicsense_refresh_token');
    localStorage.removeItem('civicsense_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('civicsense_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
};

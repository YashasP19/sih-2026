import api from './api';

function extractResults(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.complaints)) return data.complaints;
  return [];
}

export const complaintService = {
  async getComplaints(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/complaints/${query ? `?${query}` : ''}`);
    return response.data;
  },

  async getComplaintById(id) {
    const response = await api.get(`/complaints/${id}/`);
    return response.data;
  },

  async getMyComplaints(params = {}) {
    const query = new URLSearchParams({ page_size: 100, ...params }).toString();
    const response = await api.get(`/complaints/my/?${query}`);
    return { ...response.data, results: extractResults(response.data) };
  },

  async getDepartmentQueue(params = {}) {
    const query = new URLSearchParams({ page_size: 100, ...params }).toString();
    const response = await api.get(`/complaints/department-queue/?${query}`);
    return { ...response.data, results: extractResults(response.data) };
  },

  async submitComplaint(formData) {
    const response = await api.post('/complaints/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateStatus(id, payload) {
    // If payload contains file (resolution_image), use multipart
    const isFormData = payload instanceof FormData;
    const response = await api.post(`/complaints/${id}/status/`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  async claimComplaint(id) {
    const response = await api.post(`/complaints/${id}/claim/`);
    return response.data;
  },

  async toggleUpvote(id) {
    const response = await api.post(`/complaints/${id}/upvote/`);
    return response.data;
  },

  async getGeoPins(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/complaints/geo-pins/${query ? `?${query}` : ''}`);
    return response.data;
  },

  async analyzeComplaintAI(title, description, latitude = null, longitude = null, address = '') {
    const response = await api.post('/ai/analyze/', {
      title,
      description,
      latitude,
      longitude,
      address,
    });
    return response.data;
  },

  async getTransparencyData() {
    const response = await api.get('/dashboard/public/');
    return response.data;
  },

  async getAdminExecutiveData() {
    const response = await api.get('/dashboard/admin/');
    return response.data;
  },

  async getOfficerSummary() {
    const response = await api.get('/dashboard/officer/');
    return response.data;
  },

  async getLeaderboard() {
    const response = await api.get('/dashboard/leaderboard/');
    return response.data;
  },
};

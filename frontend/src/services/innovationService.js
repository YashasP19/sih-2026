import api from './api';

function extractResults(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.projects)) return data.projects;
  if (Array.isArray(data.challenges)) return data.challenges;
  return [];
}

export const innovationService = {
  async getUniversities(params = {}) {
    const query = new URLSearchParams({ page_size: 100, ...params }).toString();
    const response = await api.get(`/innovation/universities/?${query}`);
    return extractResults(response.data);
  },

  async getPartners(params = {}) {
    const query = new URLSearchParams({ page_size: 100, ...params }).toString();
    const response = await api.get(`/innovation/partners/?${query}`);
    return extractResults(response.data);
  },

  async getRoutedChallenges(params = {}) {
    const query = new URLSearchParams({ page_size: 100, ...params }).toString();
    const response = await api.get(`/innovation/challenges/?${query}`);
    return { ...response.data, results: extractResults(response.data) };
  },

  async claimChallenge(challengeId, payload) {
    const response = await api.post(`/innovation/challenges/${challengeId}/claim/`, payload);
    return response.data;
  },

  async getProjects(params = {}) {
    const query = new URLSearchParams({ page_size: 100, ...params }).toString();
    const response = await api.get(`/innovation/projects/?${query}`);
    return { ...response.data, results: extractResults(response.data) };
  },

  async getProjectById(id) {
    const response = await api.get(`/innovation/projects/${id}/`);
    return response.data;
  },

  async updateProjectStatus(id, payload) {
    const response = await api.post(`/innovation/projects/${id}/status/`, payload);
    return response.data;
  },

  async addMilestone(projectId, payload) {
    const response = await api.post(`/innovation/projects/${projectId}/milestones/`, payload);
    return response.data;
  },

  async updateMilestoneStatus(milestoneId, status) {
    const response = await api.post(`/innovation/milestones/${milestoneId}/status/`, { status });
    return response.data;
  },

  async offerSupport(projectId, payload) {
    const response = await api.post(`/innovation/projects/${projectId}/support/`, payload);
    return response.data;
  },

  async respondToSupportOffer(offerId, status) {
    const response = await api.post(`/innovation/support-offers/${offerId}/respond/`, { status });
    return response.data;
  },

  async getInnovationStats() {
    const response = await api.get('/innovation/stats/');
    return response.data;
  },

  async addStudentContribution(projectId, payload) {
    const response = await api.post(`/innovation/projects/${projectId}/contributions/`, payload);
    return response.data;
  },

  async getStudentRecord(name) {
    const response = await api.get(`/innovation/student-record/?name=${encodeURIComponent(name)}`);
    return response.data;
  },

  async getChallengeTimeline(challengeId) {
    const response = await api.get(`/innovation/challenges/${challengeId}/timeline/`);
    return response.data;
  },
};

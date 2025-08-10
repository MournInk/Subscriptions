import axios from 'axios';

const API_BASE = '/api';

export const subscriptionAPI = {
  getAll: () => axios.get(`${API_BASE}/subscriptions`),
  create: (data) => axios.post(`${API_BASE}/subscriptions`, data),
  update: (id, data) => axios.put(`${API_BASE}/subscriptions/${id}`, data),
  delete: (id) => axios.delete(`${API_BASE}/subscriptions/${id}`),
  refresh: (id) => axios.post(`${API_BASE}/subscriptions/${id}/refresh`),
  getStats: () => axios.get(`${API_BASE}/subscriptions/stats/summary`),
};

export const nodeAPI = {
  getAll: () => axios.get(`${API_BASE}/nodes`),
  getActive: () => axios.get(`${API_BASE}/nodes/active`),
  getTop: (limit = 10) => axios.get(`${API_BASE}/nodes/top?limit=${limit}`),
  create: (data) => axios.post(`${API_BASE}/nodes`, data),
  delete: (id) => axios.delete(`${API_BASE}/nodes/${id}`),
  test: (id) => axios.post(`${API_BASE}/nodes/${id}/test`),
  testAll: () => axios.post(`${API_BASE}/nodes/test-all`),
  getStats: () => axios.get(`${API_BASE}/nodes/stats`),
};

export const exportAPI = {
  getFormats: () => axios.get(`${API_BASE}/export`),
  export: (format, limit = 10) => axios.get(`${API_BASE}/export/${format}?limit=${limit}`, {
    responseType: 'blob'
  }),
};

export const healthAPI = {
  check: () => axios.get(`${API_BASE}/health`),
};
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Supervisor API
export const supervisorAPI = {
  // Get all requests
  getRequests: (status) => {
    const params = status ? { status } : {};
    return api.get('/supervisor/requests', { params });
  },

  // Get pending requests
  getPendingRequests: () => api.get('/supervisor/requests/pending'),

  // Resolve a request
  resolveRequest: (id, answer, supervisorName) =>
    api.post(`/supervisor/requests/${id}/resolve`, { answer, supervisorName }),

  // Get knowledge base
  getKnowledge: () => api.get('/supervisor/knowledge'),

  // Add knowledge
  addKnowledge: (question, answer, category) =>
    api.post('/supervisor/knowledge', { question, answer, category }),

  // Delete knowledge
  deleteKnowledge: (id) => api.delete(`/supervisor/knowledge/${id}`),

  // Get stats
  getStats: () => api.get('/supervisor/stats'),
};

// Agent API
export const agentAPI = {
  // Simulate a call
  simulateCall: (customerPhone, customerMessage) =>
    api.post('/agent/simulate-call', { customerPhone, customerMessage }),

  // Get agent config
  getConfig: () => api.get('/agent/config'),

  // Check knowledge
  checkKnowledge: (question) => api.post('/agent/check-knowledge', { question }),
};

export default api;
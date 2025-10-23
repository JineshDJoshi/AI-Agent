import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const supervisorAPI = {
  // Get all knowledge entries
  getKnowledge: () => {
    return api.get('/supervisor/knowledge');
  },

  // Add new knowledge entry
  // Make sure the payload matches what your backend expects
  addKnowledge: (question, answer, category) => {
    const payload = {
      question,
      answer,
      category
    };
    
    console.log('Sending payload:', payload);
    
    return api.post('/supervisor/knowledge', payload);
  },

  // Delete knowledge entry
  deleteKnowledge: (id) => {
    return api.delete(`/supervisor/knowledge/${id}`);
  },

  // Update knowledge entry (if needed)
  updateKnowledge: (id, data) => {
    return api.put(`/supervisor/knowledge/${id}`, data);
  },
};

export default api;
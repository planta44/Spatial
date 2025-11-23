import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Resources endpoints
export const resourcesAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  getByCategory: (category) => api.get(`/resources/category/${category}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  rate: (id, rating) => api.post(`/resources/${id}/rate`, { rating }),
};

// Policies endpoints
export const policiesAPI = {
  getAll: (params) => api.get('/policies', { params }),
  getById: (id) => api.get(`/policies/${id}`),
  getStats: () => api.get('/policies/stats'),
  getByUniversity: (name) => api.get(`/policies/university/${name}`),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  delete: (id) => api.delete(`/policies/${id}`),
};

// Spatial audio endpoints
export const spatialAPI = {
  getAll: (params) => api.get('/spatial', { params }),
  getById: (id) => api.get(`/spatial/${id}`),
  getByFormat: (format) => api.get(`/spatial/format/${format}`),
  create: (data) => api.post('/spatial', data),
  update: (id, data) => api.put(`/spatial/${id}`, data),
  delete: (id) => api.delete(`/spatial/${id}`),
  like: (id) => api.post(`/spatial/${id}/like`),
  comment: (id, text) => api.post(`/spatial/${id}/comment`, { text }),
  analyze: (id) => api.post(`/spatial/${id}/analyze`),
};

export default api;
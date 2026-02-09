import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');
const API_URL = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

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
      const requestUrl = error.config?.url || '';
      const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      if (!isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminRoute ? '/admin' : '/';
      }
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
  getAdmin: (params) => api.get('/resources/admin', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  getByCategory: (category) => api.get(`/resources/category/${category}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  rate: (id, rating) => api.post(`/resources/${id}/rate`, { rating }),
  reorder: (orderedIds) => api.put('/resources/reorder', { orderedIds }),
  uploadAsset: (formData) =>
    api.post('/resources/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
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

export const pageContentsAPI = {
  getBySlug: (slug) => api.get(`/page-contents/${slug}`),
  upsert: (slug, data) => api.put(`/page-contents/${slug}`, data),
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

// Spatial projects (student spatial studio) endpoints
export const spatialProjectsAPI = {
  // Get current user's spatial projects
  getMy: (params) => api.get('/spatial-projects', { params }),

  // Get single spatial project by id
  getById: (id) => api.get(`/spatial-projects/${id}`),

  // Create a new spatial project
  create: (data) => api.post('/spatial-projects', data),

  // Save full project state (composition + spatial config)
  saveState: (id, projectData) =>
    api.put(`/spatial-projects/${id}/save-state`, { projectData }),

  // Update only spatial configuration (positions, settings)
  updateSpatialConfig: (id, data) =>
    api.put(`/spatial-projects/${id}/spatial-config`, data),

  // Share/unshare project
  share: (id, isPublic) =>
    api.put(`/spatial-projects/${id}/share`, { isPublic }),
};

export const curriculumAPI = {
  generate: (data) => api.post('/curriculum/generate', data),
};

export const transcriptionAPI = {
  transcribePerformance: (formData) =>
    api.post('/transcription/performance', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000, // 2 minutes timeout for transcription
    }),
};

export default api;
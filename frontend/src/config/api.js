// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: '/api/auth',
    RESOURCES: '/api/resources',
    POLICIES: '/api/policies',
    SPATIAL: '/api/spatial',
    SPATIAL_ANALYTICS: '/api/spatial-analytics',
    COMPOSITIONS: '/api/compositions',
    SPATIAL_PROJECTS: '/api/spatial-projects',
    HEALTH: '/api/health'
  }
};

export default API_CONFIG;

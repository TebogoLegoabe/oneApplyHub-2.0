import axios from "axios";

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Production API URL (your Railway backend)
  const PRODUCTION_API_URL = "https://your-railway-app.up.railway.app/api";
  
  // Check if we're in development
  if (process.env.NODE_ENV === 'development' || window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  }
  
  // Use environment variable if set, otherwise use production URL
  return process.env.REACT_APP_API_URL || PRODUCTION_API_URL;
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for CORS with credentials
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Test connection function
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('API connection test failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Properties API
export const propertiesAPI = {
  getProperties: (params = {}) => api.get('/properties', { params }),
  getProperty: (id) => api.get(`/properties/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getReviews: (propertyId, params = {}) => 
    api.get(`/reviews/property/${propertyId}`, { params }),
  getAllReviews: (params = {}) => api.get('/reviews', { params }),
  createReview: (propertyId, reviewData) => 
    api.post(`/reviews/property/${propertyId}`, reviewData),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
  getUserStats: () => api.get('/reviews/user/stats'),
};

export default api;
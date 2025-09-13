// frontend/src/services/api.js - CORRECTED VERSION
import axios from "axios";

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Production API URL (your actual Railway backend)
  const PRODUCTION_API_URL = "https://oneapplyhub-20-production.up.railway.app/api";
  
  // Check if we're in development
  if (process.env.NODE_ENV === 'development' || window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  }
  
  // Use environment variable if set, otherwise use production URL
  return process.env.REACT_APP_API_URL || PRODUCTION_API_URL;
};

const API_BASE_URL = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL); // Add this for debugging

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout for production
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    if (error.response?.status === 401) {
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
    const response = await axios.get('https://oneapplyhub-20-production.up.railway.app/');
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
};

// Properties API - Updated for production
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
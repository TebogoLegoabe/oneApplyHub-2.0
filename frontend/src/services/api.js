import axios from "axios";

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'development' || window.location.hostname === "localhost") {
    return "http://localhost:5000/api";
  }

  return "https://oneapplyhub-20-production.up.railway.app/api";
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  sendVerificationCode: (email) => api.post('/auth/send-verification', { email }),
  verifyEmail: (email, code) => api.post('/auth/verify-email', { email, code }),
  googleVerify: (token) => api.post('/auth/google/verify', { access_token: token }),
};

// MFA API
export const mfaAPI = {
  verifyLogin: (mfa_token, code) => api.post('/auth/mfa/verify-login', { mfa_token, code }),
  setup: () => api.post('/auth/mfa/setup'),
  enable: (code) => api.post('/auth/mfa/enable', { code }),
  disable: (password, code) => api.post('/auth/mfa/disable', { password, code }),
};

// Public Stats API
export const statsAPI = {
  getStats: () => api.get('/stats'),
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
  getAllReviews: (params = {}) => api.get('/reviews/', { params }),
  createReview: (propertyId, reviewData) =>
    api.post(`/reviews/property/${propertyId}`, reviewData),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
  getUserStats: () => api.get('/reviews/user/stats'),
  getDashboardStats: () => api.get('/reviews/dashboard'),
};

// Applications API
export const applicationsAPI = {
  submit: (formData) => api.post('/applications', formData),
  getMyApplication: () => api.get('/applications/my'),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  // Properties
  getProperties: (params = {}) => api.get('/admin/properties', { params }),
  createProperty: (data) => api.post('/admin/properties', data),
  updateProperty: (id, data) => api.put(`/admin/properties/${id}`, data),
  toggleApproval: (id, approved) => api.patch(`/admin/properties/${id}/approve`, { approved }),
  deleteProperty: (id) => api.delete(`/admin/properties/${id}`),
  // Users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Reviews
  getReviews: (params = {}) => api.get('/admin/reviews', { params }),
  approveReview: (id, approved) => api.patch(`/admin/reviews/${id}/approve`, { approved }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  // Applications
  getApplications: (params = {}) => api.get('/admin/applications', { params }),
  updateApplicationStatus: (id, data) => api.patch(`/admin/applications/${id}/status`, data),
};

export default api;

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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
  console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Test connection
export const testConnection = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log('Flask connection test:', response.data);
    return response.data;
  } catch (error) {
    console.error('Flask connection failed:', error.message);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  register: (userData) => {
    console.log('Attempting registration with:', userData);
    return api.post('/auth/register', userData);
  },
  login: (credentials) => {
    console.log('Attempting login with:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  getProfile: () => api.get('/auth/profile'),
};

// Properties API calls
export const propertiesAPI = {
  getProperties: async ({ page = 1, per_page = 12, university = 'all', type = 'all' } = {}) => {
    return axios.get('http://localhost:5000/api/properties', {
      params: { page, per_page, university, type },
    });
  },

  getProperty: async (id) => {
    return axios.get(`http://localhost:5000/api/properties/${id}`);
  },
};


// Reviews API calls
export const reviewsAPI = {
  getReviews: (propertyId, page = 1) => 
    api.get(`/reviews/property/${propertyId}?page=${page}`),
  createReview: (propertyId, reviewData) => 
    api.post(`/reviews/property/${propertyId}`, reviewData),
};

// Admin API calls
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Properties
  getProperties: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return api.get(`/admin/properties?${params}`);
  },
  createProperty: (propertyData) => api.post('/admin/properties', propertyData),
  updateProperty: (id, propertyData) => api.put(`/admin/properties/${id}`, propertyData),
  deleteProperty: (id) => api.delete(`/admin/properties/${id}`),
  approveProperty: (id) => api.post(`/admin/properties/${id}/approve`),
  
  // Users
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  verifyUser: (id) => api.post(`/admin/users/${id}/verify`),
  
  // Reviews
  getReviews: (page = 1) => api.get(`/admin/reviews?page=${page}`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`)
};

export default api;
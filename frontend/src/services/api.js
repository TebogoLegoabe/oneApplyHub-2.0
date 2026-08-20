import axios from "axios";

const getApiBaseUrl = () => {
  const configuredUrl = process.env.REACT_APP_API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "development" || window.location.hostname === "localhost") {
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

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/properties', '/reviews', '/bursaries', '/opportunities', '/privacy', '/terms'];
const isPublicPath = (pathname) => PUBLIC_PATHS.some((path) => pathname === path || (path !== '/' && pathname.startsWith(`${path}/`)));

// Response interceptor - handle expired/invalid sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const manualLogout = sessionStorage.getItem('manual_logout') === '1';
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (manualLogout) {
        sessionStorage.removeItem('manual_logout');
        if (window.location.pathname !== '/') {
          window.location.replace('/');
        }
      } else if (!isPublicPath(window.location.pathname)) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.post('/auth/change-password', data),
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

// Bursaries API
export const bursariesAPI = {
  getBursaries: () => api.get('/bursaries'),
};

// Opportunities API
export const opportunitiesAPI = {
  getOpportunities: () => api.get('/opportunities'),
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
  getProfile: () => api.get('/applications/profile'),
  submitAccommodation: (formData) => api.post('/applications/accommodation', formData),
  getMyAccommodation: () => api.get('/applications/accommodation/my'),
  submitUniversity: (formData) => api.post('/applications/university', formData),
  getMyUniversity: () => api.get('/applications/university/my'),
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
  addPropertyImage: (propertyId, data) => api.post(`/admin/properties/${propertyId}/images`, data),
  uploadPropertyImage: (propertyId, formData) => api.post(`/admin/properties/${propertyId}/images/upload`, formData, { headers: { 'Content-Type': undefined } }),
  updatePropertyImage: (propertyId, imageId, data) => api.patch(`/admin/properties/${propertyId}/images/${imageId}`, data),
  deletePropertyImage: (propertyId, imageId) => api.delete(`/admin/properties/${propertyId}/images/${imageId}`),
  // Users
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  createAdminUser: (data) => api.post('/admin/admin-users', data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Property admins
  getPropertyAdmins: () => api.get('/admin/property-admins'),
  assignPropertyAdmin: (propertyId, adminUserId) => api.post('/admin/property-admins', { property_id: propertyId, admin_user_id: adminUserId }),
  removePropertyAdmin: (assignmentId) => api.delete(`/admin/property-admins/${assignmentId}`),
  // Reviews
  getReviews: (params = {}) => api.get('/admin/reviews', { params }),
  approveReview: (id, approved) => api.patch(`/admin/reviews/${id}/approve`, { approved }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  // Accommodation applications
  getAccommodationApplications: (params = {}) => api.get('/admin/accommodation-applications', { params }),
  updateAccommodationApplicationStatus: (applicationId, propertyId, data) =>
    api.patch(`/admin/accommodation-applications/${applicationId}/properties/${propertyId}/status`, data),
  deleteAccommodationApplication: (applicationId, propertyId) =>
    api.delete(`/admin/accommodation-applications/${applicationId}/properties/${propertyId}`),
  // University applications
  getUniversityApplications: (params = {}) => api.get('/admin/university-applications', { params }),
  updateUniversityChoiceStatus: (applicationId, choiceId, data) =>
    api.patch(`/admin/university-applications/${applicationId}/choices/${choiceId}/status`, data),
  // Room inventory
  getFloors: (propertyId) => api.get(`/admin/properties/${propertyId}/floors`),
  createFloor: (propertyId, data) => api.post(`/admin/properties/${propertyId}/floors`, data),
  updateFloor: (floorId, data) => api.patch(`/admin/floors/${floorId}`, data),
  deleteFloor: (floorId) => api.delete(`/admin/floors/${floorId}`),
  getRooms: (propertyId) => api.get(`/admin/properties/${propertyId}/rooms`),
  createRoom: (propertyId, data) => api.post(`/admin/properties/${propertyId}/rooms`, data),
  updateRoom: (roomId, data) => api.patch(`/admin/rooms/${roomId}`, data),
  deleteRoom: (roomId) => api.delete(`/admin/rooms/${roomId}`),
  getUnallocated: (propertyId) => api.get(`/admin/properties/${propertyId}/unallocated`),
  allocateRoom: (roomId, accommodationApplicationPropertyId) =>
    api.post(`/admin/rooms/${roomId}/allocate`, { accommodation_application_property_id: accommodationApplicationPropertyId }),
  autoAllocate: (propertyId) => api.post(`/admin/properties/${propertyId}/auto-allocate`),
  vacateAllocation: (allocationId) => api.post(`/admin/allocations/${allocationId}/vacate`),
  exportRoomsCsv: (propertyId) => api.get('/admin/rooms/export', { params: propertyId ? { property_id: propertyId } : {}, responseType: 'blob' }),
};

export default api;

import axios from 'axios';
import { auth } from '../firebase-config/config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — sign out and redirect
      auth.signOut().then(() => {
        window.location.href = '/login';
      });
    } else if (error.response?.status === 429) {
      // Rate limited
      console.warn('Rate limited. Please wait and try again.');
    }
    return Promise.reject(error);
  }
);

// Turf API
export const turfAPI = {
  getTurfsBySport: (sport, params = {}) => api.get(`/turfs/${sport}`, { params }),
  getTurfById: (sport, id) => api.get(`/turfs/${sport}/${id}`),
  createTurf: (sport, data) => api.post(`/turfs/${sport}`, data),
  updateTurf: (sport, id, data) => api.put(`/turfs/${sport}/${id}`, data),
  deleteTurf: (sport, id) => api.delete(`/turfs/${sport}/${id}`),
};

// Booking API — uses new bookings/{bookingId} model
export const bookingAPI = {
  getMyBookings: () => api.get('/bookings/my'),
  createBooking: (data) => api.post('/bookings', data),
  cancelBooking: (bookingId) => api.patch(`/bookings/${bookingId}/cancel`),
  getBookedSlots: (turfName, date) => api.get(`/bookings/slots/${encodeURIComponent(turfName)}/${date}`),
};

// Payment API (removed - cash-only payments now)

// Review API
export const reviewAPI = {
  getReviews: (sport, turfId) => api.get(`/reviews/${sport}/${turfId}`),
  createReview: (data) => api.post('/reviews', data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Admin API
export const adminAPI = {
  getAllBookings: () => api.get('/admin/bookings'),
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  makeAdmin: (userId) => api.post(`/admin/make-admin/${userId}`),
  removeAdmin: (userId) => api.post(`/admin/remove-admin/${userId}`),
};

// Owner API
export const ownerAPI = {
  register: (data) => api.post('/owners/register', data),
  getProfile: () => api.get('/owners/profile'),
  updateProfile: (data) => api.put('/owners/profile', data),
  getMyTurfs: () => api.get('/owners/my-turfs'),
  getMyBookings: () => api.get('/owners/my-bookings'),
  // Admin endpoints for owner management
  getAllOwners: (status) => api.get('/owners/all', { params: { status } }),
  approveOwner: (ownerId) => api.post(`/owners/${ownerId}/approve`),
  rejectOwner: (ownerId, reason) => api.post(`/owners/${ownerId}/reject`, { reason }),
};

export default api;

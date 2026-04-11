import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } else if (error.response?.status === 429) {
      console.warn('Rate limited. Please wait and try again.');
    }
    return Promise.reject(error);
  }
);

export const turfAPI = {
  getTurfsBySport: (sport, params = {}) => api.get(`/turfs/${sport}`, { params }),
  getTurfById: (sport, id) => api.get(`/turfs/${sport}/${id}`),
  createTurf: (sport, data) => api.post(`/turfs/${sport}`, data),
  updateTurf: (sport, id, data) => api.put(`/turfs/${sport}/${id}`, data),
  deleteTurf: (sport, id) => api.delete(`/turfs/${sport}/${id}`),
};

export const bookingAPI = {
  getMyBookings: () => api.get('/bookings/my'),
  createBooking: (data) => api.post('/bookings', data),
  cancelBooking: (bookingId) => api.patch(`/bookings/${bookingId}/cancel`),
  getBookedSlots: (turfName, date) => api.get(`/bookings/slots/${encodeURIComponent(turfName)}/${date}`),
};

export const reviewAPI = {
  getReviews: (sport, turfId) => api.get(`/reviews/${sport}/${turfId}`),
  createReview: (data) => api.post('/reviews', data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

export const adminAPI = {
  getAllBookings: () => api.get('/admin/bookings'),
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  makeAdmin: (userId) => api.post(`/admin/make-admin/${userId}`),
  removeAdmin: (userId) => api.post(`/admin/remove-admin/${userId}`),
};

export const ownerAPI = {
  register: (data) => api.post('/owners/register', data),
  getProfile: () => api.get('/owners/profile'),
  updateProfile: (data) => api.put('/owners/profile', data),
  getMyTurfs: () => api.get('/owners/my-turfs'),
  getMyBookings: () => api.get('/owners/my-bookings'),
  getAllOwners: (status) => api.get('/owners/all', { params: { status } }),
  approveOwner: (ownerId) => api.post(`/owners/${ownerId}/approve`),
  rejectOwner: (ownerId, reason) => api.post(`/owners/${ownerId}/reject`, { reason }),
};

export default api;

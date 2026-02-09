import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase before importing api
vi.mock('../firebase-config/config', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('API Service', () => {
  let turfAPI, bookingAPI, paymentAPI, reviewAPI, adminAPI, ownerAPI;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Dynamic import to get fresh module
    const module = await import('../services/api.js');
    turfAPI = module.turfAPI;
    bookingAPI = module.bookingAPI;
    paymentAPI = module.paymentAPI;
    reviewAPI = module.reviewAPI;
    adminAPI = module.adminAPI;
    ownerAPI = module.ownerAPI;
  });

  describe('turfAPI', () => {
    it('has getTurfsBySport method', () => {
      expect(typeof turfAPI.getTurfsBySport).toBe('function');
    });

    it('has getTurfById method', () => {
      expect(typeof turfAPI.getTurfById).toBe('function');
    });

    it('has createTurf method', () => {
      expect(typeof turfAPI.createTurf).toBe('function');
    });

    it('has updateTurf method', () => {
      expect(typeof turfAPI.updateTurf).toBe('function');
    });

    it('has deleteTurf method', () => {
      expect(typeof turfAPI.deleteTurf).toBe('function');
    });
  });

  describe('bookingAPI', () => {
    it('has getMyBookings method', () => {
      expect(typeof bookingAPI.getMyBookings).toBe('function');
    });

    it('has createBooking method', () => {
      expect(typeof bookingAPI.createBooking).toBe('function');
    });

    it('has cancelBooking method', () => {
      expect(typeof bookingAPI.cancelBooking).toBe('function');
    });

    it('has getBookedSlots method', () => {
      expect(typeof bookingAPI.getBookedSlots).toBe('function');
    });
  });

  describe('paymentAPI', () => {
    it('has getStatus method', () => {
      expect(typeof paymentAPI.getStatus).toBe('function');
    });

    it('has createRazorpayOrder method', () => {
      expect(typeof paymentAPI.createRazorpayOrder).toBe('function');
    });

    it('has verifyRazorpayPayment method', () => {
      expect(typeof paymentAPI.verifyRazorpayPayment).toBe('function');
    });

    it('has createStripeIntent method', () => {
      expect(typeof paymentAPI.createStripeIntent).toBe('function');
    });
  });

  describe('reviewAPI', () => {
    it('has getReviews method', () => {
      expect(typeof reviewAPI.getReviews).toBe('function');
    });

    it('has createReview method', () => {
      expect(typeof reviewAPI.createReview).toBe('function');
    });

    it('has deleteReview method', () => {
      expect(typeof reviewAPI.deleteReview).toBe('function');
    });
  });

  describe('adminAPI', () => {
    it('has getAllBookings method', () => {
      expect(typeof adminAPI.getAllBookings).toBe('function');
    });

    it('has getStats method', () => {
      expect(typeof adminAPI.getStats).toBe('function');
    });

    it('has getAllUsers method', () => {
      expect(typeof adminAPI.getAllUsers).toBe('function');
    });

    it('has makeAdmin method', () => {
      expect(typeof adminAPI.makeAdmin).toBe('function');
    });

    it('has removeAdmin method', () => {
      expect(typeof adminAPI.removeAdmin).toBe('function');
    });
  });

  describe('ownerAPI', () => {
    it('has register method', () => {
      expect(typeof ownerAPI.register).toBe('function');
    });

    it('has getProfile method', () => {
      expect(typeof ownerAPI.getProfile).toBe('function');
    });

    it('has getMyTurfs method', () => {
      expect(typeof ownerAPI.getMyTurfs).toBe('function');
    });

    it('has getMyBookings method', () => {
      expect(typeof ownerAPI.getMyBookings).toBe('function');
    });

    it('has getAllOwners method', () => {
      expect(typeof ownerAPI.getAllOwners).toBe('function');
    });

    it('has approveOwner method', () => {
      expect(typeof ownerAPI.approveOwner).toBe('function');
    });

    it('has rejectOwner method', () => {
      expect(typeof ownerAPI.rejectOwner).toBe('function');
    });
  });
});

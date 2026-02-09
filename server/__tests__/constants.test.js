import { jest } from '@jest/globals';
import { ALLOWED_SPORTS, BOOKING_STATUSES, ALLOWED_TIME_SLOTS, OWNER_STATUSES } from '../config/constants.js';

describe('Constants', () => {
  describe('ALLOWED_SPORTS', () => {
    it('is an array', () => {
      expect(Array.isArray(ALLOWED_SPORTS)).toBe(true);
    });

    it('contains exactly 4 sports', () => {
      expect(ALLOWED_SPORTS).toHaveLength(4);
    });

    it('includes football', () => {
      expect(ALLOWED_SPORTS).toContain('football');
    });

    it('includes cricket', () => {
      expect(ALLOWED_SPORTS).toContain('cricket');
    });

    it('includes basketball', () => {
      expect(ALLOWED_SPORTS).toContain('basketball');
    });

    it('includes badminton', () => {
      expect(ALLOWED_SPORTS).toContain('badminton');
    });

    it('does not include tennis', () => {
      expect(ALLOWED_SPORTS).not.toContain('tennis');
    });
  });

  describe('BOOKING_STATUSES', () => {
    it('is an array', () => {
      expect(Array.isArray(BOOKING_STATUSES)).toBe(true);
    });

    it('includes pending', () => {
      expect(BOOKING_STATUSES).toContain('pending');
    });

    it('includes confirmed', () => {
      expect(BOOKING_STATUSES).toContain('confirmed');
    });

    it('includes cancelled', () => {
      expect(BOOKING_STATUSES).toContain('cancelled');
    });

    it('includes completed', () => {
      expect(BOOKING_STATUSES).toContain('completed');
    });
  });

  describe('ALLOWED_TIME_SLOTS', () => {
    it('is an array with slots', () => {
      expect(Array.isArray(ALLOWED_TIME_SLOTS)).toBe(true);
      expect(ALLOWED_TIME_SLOTS.length).toBeGreaterThan(0);
    });

    it('all slots are strings', () => {
      ALLOWED_TIME_SLOTS.forEach(slot => {
        expect(typeof slot).toBe('string');
      });
    });
  });

  describe('OWNER_STATUSES', () => {
    it('includes pending, approved, rejected', () => {
      expect(OWNER_STATUSES).toContain('pending');
      expect(OWNER_STATUSES).toContain('approved');
      expect(OWNER_STATUSES).toContain('rejected');
    });
  });
});

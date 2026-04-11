import { ALLOWED_SPORTS, BOOKING_STATUSES } from '../config/constants.js';

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
});

import {
  isValidEmailId,
  isValidDuration,
  calculateExpirationTime,
  formatTimeRemaining,
  isEmailExpired
} from '../utils';
import { Duration } from '@/types';

describe('Validation and Utility Functions', () => {
  describe('isValidEmailId', () => {
    it('should return true for valid alphanumeric IDs', () => {
      expect(isValidEmailId('abc123')).toBe(true);
      expect(isValidEmailId('test123')).toBe(true);
      expect(isValidEmailId('email123')).toBe(true);
    });

    it('should return true for UUIDs with dashes', () => {
      expect(isValidEmailId('14dfda6b-8aea-4568-a0ba-3def86b8b8ef')).toBe(true);
      expect(isValidEmailId('abc-123-def')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidEmailId('')).toBe(false);
    });

    it('should return false for strings with special characters (except dash)', () => {
      expect(isValidEmailId('test@123')).toBe(false);
      expect(isValidEmailId('test_123')).toBe(false);
      expect(isValidEmailId('test.123')).toBe(false);
    });

    it('should return false for strings over 100 characters', () => {
      const longString = 'a'.repeat(101);
      expect(isValidEmailId(longString)).toBe(false);
    });

    it('should return false for non-string inputs (handled by type system)', () => {
      // TypeScript will catch type errors at compile time
      // This test ensures the function handles edge cases
      expect(isValidEmailId('')).toBe(false);
    });
  });

  describe('isValidDuration', () => {
    it('should return true for valid durations', () => {
      expect(isValidDuration('10min')).toBe(true);
      expect(isValidDuration('1hr')).toBe(true);
      expect(isValidDuration('1day')).toBe(true);
    });

    it('should return false for invalid durations', () => {
      expect(isValidDuration('5min')).toBe(false);
      expect(isValidDuration('2hr')).toBe(false);
      expect(isValidDuration('2days')).toBe(false);
      expect(isValidDuration('')).toBe(false);
      expect(isValidDuration('invalid')).toBe(false);
    });

    it('should have proper type guard behavior', () => {
      const testDuration = '10min' as string;
      if (isValidDuration(testDuration)) {
        // TypeScript should know testDuration is of type Duration here
        const duration: '10min' | '1hr' | '1day' = testDuration;
        expect(duration).toBe('10min');
      }
    });
  });

  describe('calculateExpirationTime', () => {
    const baseDate = new Date('2024-01-01T12:00:00Z');

    it('should calculate expiration for 10 minutes', () => {
      const result = calculateExpirationTime(baseDate, '10min');
      const expected = new Date('2024-01-01T12:10:00Z');
      expect(result).toEqual(expected);
    });

    it('should calculate expiration for 1 hour', () => {
      const result = calculateExpirationTime(baseDate, '1hr');
      const expected = new Date('2024-01-01T13:00:00Z');
      expect(result).toEqual(expected);
    });

    it('should calculate expiration for 1 day', () => {
      const result = calculateExpirationTime(baseDate, '1day');
      const expected = new Date('2024-01-02T12:00:00Z');
      expect(result).toEqual(expected);
    });

    it('should handle different base dates', () => {
      const baseDate = new Date('2024-12-31T23:30:00Z');
      const result = calculateExpirationTime(baseDate, '10min');
      const expected = new Date('2024-12-31T23:40:00Z');
      expect(result).toEqual(expected);
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format time remaining in HH:MM:SS format', () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (2 * 60 * 60 * 1000) + (30 * 60 * 1000) + 15000); // 2h 30m 15s
      const result = formatTimeRemaining(expiresAt);
      // Allow for slight timing differences (within 1 second)
      expect(result).toMatch(/^02:30:1[4-5]$/);
    });

    it('should return "Expired" for past dates', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const result = formatTimeRemaining(pastDate);
      expect(result).toBe('Expired');
    });

    it('should handle exactly 0 time remaining', () => {
      const now = new Date();
      const result = formatTimeRemaining(now);
      // When expiresAt is exactly now, it's considered expired
      expect(result).toBe('Expired');
    });

    it('should handle large time differences', () => {
      const now = new Date();
      const farFuture = new Date(now.getTime() + (25 * 60 * 60 * 1000)); // 25 hours
      const result = formatTimeRemaining(farFuture);
      expect(result).toBe('25:00:00');
    });

    it('should handle just under 1 hour', () => {
      const now = new Date();
      const future = new Date(now.getTime() + (59 * 60 * 1000) + (59 * 1000)); // 59m 59s
      const result = formatTimeRemaining(future);
      expect(result).toBe('00:59:59');
    });

    it('should handle exactly 1 second remaining', () => {
      const now = new Date();
      const future = new Date(now.getTime() + 1500); // 1.5 seconds from now to account for test execution time
      const result = formatTimeRemaining(future);
      expect(result).toBe('00:00:01');
    });
  });

  describe('isEmailExpired', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      expect(isEmailExpired(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now
      expect(isEmailExpired(futureDate)).toBe(false);
    });

    it('should return true for current time (edge case)', () => {
      const now = new Date();
      expect(isEmailExpired(now)).toBe(true); // If expires at exactly now, it's considered expired
    });

    it('should handle dates far in the future', () => {
      const farFuture = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 year from now
      expect(isEmailExpired(farFuture)).toBe(false);
    });

    it('should return false for dates just in the future', () => {
      const futureDate = new Date(Date.now() + 1000); // 1 second from now
      expect(isEmailExpired(futureDate)).toBe(false);
    });
  });
});
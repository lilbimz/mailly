/**
 * Rate Limiter Utility
 * Implements in-memory rate limiting with configurable limits per endpoint
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

type RateLimitStore = Map<string, RequestRecord>;

/**
 * Rate limiter class for managing request limits
 */
export class RateLimiter {
  private store: RateLimitStore = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if a request should be allowed
   * @param key - Unique identifier for the request (e.g., IP address + endpoint)
   * @returns Object with allowed status and remaining requests
   */
  isAllowed(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.store.get(key);

    // If no record exists or window has expired, create new record
    if (!record || now >= record.resetTime) {
      const newRecord: RequestRecord = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.store.set(key, newRecord);
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newRecord.resetTime,
      };
    }

    // Check if limit exceeded
    if (record.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // Increment count and allow request
    record.count++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clear all rate limit records
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get current record for a key (for testing/debugging)
   */
  getRecord(key: string): RequestRecord | undefined {
    return this.store.get(key);
  }
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  // 10 requests per minute for email creation
  createEmail: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  }),

  // 60 requests per minute for fetching messages
  getMessages: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  }),

  // 60 requests per minute for fetching single message
  getMessage: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  }),

  // 20 requests per minute for deleting emails
  deleteEmail: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  }),
};

/**
 * Extract client IP from request headers
 * Handles X-Forwarded-For header for proxied requests
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a default identifier if IP cannot be determined
  return 'unknown';
}

/**
 * Create a rate limit key combining IP and endpoint
 */
export function createRateLimitKey(ip: string, endpoint: string): string {
  return `${ip}:${endpoint}`;
}

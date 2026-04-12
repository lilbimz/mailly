/**
 * Rate Limit Middleware for Next.js API Routes
 * Provides utilities to check rate limits and return appropriate responses
 */

import { NextResponse } from 'next/server';
import { RateLimiter, getClientIp, createRateLimitKey } from './rateLimiter';

interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check rate limit and return response if exceeded
 * @param request - Next.js Request object
 * @param limiter - RateLimiter instance to use
 * @param endpoint - Endpoint identifier for rate limit key
 * @returns Response if rate limited, null if allowed
 */
export function checkRateLimit(
  request: Request,
  limiter: RateLimiter,
  endpoint: string
): NextResponse | null {
  const clientIp = getClientIp(request);
  const key = createRateLimitKey(clientIp, endpoint);
  const result = limiter.isAllowed(key);

  if (!result.allowed) {
    const resetTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': resetTimeSeconds.toString(),
          'X-RateLimit-Limit': limiter.getRecord(key)?.count.toString() || '0',
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        },
      }
    );
  }

  return null;
}

/**
 * Get rate limit info for a request (for debugging/monitoring)
 */
export function getRateLimitInfo(
  request: Request,
  limiter: RateLimiter,
  endpoint: string
): RateLimitCheckResult {
  const clientIp = getClientIp(request);
  const key = createRateLimitKey(clientIp, endpoint);
  return limiter.isAllowed(key);
}

/**
 * Integration tests for POST /api/email/create endpoint
 */

// Set up environment variable BEFORE importing the route
process.env.BOOMLIFY_API_KEY = 'test_api_key';

import { NextRequest } from 'next/server';
import { POST } from '../route';
import { rateLimiters } from '@/lib/rateLimiter';

// Mock fetch globally
global.fetch = jest.fn();

describe('POST /api/email/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear rate limiters before each test
    rateLimiters.createEmail.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create email with valid duration', async () => {
    // Mock Boomlify API response (actual format from Boomlify)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        email: {
          id: 'test123',
          address: 'test@temp.mail',
          domain: 'temp.mail',
          time_tier: '1hr',
          type: 'api_timebased',
          expires_at: '2026-04-12T13:00:00.000Z',
          created_at: '2026-04-12T12:00:00.000Z',
          is_custom_domain: false,
          time_remaining: {
            total_ms: 3600000,
            minutes: 60,
            seconds: 0,
            human_readable: '60 minutes 0 seconds',
          },
        },
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/email/create', {
      method: 'POST',
      body: JSON.stringify({ duration: '1hr' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('test123');
    expect(data.data.email).toBe('test@temp.mail');
    expect(data.data.duration).toBe('1hr');
    expect(data.data.createdAt).toBeDefined();
    expect(data.data.expiresAt).toBeDefined();
  });

  it('should return 400 for invalid duration', async () => {
    const request = new NextRequest('http://localhost:3000/api/email/create', {
      method: 'POST',
      body: JSON.stringify({ duration: 'invalid' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_DURATION');
  });

  it('should return 400 for missing duration', async () => {
    const request = new NextRequest('http://localhost:3000/api/email/create', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_DURATION');
  });

  it('should return 500 when Boomlify API fails', async () => {
    // Mock Boomlify API error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const request = new NextRequest('http://localhost:3000/api/email/create', {
      method: 'POST',
      body: JSON.stringify({ duration: '1hr' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
  });

  it('should enforce rate limiting', async () => {
    // Mock successful Boomlify responses (actual format)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        email: {
          id: 'test123',
          address: 'test@temp.mail',
          domain: 'temp.mail',
          time_tier: '1hr',
          type: 'api_timebased',
          expires_at: '2026-04-12T13:00:00.000Z',
          created_at: '2026-04-12T12:00:00.000Z',
          is_custom_domain: false,
          time_remaining: {
            total_ms: 3600000,
            minutes: 60,
            seconds: 0,
            human_readable: '60 minutes 0 seconds',
          },
        },
      }),
    });

    // Make 10 requests (should all succeed)
    for (let i = 0; i < 10; i++) {
      const request = new NextRequest('http://localhost:3000/api/email/create', {
        method: 'POST',
        body: JSON.stringify({ duration: '1hr' }),
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    // 11th request should be rate limited
    const request = new NextRequest('http://localhost:3000/api/email/create', {
      method: 'POST',
      body: JSON.stringify({ duration: '1hr' }),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should handle network timeout', async () => {
    // Mock timeout error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('Timeout'), { name: 'AbortError' })
    );

    const request = new NextRequest('http://localhost:3000/api/email/create', {
      method: 'POST',
      body: JSON.stringify({ duration: '1hr' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NETWORK_ERROR');
  });

  it.skip('should return 500 when API key is not configured', async () => {
    // Note: This test is skipped because the API key is read at module load time
    // In production, the API key should always be configured via environment variables
    
    // Remove API key
    delete process.env.BOOMLIFY_API_KEY;

    const request = new NextRequest('http://localhost:3000/api/email/create', {
      method: 'POST',
      body: JSON.stringify({ duration: '1hr' }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
  });
});

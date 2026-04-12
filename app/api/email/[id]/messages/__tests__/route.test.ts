/**
 * Integration tests for GET /api/email/[id]/messages endpoint
 */

import { NextRequest } from 'next/server';
import { rateLimiters } from '@/lib/rateLimiter';

// Mock fetch globally
global.fetch = jest.fn();

describe('GET /api/email/[id]/messages', () => {
  const originalEnv = process.env;
  let GET: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Clear rate limiters before each test
    rateLimiters.getMessages.clear();
    
    // Set up environment variable BEFORE importing the route
    process.env = { ...originalEnv, BOOMLIFY_API_KEY: 'test_api_key' };
    
    // Import the route handler after setting environment variables
    const routeModule = await import('../route');
    GET = routeModule.GET;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it('should fetch messages successfully with valid email ID', async () => {
    // Mock Boomlify API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          messages: [
            {
              id: 'msg1',
              from: 'sender@example.com',
              subject: 'Test Message 1',
              receivedAt: '2024-01-01T12:00:00Z',
              preview: 'This is a test message',
            },
            {
              id: 'msg2',
              from: 'another@example.com',
              subject: 'Test Message 2',
              receivedAt: '2024-01-01T11:00:00Z',
              preview: 'Another test message',
            },
          ],
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.messages).toHaveLength(2);
    expect(data.data.messages[0].id).toBe('msg1');
    expect(data.data.messages[0].from).toBe('sender@example.com');
    expect(data.data.messages[0].subject).toBe('Test Message 1');
    expect(data.data.messages[0].receivedAt).toBe('2024-01-01T12:00:00Z');
    expect(data.data.messages[0].preview).toBe('This is a test message');
  });

  it('should return 400 for invalid email ID format', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email/invalid@email/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'invalid@email' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
    expect(data.error.message).toBe('Invalid email ID format');
  });

  it('should return 400 for empty email ID', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email//messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
  });

  it('should return 404 for non-existent email', async () => {
    // Mock Boomlify API 404 response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/nonexistent123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'nonexistent123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('EMAIL_NOT_FOUND');
    expect(data.error.message).toBe('Email address not found. It may have expired.');
  });

  it('should return 429 when rate limit exceeded', async () => {
    // Mock successful Boomlify responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          messages: [],
        },
      }),
    });

    // Make 60 requests (should all succeed)
    for (let i = 0; i < 60; i++) {
      const request = new NextRequest(
        'http://localhost:3000/api/email/test123/messages',
        {
          method: 'GET',
          headers: {
            'x-forwarded-for': '127.0.0.1',
          },
        }
      );

      const response = await GET(request, { params: { id: 'test123' } });
      expect(response.status).toBe(200);
    }

    // 61st request should be rate limited
    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      }
    );

    const response = await GET(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should sort messages by receivedAt descending (newest first)', async () => {
    // Mock Boomlify API response with unsorted messages
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          messages: [
            {
              id: 'msg1',
              from: 'sender1@example.com',
              subject: 'Oldest Message',
              receivedAt: '2024-01-01T10:00:00Z',
              preview: 'First message',
            },
            {
              id: 'msg2',
              from: 'sender2@example.com',
              subject: 'Newest Message',
              receivedAt: '2024-01-01T14:00:00Z',
              preview: 'Latest message',
            },
            {
              id: 'msg3',
              from: 'sender3@example.com',
              subject: 'Middle Message',
              receivedAt: '2024-01-01T12:00:00Z',
              preview: 'Middle message',
            },
          ],
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.messages).toHaveLength(3);
    
    // Verify messages are sorted by receivedAt descending (newest first)
    expect(data.data.messages[0].id).toBe('msg2'); // 14:00:00 - newest
    expect(data.data.messages[0].subject).toBe('Newest Message');
    expect(data.data.messages[1].id).toBe('msg3'); // 12:00:00 - middle
    expect(data.data.messages[1].subject).toBe('Middle Message');
    expect(data.data.messages[2].id).toBe('msg1'); // 10:00:00 - oldest
    expect(data.data.messages[2].subject).toBe('Oldest Message');
  });

  it('should return empty array when no messages exist', async () => {
    // Mock Boomlify API response with no messages
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          messages: [],
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.messages).toEqual([]);
  });

  it('should return 500 when Boomlify API fails', async () => {
    // Mock Boomlify API error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
    expect(data.error.message).toBe('Failed to fetch messages. Please try again.');
  });

  it('should handle network timeout', async () => {
    // Mock timeout error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('Timeout'), { name: 'AbortError' })
    );

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NETWORK_ERROR');
    expect(data.error.message).toBe('Request timeout. Please try again.');
  });

  it('should return 500 when API key is not configured', async () => {
    // Reset modules and reimport without API key
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.BOOMLIFY_API_KEY;
    
    const routeModule = await import('../route');
    const GETWithoutKey = routeModule.GET;

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GETWithoutKey(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
    expect(data.error.message).toBe('Service temporarily unavailable');
  });

  it('should handle Boomlify API returning unsuccessful response', async () => {
    // Mock Boomlify API unsuccessful response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
        error: {
          message: 'Invalid email ID',
          code: 'INVALID_ID',
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
    expect(data.error.message).toBe('Invalid email ID');
  });

  it('should sanitize message data in response', async () => {
    // Mock Boomlify API response with extra fields
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          messages: [
            {
              id: 'msg1',
              from: 'sender@example.com',
              subject: 'Test Message',
              receivedAt: '2024-01-01T12:00:00Z',
              preview: 'Test preview',
              extraField: 'should not be included',
              internalData: { secret: 'value' },
            },
          ],
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.messages[0]).toEqual({
      id: 'msg1',
      from: 'sender@example.com',
      subject: 'Test Message',
      receivedAt: '2024-01-01T12:00:00Z',
      preview: 'Test preview',
    });
    expect(data.data.messages[0]).not.toHaveProperty('extraField');
    expect(data.data.messages[0]).not.toHaveProperty('internalData');
  });
});

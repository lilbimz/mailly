/**
 * Integration tests for GET /api/email/[id]/messages/[messageId] endpoint
 */

import { NextRequest } from 'next/server';
import { rateLimiters } from '@/lib/rateLimiter';

// Mock fetch globally
global.fetch = jest.fn();

describe('GET /api/email/[id]/messages/[messageId]', () => {
  const originalEnv = process.env;
  let GET: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Clear rate limiters before each test
    rateLimiters.getMessage.clear();
    
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

  it('should fetch message details successfully with valid IDs', async () => {
    // Mock Boomlify API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          message: {
            id: 'msg123',
            from: 'sender@example.com',
            subject: 'Test Message',
            receivedAt: '2024-01-01T12:00:00Z',
            body: '<p>This is the full message body</p>',
            isHtml: true,
          },
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('msg123');
    expect(data.data.from).toBe('sender@example.com');
    expect(data.data.subject).toBe('Test Message');
    expect(data.data.receivedAt).toBe('2024-01-01T12:00:00Z');
    expect(data.data.body).toBe('<p>This is the full message body</p>');
    expect(data.data.isHtml).toBe(true);
  });

  it('should fetch text message successfully', async () => {
    // Mock Boomlify API response with text message
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          message: {
            id: 'msg456',
            from: 'sender@example.com',
            subject: 'Plain Text Message',
            receivedAt: '2024-01-01T13:00:00Z',
            body: 'This is a plain text message body',
            isHtml: false,
          },
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg456',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg456' } 
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.body).toBe('This is a plain text message body');
    expect(data.data.isHtml).toBe(false);
  });

  it('should return 400 for invalid email ID format', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email/invalid@email/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'invalid@email', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
    expect(data.error.message).toBe('Invalid email ID format');
  });

  it('should return 400 for invalid message ID format', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/invalid@msg',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'invalid@msg' } 
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
    expect(data.error.message).toBe('Invalid message ID format');
  });

  it('should return 400 for empty email ID', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email//messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: '', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
  });

  it('should return 400 for empty message ID', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: '' } 
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
  });

  it('should return 400 for email ID with special characters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email/test-123!/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test-123!', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
  });

  it('should return 404 for non-existent message', async () => {
    // Mock Boomlify API 404 response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/nonexistent',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'nonexistent' } 
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('MESSAGE_NOT_FOUND');
    expect(data.error.message).toBe('Message not found');
  });

  it('should return 429 when rate limit exceeded', async () => {
    // Mock successful Boomlify responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          message: {
            id: 'msg123',
            from: 'sender@example.com',
            subject: 'Test',
            receivedAt: '2024-01-01T12:00:00Z',
            body: 'Test body',
            isHtml: false,
          },
        },
      }),
    });

    // Make 60 requests (should all succeed)
    for (let i = 0; i < 60; i++) {
      const request = new NextRequest(
        'http://localhost:3000/api/email/test123/messages/msg123',
        {
          method: 'GET',
          headers: {
            'x-forwarded-for': '127.0.0.1',
          },
        }
      );

      const response = await GET(request, { 
        params: { id: 'test123', messageId: 'msg123' } 
      });
      expect(response.status).toBe(200);
    }

    // 61st request should be rate limited
    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should return 500 when Boomlify API fails', async () => {
    // Mock Boomlify API error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
    expect(data.error.message).toBe('Failed to fetch message. Please try again.');
  });

  it('should handle network timeout', async () => {
    // Mock timeout error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('Timeout'), { name: 'AbortError' })
    );

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NETWORK_ERROR');
    expect(data.error.message).toBe('Request timeout. Please try again.');
  });

  it('should handle TimeoutError', async () => {
    // Mock TimeoutError
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('Timeout'), { name: 'TimeoutError' })
    );

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('NETWORK_ERROR');
  });

  it('should return 500 when API key is not configured', async () => {
    // Reset modules and reimport without API key
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.BOOMLIFY_API_KEY;
    
    const routeModule = await import('../route');
    const GETWithoutKey = routeModule.GET;

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GETWithoutKey(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
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
          message: 'Message access denied',
          code: 'ACCESS_DENIED',
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
    expect(data.error.message).toBe('Message access denied');
  });

  it('should return 404 when Boomlify returns no message data', async () => {
    // Mock Boomlify API response with missing message data
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {},
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('MESSAGE_NOT_FOUND');
    expect(data.error.message).toBe('Message not found');
  });

  it('should handle generic network errors', async () => {
    // Mock generic network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network connection failed')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNKNOWN_ERROR');
    expect(data.error.message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should return only sanitized message fields', async () => {
    // Mock Boomlify API response with extra fields
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          message: {
            id: 'msg123',
            from: 'sender@example.com',
            subject: 'Test Message',
            receivedAt: '2024-01-01T12:00:00Z',
            body: 'Message body',
            isHtml: false,
            extraField: 'should not be included',
            internalData: { secret: 'value' },
          },
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    const response = await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({
      id: 'msg123',
      from: 'sender@example.com',
      subject: 'Test Message',
      receivedAt: '2024-01-01T12:00:00Z',
      body: 'Message body',
      isHtml: false,
    });
    expect(data.data).not.toHaveProperty('extraField');
    expect(data.data).not.toHaveProperty('internalData');
  });

  it('should call Boomlify API with correct URL and parameters', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          message: {
            id: 'msg123',
            from: 'sender@example.com',
            subject: 'Test',
            receivedAt: '2024-01-01T12:00:00Z',
            body: 'Test body',
            isHtml: false,
          },
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123/messages/msg123',
      {
        method: 'GET',
      }
    );

    await GET(request, { 
      params: { id: 'test123', messageId: 'msg123' } 
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('https://v1.boomlify.com/api/v1/emails/test123/messages/msg123'),
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  });
});

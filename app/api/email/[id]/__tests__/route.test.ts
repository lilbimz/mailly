/**
 * Integration tests for DELETE /api/email/[id] endpoint
 */

import { NextRequest } from 'next/server';
import { rateLimiters } from '@/lib/rateLimiter';

// Mock fetch globally
global.fetch = jest.fn();

describe('DELETE /api/email/[id]', () => {
  const originalEnv = process.env;
  let DELETE: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Clear rate limiters before each test
    rateLimiters.deleteEmail.clear();
    
    // Set up environment variable BEFORE importing the route
    process.env = { ...originalEnv, BOOMLIFY_API_KEY: 'test_api_key' };
    
    // Import the route handler after setting environment variables
    const routeModule = await import('../route');
    DELETE = routeModule.DELETE;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  it('should delete email successfully with valid email ID', async () => {
    // Mock Boomlify API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Email deleted successfully',
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Email deleted successfully');
  });

  it('should return 400 for invalid email ID format', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email/invalid@email',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'invalid@email' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
    expect(data.error.message).toBe('Invalid email ID format');
  });

  it('should return 400 for empty email ID', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email/',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: '' } });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_EMAIL_ID');
  });

  it('should return 400 for email ID with special characters', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/email/test!@#$',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'test!@#$' } });
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
      'http://localhost:3000/api/email/nonexistent123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'nonexistent123' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('EMAIL_NOT_FOUND');
    expect(data.error.message).toBe('Email address not found. It may have already expired.');
  });

  it('should return 429 when rate limit exceeded', async () => {
    // Mock successful Boomlify responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Email deleted successfully',
      }),
    });

    // Make 20 requests (should all succeed)
    for (let i = 0; i < 20; i++) {
      const request = new NextRequest(
        `http://localhost:3000/api/email/test${i}`,
        {
          method: 'DELETE',
          headers: {
            'x-forwarded-for': '127.0.0.1',
          },
        }
      );

      const response = await DELETE(request, { params: { id: `test${i}` } });
      expect(response.status).toBe(200);
    }

    // 21st request should be rate limited
    const request = new NextRequest(
      'http://localhost:3000/api/email/test21',
      {
        method: 'DELETE',
        headers: {
          'x-forwarded-for': '127.0.0.1',
        },
      }
    );

    const response = await DELETE(request, { params: { id: 'test21' } });
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
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
    expect(data.error.message).toBe('Failed to delete email. Please try again.');
  });

  it('should handle network timeout', async () => {
    // Mock timeout error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('Timeout'), { name: 'AbortError' })
    );

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'test123' } });
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
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'test123' } });
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
    const DELETEWithoutKey = routeModule.DELETE;

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETEWithoutKey(request, { params: { id: 'test123' } });
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
          message: 'Email cannot be deleted',
        },
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
    expect(data.error.message).toBe('Email cannot be deleted');
  });

  it('should handle Boomlify API returning unsuccessful response without error message', async () => {
    // Mock Boomlify API unsuccessful response without error message
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('API_ERROR');
    expect(data.error.message).toBe('Failed to delete email');
  });

  it('should handle generic network errors', async () => {
    // Mock generic network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network connection failed')
    );

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    const response = await DELETE(request, { params: { id: 'test123' } });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNKNOWN_ERROR');
    expect(data.error.message).toBe('An unexpected error occurred. Please try again.');
  });

  it('should call Boomlify API with correct parameters', async () => {
    // Mock Boomlify API response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: 'Email deleted successfully',
      }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/email/test123',
      {
        method: 'DELETE',
      }
    );

    await DELETE(request, { params: { id: 'test123' } });

    // Verify fetch was called with correct URL and parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'https://v1.boomlify.com/api/v1/emails/test123',
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test_api_key',
        },
      })
    );
  });

  it('should handle different valid email ID formats', async () => {
    const validIds = ['abc123', 'ABC123', 'aBc123XyZ', '123456', 'a1b2c3'];

    for (const id of validIds) {
      jest.clearAllMocks();
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Email deleted successfully',
        }),
      });

      const request = new NextRequest(
        `http://localhost:3000/api/email/${id}`,
        {
          method: 'DELETE',
        }
      );

      const response = await DELETE(request, { params: { id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    }
  });
});

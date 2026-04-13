/**
 * POST /api/email/create
 * Creates a new temporary email address with specified duration
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimitMiddleware';
import { rateLimiters } from '@/lib/rateLimiter';
import { isValidDuration, calculateExpirationTime } from '@/lib/utils';
import { Duration, ERROR_CODES } from '@/types';

// Boomlify API configuration
const BOOMLIFY_API_BASE = 'https://v1.boomlify.com/api/v1';
const BOOMLIFY_API_KEY = process.env.BOOMLIFY_API_KEY;

interface BoomlifyCreateResponse {
  success: boolean;
  email?: {
    id: string;
    address: string;
    created_at: string;
    expires_at: string;
  };
  error?: {
    message: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Check rate limit (10 requests per minute per IP)
    const rateLimitResponse = checkRateLimit(
      request,
      rateLimiters.createEmail,
      'create-email'
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_DURATION,
            message: 'Invalid request body',
          },
        },
        { status: 400 }
      );
    }

    const { duration, domain } = body;

    // Validate duration parameter
    if (!duration || !isValidDuration(duration)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_DURATION,
            message: 'Invalid duration. Must be one of: 10min, 1hr, 1day',
          },
        },
        { status: 400 }
      );
    }

    // Validate API key is configured
    if (!BOOMLIFY_API_KEY) {
      console.error('BOOMLIFY_API_KEY is not configured');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.API_ERROR,
            message: 'Service temporarily unavailable',
          },
        },
        { status: 500 }
      );
    }

    // Call Boomlify API to create temporary email
    // Boomlify uses X-API-Key header for authentication
    // Map our duration format to Boomlify time format
    const timeMap: Record<Duration, string> = {
      '10min': '10min',
      '1hr': '1hour',  // Boomlify uses '1hour' not '1hr'
      '1day': '1day',
    };
    
    // IMPORTANT: time parameter must be in query string, not body
    // domain parameter is optional
    let boomlifyUrl = `${BOOMLIFY_API_BASE}/emails/create?time=${timeMap[duration as Duration]}`;
    if (domain) {
      boomlifyUrl += `&domain=${encodeURIComponent(domain)}`;
    }
    
    const boomlifyResponse = await fetch(boomlifyUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': BOOMLIFY_API_KEY,
        'Content-Type': 'application/json',
      },
      // Boomlify API timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (!boomlifyResponse.ok) {
      const errorText = await boomlifyResponse.text();
      console.error(
        `Boomlify API error: ${boomlifyResponse.status} ${boomlifyResponse.statusText}`,
        errorText
      );
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.API_ERROR,
            message: 'Failed to create temporary email. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    const boomlifyData = await boomlifyResponse.json();
    
    // Log actual response for debugging
    console.log('Boomlify create response:', JSON.stringify(boomlifyData, null, 2));

    // Boomlify response format: { success, email: { id, address, created_at, expires_at, ... } }
    if (!boomlifyData.success || !boomlifyData.email) {
      console.error('Boomlify API returned response without email field:', boomlifyData);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.API_ERROR,
            message: 'Failed to create temporary email',
          },
        },
        { status: 500 }
      );
    }

    // Extract email data from nested structure
    const emailData = boomlifyData.email;
    const createdAt = new Date(emailData.created_at);
    const expiresAt = new Date(emailData.expires_at);

    // Return sanitized response with email details
    return NextResponse.json(
      {
        success: true,
        data: {
          id: emailData.id,
          email: emailData.address,
          createdAt: createdAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          duration: duration,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle network errors and timeouts
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.error('Boomlify API request timeout:', error);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.NETWORK_ERROR,
              message: 'Request timeout. Please try again.',
            },
          },
          { status: 500 }
        );
      }

      console.error('Error creating email:', error);
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.UNKNOWN_ERROR,
          message: 'An unexpected error occurred. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}

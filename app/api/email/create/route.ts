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
  data?: {
    id: string;
    email: string;
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

    const { duration } = body;

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
    const boomlifyUrl = `${BOOMLIFY_API_BASE}/emails/create?api_key=${BOOMLIFY_API_KEY}`;
    
    const boomlifyResponse = await fetch(boomlifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Boomlify API timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (!boomlifyResponse.ok) {
      console.error(
        `Boomlify API error: ${boomlifyResponse.status} ${boomlifyResponse.statusText}`
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

    const boomlifyData: BoomlifyCreateResponse = await boomlifyResponse.json();

    if (!boomlifyData.success || !boomlifyData.data) {
      console.error('Boomlify API returned unsuccessful response:', boomlifyData);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.API_ERROR,
            message: boomlifyData.error?.message || 'Failed to create temporary email',
          },
        },
        { status: 500 }
      );
    }

    // Calculate expiration timestamp based on duration
    const createdAt = new Date();
    const expiresAt = calculateExpirationTime(createdAt, duration as Duration);

    // Return sanitized response with email details
    return NextResponse.json(
      {
        success: true,
        data: {
          id: boomlifyData.data.id,
          email: boomlifyData.data.email,
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

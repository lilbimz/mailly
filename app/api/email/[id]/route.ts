/**
 * DELETE /api/email/[id]
 * Deletes a temporary email address
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimitMiddleware';
import { rateLimiters } from '@/lib/rateLimiter';
import { isValidEmailId } from '@/lib/utils';
import { ERROR_CODES } from '@/types';

// Boomlify API configuration
const BOOMLIFY_API_BASE = 'https://v1.boomlify.com/api/v1';
const BOOMLIFY_API_KEY = process.env.BOOMLIFY_API_KEY;

interface BoomlifyDeleteResponse {
  message?: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check rate limit (20 requests per minute per IP)
    const rateLimitResponse = checkRateLimit(
      request,
      rateLimiters.deleteEmail,
      'delete-email'
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { id } = params;

    // Validate email ID format
    if (!id || !isValidEmailId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_EMAIL_ID,
            message: 'Invalid email ID format',
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

    // Call Boomlify API to delete email
    // Boomlify uses X-API-Key header for authentication
    const boomlifyUrl = `${BOOMLIFY_API_BASE}/emails/${id}`;
    
    const boomlifyResponse = await fetch(boomlifyUrl, {
      method: 'DELETE',
      headers: {
        'X-API-Key': BOOMLIFY_API_KEY,
        'Content-Type': 'application/json',
      },
      // Boomlify API timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    // Handle 404 - email not found
    if (boomlifyResponse.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.EMAIL_NOT_FOUND,
            message: 'Email address not found. It may have already expired.',
          },
        },
        { status: 404 }
      );
    }

    if (!boomlifyResponse.ok) {
      console.error(
        `Boomlify API error: ${boomlifyResponse.status} ${boomlifyResponse.statusText}`
      );
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.API_ERROR,
            message: 'Failed to delete email. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    const boomlifyData: BoomlifyDeleteResponse = await boomlifyResponse.json();

    // Log actual response for debugging
    console.log('Boomlify delete response:', JSON.stringify(boomlifyData, null, 2));

    // Check if response indicates success (some APIs return 200 with success: false)
    if (boomlifyData && typeof boomlifyData === 'object' && 'success' in boomlifyData && !boomlifyData.success) {
      console.error('Boomlify API returned unsuccessful response:', boomlifyData);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.API_ERROR,
            message: boomlifyData.error?.message || 'Failed to delete email',
          },
        },
        { status: 500 }
      );
    }

    // Return success confirmation
    return NextResponse.json(
      {
        success: true,
        message: 'Email deleted successfully',
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

      console.error('Error deleting email:', error);
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

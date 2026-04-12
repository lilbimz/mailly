/**
 * GET /api/email/[id]/messages/[messageId]
 * Fetches full content of a specific message
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimitMiddleware';
import { rateLimiters } from '@/lib/rateLimiter';
import { isValidEmailId } from '@/lib/utils';
import { ERROR_CODES } from '@/types';

// Boomlify API configuration
const BOOMLIFY_API_BASE = 'https://v1.boomlify.com/api/v1';
const BOOMLIFY_API_KEY = process.env.BOOMLIFY_API_KEY;

interface BoomlifyMessageDetail {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
  body: string;
  isHtml: boolean;
}

interface BoomlifyMessageResponse {
  success: boolean;
  data?: {
    message: BoomlifyMessageDetail;
  };
  error?: {
    message: string;
    code?: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const emailId = params.id;
    const messageId = params.messageId;

    // Validate email ID format
    if (!isValidEmailId(emailId)) {
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

    // Validate message ID format (same validation as email ID)
    if (!isValidEmailId(messageId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_EMAIL_ID,
            message: 'Invalid message ID format',
          },
        },
        { status: 400 }
      );
    }

    // Check rate limit (60 requests per minute per IP)
    const rateLimitResponse = checkRateLimit(
      request,
      rateLimiters.getMessage,
      'get-message'
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
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

    // Call Boomlify API to fetch full message content
    const boomlifyUrl = `${BOOMLIFY_API_BASE}/emails/${emailId}/messages/${messageId}?api_key=${BOOMLIFY_API_KEY}`;
    
    const boomlifyResponse = await fetch(boomlifyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Boomlify API timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    // Handle 404 - message not found
    if (boomlifyResponse.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.MESSAGE_NOT_FOUND,
            message: 'Message not found',
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
            message: 'Failed to fetch message. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    const boomlifyData: BoomlifyMessageResponse = await boomlifyResponse.json();

    if (!boomlifyData.success) {
      console.error('Boomlify API returned unsuccessful response:', boomlifyData);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.API_ERROR,
            message: boomlifyData.error?.message || 'Failed to fetch message',
          },
        },
        { status: 500 }
      );
    }

    // Extract message data
    const message = boomlifyData.data?.message;

    if (!message) {
      console.error('Boomlify API returned no message data');
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.MESSAGE_NOT_FOUND,
            message: 'Message not found',
          },
        },
        { status: 404 }
      );
    }

    // Return complete message with body content
    // Note: HTML sanitization will be done client-side using DOMPurify
    return NextResponse.json(
      {
        success: true,
        data: {
          id: message.id,
          from: message.from,
          subject: message.subject,
          receivedAt: message.receivedAt,
          body: message.body,
          isHtml: message.isHtml,
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

      console.error('Error fetching message:', error);
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

/**
 * GET /api/email/[id]/messages/[messageId]
 * Fetches full content of a specific message
 * 
 * Note: Boomlify API doesn't have a dedicated endpoint for individual messages.
 * We fetch all messages for the email and return the matching one.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimitMiddleware';
import { rateLimiters } from '@/lib/rateLimiter';
import { isValidEmailId } from '@/lib/utils';
import { ERROR_CODES } from '@/types';

// Boomlify API configuration
const BOOMLIFY_API_BASE = 'https://v1.boomlify.com/api/v1';
const BOOMLIFY_API_KEY = process.env.BOOMLIFY_API_KEY;

interface BoomlifyMessage {
  id: string;
  from: string;
  subject: string;
  body?: string;
  received_at?: string;
  receivedAt?: string;
  preview?: string;
  isHtml?: boolean;
}

interface BoomlifyEmailResponse {
  success: boolean;
  data?: {
    messages?: BoomlifyMessage[];
    message?: BoomlifyMessage;
  };
  error?: {
    message: string;
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

    // Fetch email with messages from Boomlify API
    const boomlifyResponse = await fetch(
      `${BOOMLIFY_API_BASE}/emails/${emailId}/messages/${messageId}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': BOOMLIFY_API_KEY,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    let boomlifyData: BoomlifyEmailResponse;
    try {
      boomlifyData = await boomlifyResponse.json();
    } catch (e) {
      // If json() fails, treat as API error
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
    
    // Log actual response for debugging
    console.log('Boomlify get email response:', JSON.stringify(boomlifyData, null, 2));

    // Check if response is successful
    if (!boomlifyData.success || !boomlifyData.data) {
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

    // Get the message - could be a single message or from an array
    let message: BoomlifyMessage | undefined;
    
    if (boomlifyData.data.message) {
      // Single message response
      message = boomlifyData.data.message;
    } else if (boomlifyData.data.messages) {
      // Array of messages - find the specific one
      message = boomlifyData.data.messages.find((msg) => msg.id === messageId);
    }

    if (!message) {
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
          receivedAt: message.received_at || message.receivedAt,
          body: message.body || '',
          isHtml: message.isHtml ?? false,
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

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
  body: string;
  received_at: string;
}

interface BoomlifyEmailResponse {
  success: boolean;
  email?: {
    id: string;
    address: string;
    message_count: number;
    messages?: BoomlifyMessage[];
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

    const boomlifyData: BoomlifyEmailResponse = await boomlifyResponse.json();
    
    // Log actual response for debugging
    console.log('Boomlify get email response:', JSON.stringify(boomlifyData, null, 2));

    // Check if response is successful
    if (!boomlifyData.success || !boomlifyData.email) {
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

    // Find the specific message
    // Note: Boomlify free tier may not return messages array, only message_count
    const messages = boomlifyData.email.messages || [];
    const message = messages.find((msg) => msg.id === messageId);

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
          receivedAt: message.received_at,
          body: message.body,
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

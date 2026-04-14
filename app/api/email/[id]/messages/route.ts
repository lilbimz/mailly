/**
 * GET /api/email/[id]/messages
 * Fetches all messages for a temporary email address
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
}

interface BoomlifyEmailResponse {
  success: boolean;
  data?: {
    messages: BoomlifyMessage[];
  };
  error?: {
    message: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emailId = params.id;

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

    // Check rate limit (60 requests per minute per IP)
    const rateLimitResponse = checkRateLimit(
      request,
      rateLimiters.getMessages,
      'get-messages'
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

    // Call Boomlify API to fetch email and messages
    // Use GET /api/v1/emails/{id} endpoint (not /emails/{id}/messages which is premium)
    // This endpoint returns email details + messages for time-based API emails
    const boomlifyUrl = `${BOOMLIFY_API_BASE}/emails/${emailId}`;
    
    const boomlifyResponse = await fetch(boomlifyUrl, {
      method: 'GET',
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
            message: 'Email address not found. It may have expired.',
          },
        },
        { status: 404 }
      );
    }

    if (!boomlifyResponse.ok) {
      let errorText = '';
      try {
        errorText = await boomlifyResponse.text();
      } catch (e) {
        // Ignore error if text() is not available
      }
      console.error(
        `Boomlify API error: ${boomlifyResponse.status} ${boomlifyResponse.statusText}`,
        errorText
      );
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.API_ERROR,
            message: 'Failed to fetch messages. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    const boomlifyData: BoomlifyEmailResponse = await boomlifyResponse.json();
    
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
            message: boomlifyData.error?.message || 'Failed to fetch messages',
          },
        },
        { status: 500 }
      );
    }

    // Extract and sanitize message list
    const messages = boomlifyData.data.messages || [];
    
    // Log message count for debugging
    console.log(`[DEBUG] Email ${emailId} has ${messages.length} messages in response`);

    // Sort messages by received_at descending (newest first)
    const sortedMessages = messages.sort((a, b) => {
      const dateA = new Date(a.received_at || a.receivedAt || '').getTime();
      const dateB = new Date(b.received_at || b.receivedAt || '').getTime();
      return dateB - dateA; // Descending order
    });

    // Return sanitized message list
    return NextResponse.json(
      {
        success: true,
        data: {
          messages: sortedMessages.map((msg) => ({
            id: msg.id,
            from: msg.from,
            subject: msg.subject,
            receivedAt: msg.received_at || msg.receivedAt,
            preview: msg.preview || (msg.body ? msg.body.substring(0, 100) : ''),
          })),
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

      console.error('Error fetching messages:', error);
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

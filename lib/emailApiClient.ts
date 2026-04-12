import { TemporaryEmail, Message, Duration, ApiResponse, ERROR_CODES } from '@/types';

/**
 * Custom error class for API-related errors
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * EmailApiClient handles all frontend API communication with the backend proxy layer
 * All requests include timeout handling and typed error responses
 */
export class EmailApiClient {
  private readonly baseUrl = '/api';
  private readonly timeout = 10000; // 10 seconds

  /**
   * Create a temporary email address
   * @param duration - How long the email should remain active
   * @returns The created temporary email
   * @throws ApiError if creation fails
   */
  async createEmail(duration: Duration): Promise<TemporaryEmail> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/email/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      }
    );

    const data = await this.parseResponse<{
      id: string;
      email: string;
      expiresAt: string;
    }>(response);

    return {
      id: data.id,
      email: data.email,
      createdAt: new Date(),
      expiresAt: new Date(data.expiresAt),
      duration,
      unreadCount: 0,
    };
  }

  /**
   * Fetch all messages for a temporary email
   * @param emailId - The temporary email ID
   * @returns Array of messages in the inbox
   * @throws ApiError if fetch fails
   */
  async getMessages(emailId: string): Promise<Message[]> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/email/${emailId}/messages`,
      { method: 'GET' }
    );

    const data = await this.parseResponse<{
      messages: Array<{
        id: string;
        from: string;
        subject: string;
        receivedAt: string;
        preview: string;
      }>;
    }>(response);

    return data.messages.map((msg) => ({
      id: msg.id,
      emailId,
      from: msg.from,
      subject: msg.subject,
      receivedAt: new Date(msg.receivedAt),
      preview: msg.preview,
      body: '', // Body is fetched separately via getMessage
      isHtml: false,
      isRead: false,
    }));
  }

  /**
   * Fetch full content of a specific message
   * @param emailId - The temporary email ID
   * @param messageId - The message ID
   * @returns The complete message with body content
   * @throws ApiError if fetch fails
   */
  async getMessage(emailId: string, messageId: string): Promise<Message> {
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/email/${emailId}/messages/${messageId}`,
      { method: 'GET' }
    );

    const data = await this.parseResponse<{
      id: string;
      from: string;
      subject: string;
      receivedAt: string;
      body: string;
      isHtml: boolean;
    }>(response);

    return {
      id: data.id,
      emailId,
      from: data.from,
      subject: data.subject,
      receivedAt: new Date(data.receivedAt),
      preview: data.body.substring(0, 100),
      body: data.body,
      isHtml: data.isHtml,
      isRead: false,
    };
  }

  /**
   * Delete a temporary email address
   * @param emailId - The temporary email ID to delete
   * @throws ApiError if deletion fails
   */
  async deleteEmail(emailId: string): Promise<void> {
    await this.fetchWithTimeout(
      `${this.baseUrl}/email/${emailId}`,
      { method: 'DELETE' }
    );

    // Parse response to ensure success
    const response = await this.fetchWithTimeout(
      `${this.baseUrl}/email/${emailId}`,
      { method: 'DELETE' }
    );

    await this.parseResponse<{ message: string }>(response);
  }

  /**
   * Fetch with timeout handling
   * @param url - The URL to fetch
   * @param options - Fetch options
   * @returns The fetch response
   * @throws ApiError if timeout or network error occurs
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          ERROR_CODES.NETWORK_ERROR,
          'Request timeout. Please check your connection and try again.',
          undefined
        );
      }

      if (error instanceof TypeError) {
        throw new ApiError(
          ERROR_CODES.NETWORK_ERROR,
          'Network error. Please check your connection and try again.',
          undefined
        );
      }

      throw new ApiError(
        ERROR_CODES.UNKNOWN_ERROR,
        'An unexpected error occurred',
        undefined
      );
    }
  }

  /**
   * Parse API response and handle errors
   * @param response - The fetch response
   * @returns Parsed response data
   * @throws ApiError if response indicates an error
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    let data: ApiResponse<T>;

    try {
      data = await response.json();
    } catch (error) {
      throw new ApiError(
        ERROR_CODES.API_ERROR,
        'Invalid response from server',
        response.status
      );
    }

    // Handle error responses
    if (!data.success) {
      const errorCode = data.error?.code || ERROR_CODES.UNKNOWN_ERROR;
      const errorMessage =
        data.error?.message || 'An error occurred. Please try again.';

      throw new ApiError(errorCode, errorMessage, response.status);
    }

    // Handle HTTP error status codes
    if (!response.ok) {
      throw new ApiError(
        ERROR_CODES.API_ERROR,
        'Server error. Please try again later.',
        response.status
      );
    }

    if (!data.data) {
      throw new ApiError(
        ERROR_CODES.API_ERROR,
        'Invalid response format',
        response.status
      );
    }

    return data.data;
  }
}

// Export singleton instance for use throughout the application
export const emailApiClient = new EmailApiClient();

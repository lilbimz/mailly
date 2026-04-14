/**
 * Unit tests for EmailApiClient
 * Tests successful API calls, error handling, timeout handling, and error parsing
 */

import { EmailApiClient, ApiError } from '../emailApiClient';
import { ERROR_CODES } from '@/types';
import {
  mockFetch,
  mockFetchError,
  setupCommonMocks,
  resetAllMocks,
} from './mocks';
import {
  mockTemporaryEmail,
  mockMessage,
  mockHtmlMessage,
  mockMessages,
  mockApiResponse,
  mockErrorResponse,
  mockRateLimitResponse,
  mockValidationErrorResponse,
} from './fixtures';

describe('EmailApiClient', () => {
  let client: EmailApiClient;

  beforeEach(() => {
    setupCommonMocks();
    client = new EmailApiClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetAllMocks();
  });

  describe('createEmail', () => {
    it('should successfully create email with valid duration', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: mockTemporaryEmail.id,
          email: mockTemporaryEmail.email,
          expiresAt: mockTemporaryEmail.expiresAt.toISOString(),
        },
      };

      global.fetch = mockFetch(mockResponse, 200) as any;

      const result = await client.createEmail('1hr');

      expect(result).toEqual(
        expect.objectContaining({
          id: mockTemporaryEmail.id,
          email: mockTemporaryEmail.email,
          duration: '1hr',
          unreadCount: 0,
        })
      );
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/email/create',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration: '1hr' }),
        })
      );
    });

    it('should successfully create email with 10min duration', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'test-10min',
          email: 'test10min@temp.mail',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
      };

      global.fetch = mockFetch(mockResponse, 200) as any;

      const result = await client.createEmail('10min');

      expect(result.duration).toBe('10min');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/email/create',
        expect.objectContaining({
          body: JSON.stringify({ duration: '10min' }),
        })
      );
    });

    it('should successfully create email with 1day duration', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'test-1day',
          email: 'test1day@temp.mail',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      };

      global.fetch = mockFetch(mockResponse, 200) as any;

      const result = await client.createEmail('1day');

      expect(result.duration).toBe('1day');
    });

    it('should throw ApiError on invalid duration response', async () => {
      global.fetch = mockFetch(mockValidationErrorResponse, 400) as any;

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.INVALID_DURATION,
      });
    });

    it('should throw ApiError on rate limit exceeded', async () => {
      global.fetch = mockFetch(mockRateLimitResponse, 429) as any;

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        status: 429,
      });
    });

    it('should throw ApiError on server error', async () => {
      global.fetch = mockFetch(mockErrorResponse, 500) as any;

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.API_ERROR,
        status: 500,
      });
    });
  });

  describe('getMessages', () => {
    it('should successfully fetch messages for valid email ID', async () => {
      const mockResponse = {
        success: true,
        data: {
          messages: [
            {
              id: mockMessage.id,
              from: mockMessage.from,
              subject: mockMessage.subject,
              receivedAt: mockMessage.receivedAt.toISOString(),
              preview: mockMessage.preview,
            },
            {
              id: mockMessages[1].id,
              from: mockMessages[1].from,
              subject: mockMessages[1].subject,
              receivedAt: mockMessages[1].receivedAt.toISOString(),
              preview: mockMessages[1].preview,
            },
          ],
        },
      };

      global.fetch = mockFetch(mockResponse, 200) as any;

      const result = await client.getMessages('test-email-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: mockMessage.id,
          emailId: 'test-email-123',
          from: mockMessage.from,
          subject: mockMessage.subject,
          isRead: false,
        })
      );
      expect(result[0].receivedAt).toBeInstanceOf(Date);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/email/test-email-123/messages',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should return empty array when no messages', async () => {
      const mockResponse = {
        success: true,
        data: {
          messages: [],
        },
      };

      global.fetch = mockFetch(mockResponse, 200) as any;

      const result = await client.getMessages('test-email-123');

      expect(result).toEqual([]);
    });

    it('should throw ApiError on invalid email ID', async () => {
      global.fetch = mockFetch(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_EMAIL_ID,
            message: 'Invalid email ID format',
          },
        },
        400
      ) as any;

      await expect(client.getMessages('invalid@id')).rejects.toThrow(ApiError);
      await expect(client.getMessages('invalid@id')).rejects.toMatchObject({
        code: ERROR_CODES.INVALID_EMAIL_ID,
      });
    });

    it('should throw ApiError when email not found', async () => {
      global.fetch = mockFetch(
        {
          success: false,
          error: {
            code: ERROR_CODES.EMAIL_NOT_FOUND,
            message: 'Email address not found',
          },
        },
        404
      ) as any;

      await expect(client.getMessages('nonexistent')).rejects.toThrow(ApiError);
      await expect(client.getMessages('nonexistent')).rejects.toMatchObject({
        code: ERROR_CODES.EMAIL_NOT_FOUND,
        status: 404,
      });
    });

    it('should throw ApiError on rate limit exceeded', async () => {
      global.fetch = mockFetch(mockRateLimitResponse, 429) as any;

      await expect(client.getMessages('test-email-123')).rejects.toThrow(
        ApiError
      );
      await expect(client.getMessages('test-email-123')).rejects.toMatchObject({
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        status: 429,
      });
    });
  });

  describe('getMessage', () => {
    it('should successfully fetch full message content', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: mockMessage.id,
          from: mockMessage.from,
          subject: mockMessage.subject,
          receivedAt: mockMessage.receivedAt.toISOString(),
          body: mockMessage.body,
          isHtml: false,
        },
      };

      global.fetch = mockFetch(mockResponse, 200) as any;

      const result = await client.getMessage('test-email-123', 'msg-123');

      expect(result).toEqual(
        expect.objectContaining({
          id: mockMessage.id,
          emailId: 'test-email-123',
          from: mockMessage.from,
          subject: mockMessage.subject,
          body: mockMessage.body,
          isHtml: false,
          isRead: false,
        })
      );
      expect(result.receivedAt).toBeInstanceOf(Date);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/email/test-email-123/messages/msg-123',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should successfully fetch HTML message content', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: mockHtmlMessage.id,
          from: mockHtmlMessage.from,
          subject: mockHtmlMessage.subject,
          receivedAt: mockHtmlMessage.receivedAt.toISOString(),
          body: mockHtmlMessage.body,
          isHtml: true,
        },
      };

      global.fetch = mockFetch(mockResponse, 200) as any;

      const result = await client.getMessage('test-email-123', 'msg-456');

      expect(result.isHtml).toBe(true);
      expect(result.body).toContain('<p>');
    });

    it('should throw ApiError on invalid email ID', async () => {
      global.fetch = mockFetch(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_EMAIL_ID,
            message: 'Invalid email ID format',
          },
        },
        400
      ) as any;

      await expect(
        client.getMessage('invalid@id', 'msg-123')
      ).rejects.toThrow(ApiError);
      await expect(
        client.getMessage('invalid@id', 'msg-123')
      ).rejects.toMatchObject({
        code: ERROR_CODES.INVALID_EMAIL_ID,
      });
    });

    it('should throw ApiError when message not found', async () => {
      global.fetch = mockFetch(
        {
          success: false,
          error: {
            code: ERROR_CODES.MESSAGE_NOT_FOUND,
            message: 'Message not found',
          },
        },
        404
      ) as any;

      await expect(
        client.getMessage('test-email-123', 'nonexistent')
      ).rejects.toThrow(ApiError);
      await expect(
        client.getMessage('test-email-123', 'nonexistent')
      ).rejects.toMatchObject({
        code: ERROR_CODES.MESSAGE_NOT_FOUND,
        status: 404,
      });
    });

    it('should throw ApiError on rate limit exceeded', async () => {
      global.fetch = mockFetch(mockRateLimitResponse, 429) as any;

      await expect(
        client.getMessage('test-email-123', 'msg-123')
      ).rejects.toThrow(ApiError);
      await expect(
        client.getMessage('test-email-123', 'msg-123')
      ).rejects.toMatchObject({
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        status: 429,
      });
    });
  });

  describe('deleteEmail', () => {
    it('should successfully delete email', async () => {
      const mockResponse = {
        success: true,
        data: {
          message: 'Email deleted successfully',
        },
      };

      global.fetch = mockFetch(mockResponse, 200) as any;

      await expect(client.deleteEmail('test-email-123')).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/email/test-email-123',
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should throw ApiError on invalid email ID', async () => {
      global.fetch = mockFetch(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_EMAIL_ID,
            message: 'Invalid email ID format',
          },
        },
        400
      ) as any;

      await expect(client.deleteEmail('invalid@id')).rejects.toThrow(ApiError);
      await expect(client.deleteEmail('invalid@id')).rejects.toMatchObject({
        code: ERROR_CODES.INVALID_EMAIL_ID,
      });
    });

    it('should throw ApiError when email not found', async () => {
      global.fetch = mockFetch(
        {
          success: false,
          error: {
            code: ERROR_CODES.EMAIL_NOT_FOUND,
            message: 'Email not found',
          },
        },
        404
      ) as any;

      await expect(client.deleteEmail('nonexistent')).rejects.toThrow(ApiError);
      await expect(client.deleteEmail('nonexistent')).rejects.toMatchObject({
        code: ERROR_CODES.EMAIL_NOT_FOUND,
        status: 404,
      });
    });

    it('should throw ApiError on rate limit exceeded', async () => {
      global.fetch = mockFetch(mockRateLimitResponse, 429) as any;

      await expect(client.deleteEmail('test-email-123')).rejects.toThrow(
        ApiError
      );
      await expect(client.deleteEmail('test-email-123')).rejects.toMatchObject({
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        status: 429,
      });
    });
  });

  describe('Network Error Handling', () => {
    it('should throw ApiError on network failure', async () => {
      global.fetch = mockFetchError('Network request failed') as any;

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.NETWORK_ERROR,
        message: expect.stringContaining('Network error'),
      });
    });

    it('should throw ApiError on fetch TypeError', async () => {
      global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.NETWORK_ERROR,
      });
    });

    it('should throw ApiError on unknown error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Unknown error'));

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.NETWORK_ERROR,
      });
    });
  });

  describe('Timeout Handling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throw ApiError on request timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      global.fetch = jest.fn().mockRejectedValue(abortError);

      const promise = client.createEmail('1hr');

      jest.advanceTimersByTime(10000);

      await expect(promise).rejects.toThrow(ApiError);
      await expect(promise).rejects.toMatchObject({
        code: ERROR_CODES.NETWORK_ERROR,
        message: expect.stringContaining('timeout'),
      });
    });

    it('should abort request after 10 seconds', async () => {
      const abortSpy = jest.fn();
      const mockAbortController = {
        abort: abortSpy,
        signal: {},
      };

      jest.spyOn(global, 'AbortController' as any).mockImplementation(() => mockAbortController);

      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';

      global.fetch = jest.fn().mockRejectedValue(abortError);

      const promise = client.createEmail('1hr');

      jest.advanceTimersByTime(10000);

      await expect(promise).rejects.toThrow(ApiError);
      expect(abortSpy).toHaveBeenCalled();
    });
  });

  describe('Error Parsing', () => {
    it('should parse API error response with error code and message', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'CUSTOM_ERROR',
          message: 'Custom error message',
        },
      };

      global.fetch = mockFetch(errorResponse, 400) as any;

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: 'CUSTOM_ERROR',
        message: 'Custom error message',
        status: 400,
      });
    });

    it('should use default error message when not provided', async () => {
      const errorResponse = {
        success: false,
        error: {
          code: 'SOME_ERROR',
        },
      };

      global.fetch = mockFetch(errorResponse, 400) as any;

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: 'SOME_ERROR',
        message: 'An error occurred. Please try again.',
      });
    });

    it('should handle invalid JSON response', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
      });

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.API_ERROR,
        message: 'Invalid response from server',
        status: 500,
      });
    });

    it('should handle response without data field', async () => {
      const errorResponse = {
        success: true,
        // Missing data field
      };

      global.fetch = mockFetch(errorResponse, 200) as any;

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.API_ERROR,
        message: 'Invalid response format',
      });
    });

    it('should handle HTTP error status with success=true', async () => {
      const errorResponse = {
        success: true,
        data: { id: '123' },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue(errorResponse),
      });

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.API_ERROR,
        message: 'Server error. Please try again later.',
        status: 500,
      });
    });

    it('should use UNKNOWN_ERROR code when error code missing', async () => {
      const errorResponse = {
        success: false,
        error: {
          message: 'Some error occurred',
        },
      };

      global.fetch = mockFetch(errorResponse, 400) as any;

      await expect(client.createEmail('1hr')).rejects.toThrow(ApiError);
      await expect(client.createEmail('1hr')).rejects.toMatchObject({
        code: ERROR_CODES.UNKNOWN_ERROR,
      });
    });
  });

  describe('ApiError class', () => {
    it('should create ApiError with code, message, and status', () => {
      const error = new ApiError('TEST_CODE', 'Test message', 400);

      expect(error).toBeInstanceOf(Error);
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.status).toBe(400);
      expect(error.name).toBe('ApiError');
    });

    it('should create ApiError without status', () => {
      const error = new ApiError('TEST_CODE', 'Test message');

      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.status).toBeUndefined();
    });
  });
});

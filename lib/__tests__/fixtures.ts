/**
 * Mock data fixtures for testing
 */

export const mockTemporaryEmail = {
  id: 'test-email-123',
  email: 'test123@temp.mail',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  expiresAt: new Date('2024-01-01T13:00:00Z'),
  duration: '1hr' as const,
  unreadCount: 2,
}

export const mockMessage = {
  id: 'msg-123',
  emailId: 'test-email-123',
  from: 'sender@example.com',
  subject: 'Test Email Subject',
  receivedAt: new Date('2024-01-01T12:30:00Z'),
  preview: 'This is a preview of the message content...',
  body: 'This is the full message body with more details.',
  isHtml: false,
  isRead: false,
}

export const mockHtmlMessage = {
  ...mockMessage,
  id: 'msg-456',
  body: '<p>This is <strong>HTML</strong> content</p>',
  isHtml: true,
}

export const mockMessages = [
  mockMessage,
  {
    ...mockMessage,
    id: 'msg-124',
    from: 'another@example.com',
    subject: 'Another Email',
    receivedAt: new Date('2024-01-01T12:15:00Z'),
  },
]

export const mockTemporaryEmails = [
  mockTemporaryEmail,
  {
    ...mockTemporaryEmail,
    id: 'test-email-456',
    email: 'test456@temp.mail',
    duration: '10min' as const,
    expiresAt: new Date('2024-01-01T12:10:00Z'),
    unreadCount: 0,
  },
  {
    ...mockTemporaryEmail,
    id: 'test-email-789',
    email: 'test789@temp.mail',
    duration: '1day' as const,
    expiresAt: new Date('2024-01-02T12:00:00Z'),
    unreadCount: 5,
  },
]

export const mockApiResponse = {
  success: true,
  data: mockTemporaryEmail,
}

export const mockErrorResponse = {
  success: false,
  error: {
    code: 'API_ERROR',
    message: 'An error occurred',
  },
}

export const mockRateLimitResponse = {
  success: false,
  error: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please wait a moment and try again.',
  },
}

export const mockValidationErrorResponse = {
  success: false,
  error: {
    code: 'INVALID_DURATION',
    message: 'Invalid duration. Must be one of: 10min, 1hr, 1day',
  },
}

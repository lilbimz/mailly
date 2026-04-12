// Type Definitions for TempMail Pro Web Application

/**
 * Duration options for temporary email validity
 */
export type Duration = '10min' | '1hr' | '1day';

/**
 * Mapping of duration options to milliseconds
 */
export const DURATION_MS: Record<Duration, number> = {
  '10min': 10 * 60 * 1000,
  '1hr': 60 * 60 * 1000,
  '1day': 24 * 60 * 60 * 1000,
} as const;

/**
 * Temporary email address with metadata
 */
export interface TemporaryEmail {
  id: string;                    // Unique identifier from Boomlify
  email: string;                 // Full email address
  createdAt: Date;               // Creation timestamp
  expiresAt: Date;               // Expiration timestamp
  duration: Duration;            // Selected duration
  unreadCount: number;           // Number of unread messages
}

/**
 * Email message received in temporary inbox
 */
export interface Message {
  id: string;                    // Unique message identifier
  emailId: string;               // Parent email ID
  from: string;                  // Sender email address
  subject: string;               // Email subject
  receivedAt: Date;              // Received timestamp
  preview: string;               // First 100 characters of body
  body: string;                  // Full message body
  isHtml: boolean;               // Whether body contains HTML
  isRead: boolean;               // Read status (client-side only)
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * localStorage schema for persisting application state
 */
export interface LocalStorageSchema {
  emails: TemporaryEmail[];      // Array of temporary emails
  theme: 'light' | 'dark';       // Theme preference
  notificationsEnabled: boolean; // Notification permission status
  lastCleanup: Date;             // Last time expired emails were removed
}

/**
 * Error codes for standardized error handling
 */
export const ERROR_CODES = {
  INVALID_DURATION: 'INVALID_DURATION',
  INVALID_EMAIL_ID: 'INVALID_EMAIL_ID',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  EMAIL_NOT_FOUND: 'EMAIL_NOT_FOUND',
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * localStorage keys for consistent storage access
 */
export const STORAGE_KEYS = {
  EMAILS: 'tempmail_emails',
  THEME: 'tempmail_theme',
  NOTIFICATIONS: 'tempmail_notifications',
  LAST_CLEANUP: 'tempmail_last_cleanup',
} as const;

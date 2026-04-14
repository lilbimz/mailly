// localStorage Helper Functions for TempMail Pro

import { TemporaryEmail, STORAGE_KEYS, ERROR_CODES } from '@/types';
import { isEmailExpired } from './utils';

/**
 * Serializes a TemporaryEmail to JSON-compatible format
 * Converts Date objects to ISO strings for storage
 * 
 * @param email - Email to serialize
 * @returns Serialized email object
 */
function serializeEmail(email: TemporaryEmail): Record<string, unknown> {
  return {
    id: email.id,
    email: email.email,
    createdAt: email.createdAt.toISOString(),
    expiresAt: email.expiresAt.toISOString(),
    duration: email.duration,
    unreadCount: email.unreadCount,
  };
}

/**
 * Deserializes a JSON object to TemporaryEmail
 * Converts ISO strings back to Date objects
 * 
 * @param data - Serialized email data
 * @returns Deserialized TemporaryEmail
 * @throws Error if data is invalid
 */
function deserializeEmail(data: unknown): TemporaryEmail {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid email data: not an object');
  }

  const obj = data as Record<string, unknown>;

  // Validate required fields
  if (
    typeof obj.id !== 'string' ||
    typeof obj.email !== 'string' ||
    typeof obj.createdAt !== 'string' ||
    typeof obj.expiresAt !== 'string' ||
    typeof obj.duration !== 'string' ||
    typeof obj.unreadCount !== 'number'
  ) {
    throw new Error('Invalid email data: missing or invalid fields');
  }

  // Parse dates
  const createdAt = new Date(obj.createdAt);
  const expiresAt = new Date(obj.expiresAt);

  if (isNaN(createdAt.getTime()) || isNaN(expiresAt.getTime())) {
    throw new Error('Invalid email data: invalid date format');
  }

  return {
    id: obj.id,
    email: obj.email,
    createdAt,
    expiresAt,
    duration: obj.duration as TemporaryEmail['duration'],
    unreadCount: obj.unreadCount,
  };
}

/**
 * Saves a single email to localStorage
 * Handles QuotaExceededError by removing oldest emails
 * 
 * @param email - Email to save
 * @throws Error if unable to save after cleanup attempts
 */
export function saveEmail(email: TemporaryEmail): void {
  try {
    // Load existing emails
    const emails = loadEmails();

    // Add new email
    emails.push(email);

    // Try to save
    const serialized = emails.map(serializeEmail);
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(serialized));
  } catch (error) {
    // Check if it's a QuotaExceededError
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.code === 22)
    ) {
      // Try to make space by removing oldest email
      const emails = loadEmails();

      if (emails.length === 0) {
        throw new Error('Storage quota exceeded and no emails to remove');
      }

      // Sort by createdAt and remove oldest
      emails.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      emails.shift();

      // Add new email
      emails.push(email);

      // Try to save again
      try {
        const serialized = emails.map(serializeEmail);
        localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(serialized));
      } catch (retryError) {
        throw new Error('Storage quota exceeded: unable to save email');
      }
    } else {
      throw error;
    }
  }
}

/**
 * Removes an email from localStorage by ID
 * 
 * @param emailId - ID of email to remove
 */
export function removeEmail(emailId: string): void {
  try {
    const emails = loadEmails();
    const filtered = emails.filter((e) => e.id !== emailId);
    const serialized = filtered.map(serializeEmail);
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(serialized));
  } catch (error) {
    throw new Error(`Failed to remove email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Loads all emails from localStorage
 * Handles corrupted data gracefully
 * 
 * @returns Array of TemporaryEmail objects
 */
export function loadEmails(): TemporaryEmail[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EMAILS);

    // Return empty array if nothing stored
    if (!stored) {
      return [];
    }

    // Parse JSON
    const parsed = JSON.parse(stored);

    // Validate it's an array
    if (!Array.isArray(parsed)) {
      console.warn('Invalid emails data in localStorage: not an array');
      return [];
    }

    // Deserialize each email
    const emails: TemporaryEmail[] = [];
    for (const item of parsed) {
      try {
        emails.push(deserializeEmail(item));
      } catch (error) {
        console.warn(`Skipping invalid email entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return emails;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.warn('Corrupted emails data in localStorage, returning empty array');
      return [];
    }
    throw error;
  }
}

/**
 * Removes expired emails from localStorage
 * Runs on app load and periodically (every 5 minutes)
 * 
 * @returns Number of emails removed
 */
export function cleanupExpiredEmails(): number {
  try {
    const emails = loadEmails();
    const beforeCount = emails.length;

    // Filter out expired emails
    const active = emails.filter((email) => !isEmailExpired(email.expiresAt));

    // Only update if something changed
    if (active.length < beforeCount) {
      const serialized = active.map(serializeEmail);
      localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(serialized));
    }

    // Update last cleanup timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_CLEANUP, new Date().toISOString());

    return beforeCount - active.length;
  } catch (error) {
    console.error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return 0;
  }
}

/**
 * Storage key for message read status
 */
const MESSAGE_READ_STATUS_KEY = 'tempmail_message_read_status';

/**
 * Get read status for all messages
 * Returns a map of messageId -> isRead
 * 
 * @returns Map of message IDs to read status
 */
function getMessageReadStatus(): Record<string, boolean> {
  try {
    const stored = localStorage.getItem(MESSAGE_READ_STATUS_KEY);
    if (!stored) {
      return {};
    }
    const parsed = JSON.parse(stored);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.warn('Failed to load message read status:', error);
    return {};
  }
}

/**
 * Save read status for all messages
 * 
 * @param readStatus - Map of message IDs to read status
 */
function saveMessageReadStatus(readStatus: Record<string, boolean>): void {
  try {
    localStorage.setItem(MESSAGE_READ_STATUS_KEY, JSON.stringify(readStatus));
  } catch (error) {
    console.error('Failed to save message read status:', error);
  }
}

/**
 * Mark a message as read in localStorage
 * 
 * @param messageId - ID of message to mark as read
 */
export function markMessageAsRead(messageId: string): void {
  const readStatus = getMessageReadStatus();
  readStatus[messageId] = true;
  saveMessageReadStatus(readStatus);
}

/**
 * Check if a message is read
 * 
 * @param messageId - ID of message to check
 * @returns true if message is read, false otherwise
 */
export function isMessageRead(messageId: string): boolean {
  const readStatus = getMessageReadStatus();
  return readStatus[messageId] === true;
}

/**
 * Get read status for multiple messages
 * 
 * @param messageIds - Array of message IDs
 * @returns Map of message IDs to read status
 */
export function getMessagesReadStatus(messageIds: string[]): Record<string, boolean> {
  const allReadStatus = getMessageReadStatus();
  const result: Record<string, boolean> = {};
  
  for (const id of messageIds) {
    result[id] = allReadStatus[id] === true;
  }
  
  return result;
}

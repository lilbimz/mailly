// Utility and Validation Functions for TempMail Pro

import { Duration, DURATION_MS } from '@/types';

/**
 * Validates email ID format
 * Boomlify email IDs are UUIDs with dashes
 * 
 * @param id - Email ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmailId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // Must be alphanumeric with dashes (UUID format), non-empty, and max 100 characters
  return /^[a-zA-Z0-9-]+$/.test(id) && id.length > 0 && id.length <= 100;
}

/**
 * Validates duration option
 * 
 * @param duration - Duration string to validate
 * @returns true if valid duration option
 */
export function isValidDuration(duration: string): duration is Duration {
  return duration === '10min' || duration === '1hr' || duration === '1day';
}

/**
 * Calculates expiration timestamp based on duration
 * 
 * @param createdAt - Creation timestamp
 * @param duration - Duration option
 * @returns Expiration timestamp
 */
export function calculateExpirationTime(createdAt: Date, duration: Duration): Date {
  const createdTime = createdAt.getTime();
  const durationMs = DURATION_MS[duration];
  return new Date(createdTime + durationMs);
}

/**
 * Formats time remaining as HH:MM:SS
 * 
 * @param expiresAt - Expiration timestamp
 * @returns Formatted time string (HH:MM:SS) or "Expired"
 */
export function formatTimeRemaining(expiresAt: Date): string {
  const now = new Date().getTime();
  const expiresTime = expiresAt.getTime();
  const remainingMs = expiresTime - now;
  
  // If expired, return "Expired"
  if (remainingMs <= 0) {
    return 'Expired';
  }
  
  // Calculate hours, minutes, seconds
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // Format as HH:MM:SS
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Checks if an email has expired
 * 
 * @param expiresAt - Expiration timestamp
 * @returns true if expired, false otherwise
 */
export function isEmailExpired(expiresAt: Date): boolean {
  const now = new Date().getTime();
  const expiresTime = expiresAt.getTime();
  return now >= expiresTime;
}

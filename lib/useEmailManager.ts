'use client';

import { useState, useCallback, useEffect } from 'react';
import { TemporaryEmail, Duration } from '@/types';
import { emailApiClient } from './emailApiClient';
import { cleanupExpiredEmails, saveEmail, removeEmail, loadEmails } from './localStorage';
import { isEmailExpired } from './utils';

/**
 * Return type for useEmailManager hook
 */
export interface UseEmailManagerReturn {
  emails: TemporaryEmail[];
  activeEmail: TemporaryEmail | null;
  createEmail: (duration: Duration, domain?: string) => Promise<TemporaryEmail>;
  deleteEmail: (emailId: string) => Promise<void>;
  selectEmail: (emailId: string) => void;
  refreshEmails: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing temporary email addresses
 * Handles email creation, deletion, selection, and persistence
 * 
 * @returns Email management state and functions
 * 
 * @example
 * const { emails, activeEmail, createEmail, deleteEmail, selectEmail } = useEmailManager();
 * 
 * // Create a new email
 * await createEmail('1hr');
 * 
 * // Select an email
 * selectEmail(emails[0].id);
 * 
 * // Delete an email
 * await deleteEmail(emails[0].id);
 */
export function useEmailManager(): UseEmailManagerReturn {
  // Use regular useState and load from localStorage manually
  // This ensures proper Date deserialization via loadEmails()
  const [emails, setEmails] = useState<TemporaryEmail[]>([]);

  // Track active/selected email ID
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get active email object from ID
  const activeEmail = emails.find((e) => e.id === activeEmailId) || null;

  /**
   * Create a new temporary email address
   * Calls API, saves to localStorage, and sets as active
   */
  const createEmail = useCallback(
    async (duration: Duration, domain?: string): Promise<TemporaryEmail> => {
      setIsLoading(true);
      setError(null);

      try {
        // Call API to create email
        const newEmail = await emailApiClient.createEmail(duration, domain);

        // Add to emails array
        setEmails((prev) => [...prev, newEmail]);

        // Save to localStorage (handled by useLocalStorage, but also explicit save)
        saveEmail(newEmail);

        // Set as active email
        setActiveEmailId(newEmail.id);

        return newEmail;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create email';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setEmails]
  );

  /**
   * Delete a temporary email address
   * Calls API, removes from localStorage, and clears active if deleted
   */
  const deleteEmail = useCallback(
    async (emailId: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        // Call API to delete email
        await emailApiClient.deleteEmail(emailId);

        // Remove from emails array
        setEmails((prev) => prev.filter((e) => e.id !== emailId));

        // Remove from localStorage
        removeEmail(emailId);

        // Clear active email if it was deleted
        if (activeEmailId === emailId) {
          setActiveEmailId(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete email';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activeEmailId, setEmails]
  );

  /**
   * Select an email to make it active
   * Sets the active email ID for viewing inbox
   */
  const selectEmail = useCallback((emailId: string) => {
    setActiveEmailId(emailId);
    setError(null);
  }, []);

  /**
   * Refresh emails by removing expired ones
   * Runs cleanup and updates state
   */
  const refreshEmails = useCallback(() => {
    try {
      // Run cleanup to remove expired emails
      const removedCount = cleanupExpiredEmails();

      // Reload emails from localStorage
      const updatedEmails = loadEmails();
      setEmails(updatedEmails);

      // Clear active email if it was removed
      if (activeEmailId && !updatedEmails.find((e) => e.id === activeEmailId)) {
        setActiveEmailId(null);
      }

      // Log cleanup results
      if (removedCount > 0) {
        console.log(`Removed ${removedCount} expired email(s)`);
      }
    } catch (err) {
      console.error('Failed to refresh emails:', err);
      setError('Failed to refresh emails');
    }
  }, [activeEmailId, setEmails]);

  // Initialize: Load emails from localStorage and run cleanup on mount
  useEffect(() => {
    try {
      // Run cleanup to remove expired emails
      cleanupExpiredEmails();

      // Load emails from localStorage
      const loadedEmails = loadEmails();
      setEmails(loadedEmails);

      // If there's only one email, select it automatically
      if (loadedEmails.length === 1) {
        setActiveEmailId(loadedEmails[0].id);
      }
    } catch (err) {
      console.error('Failed to initialize emails:', err);
      setError('Failed to load emails');
    }
  }, []); // Only run on mount

  // Periodic cleanup: Remove expired emails every 5 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      refreshEmails();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [refreshEmails]);

  return {
    emails,
    activeEmail,
    createEmail,
    deleteEmail,
    selectEmail,
    refreshEmails,
    isLoading,
    error,
  };
}

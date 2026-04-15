'use client';

import { useState, useCallback, useEffect } from 'react';
import { TemporaryEmail, Duration, Message } from '@/types';
import { emailApiClient } from './emailApiClient';
import { cleanupExpiredEmails, saveEmail, removeEmail, loadEmails, getMessagesReadStatus } from './localStorage';
import { isEmailExpired } from './utils';
import { useNotifications } from './useNotifications';

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
  updateUnreadCount: (emailId: string, messages: Message[]) => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Storage key for active email ID
 */
const ACTIVE_EMAIL_KEY = 'mailly_active_email';

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

  // Get notification hook for permission request
  const { requestPermission, permission } = useNotifications();

  // Get active email object from ID
  const activeEmail = emails.find((e) => e.id === activeEmailId) || null;

  /**
   * Create a new temporary email address
   * Calls API, saves to localStorage, and sets as active
   * Requests notification permission on first email creation
   */
  const createEmail = useCallback(
    async (duration: Duration, domain?: string): Promise<TemporaryEmail> => {
      setIsLoading(true);
      setError(null);

      try {
        // Request notification permission on first email creation
        const isFirstEmail = emails.length === 0;
        if (isFirstEmail && permission === 'default') {
          await requestPermission();
        }

        // Call API to create email
        const newEmail = await emailApiClient.createEmail(duration, domain);

        // Add to emails array
        setEmails((prev) => [...prev, newEmail]);

        // Save to localStorage (handled by useLocalStorage, but also explicit save)
        saveEmail(newEmail);

        // Set as active email
        setActiveEmailId(newEmail.id);
        
        // Persist active email ID to localStorage
        localStorage.setItem(ACTIVE_EMAIL_KEY, newEmail.id);

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
    [emails.length, permission, requestPermission, setEmails]
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
          // Clear from localStorage
          localStorage.removeItem(ACTIVE_EMAIL_KEY);
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
   * Sets the active email ID for viewing inbox and persists to localStorage
   */
  const selectEmail = useCallback((emailId: string) => {
    setActiveEmailId(emailId);
    setError(null);
    
    // Persist active email ID to localStorage
    try {
      localStorage.setItem(ACTIVE_EMAIL_KEY, emailId);
    } catch (err) {
      console.error('Failed to save active email ID:', err);
    }
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
        // Clear from localStorage
        localStorage.removeItem(ACTIVE_EMAIL_KEY);
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

  /**
   * Update unread count for a specific email based on messages
   * Calculates unread count from message read status
   */
  const updateUnreadCount = useCallback((emailId: string, messages: Message[]) => {
    setEmails((prevEmails) => {
      return prevEmails.map((email) => {
        if (email.id === emailId) {
          // Count unread messages for this email
          const unreadCount = messages.filter(msg => !msg.isRead).length;
          return {
            ...email,
            unreadCount,
          };
        }
        return email;
      });
    });
  }, []);

  // Initialize: Load emails from localStorage and run cleanup on mount
  useEffect(() => {
    try {
      // Run cleanup to remove expired emails
      cleanupExpiredEmails();

      // Load emails from localStorage
      const loadedEmails = loadEmails();
      setEmails(loadedEmails);

      // Restore previously selected email from localStorage
      const savedActiveEmailId = localStorage.getItem(ACTIVE_EMAIL_KEY);
      
      if (savedActiveEmailId && loadedEmails.some(e => e.id === savedActiveEmailId)) {
        // Restore the previously selected email if it still exists
        setActiveEmailId(savedActiveEmailId);
      } else if (loadedEmails.length === 1) {
        // If there's only one email, select it automatically
        setActiveEmailId(loadedEmails[0].id);
        // Persist to localStorage
        localStorage.setItem(ACTIVE_EMAIL_KEY, loadedEmails[0].id);
      } else if (savedActiveEmailId) {
        // Clear invalid active email ID from localStorage
        localStorage.removeItem(ACTIVE_EMAIL_KEY);
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
    updateUnreadCount,
    isLoading,
    error,
  };
}

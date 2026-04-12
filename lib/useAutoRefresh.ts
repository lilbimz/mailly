'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/types';
import { emailApiClient } from '@/lib/emailApiClient';

/**
 * Custom hook for auto-refreshing inbox messages at regular intervals
 * Polls for new messages and detects changes without blocking the UI
 * 
 * @param emailId - The temporary email ID to poll (null to stop polling)
 * @param interval - Polling interval in milliseconds (default: 15000ms = 15 seconds)
 * @returns Object containing messages array, isRefreshing flag, and error
 * 
 * @example
 * const { messages, isRefreshing, error } = useAutoRefresh(activeEmailId, 15000);
 */
export function useAutoRefresh(
  emailId: string | null,
  interval: number = 15000
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to track interval and previous messages for comparison
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousMessagesRef = useRef<Message[]>([]);

  /**
   * Fetch messages from the API and update state
   * Handles errors silently to continue polling on next interval
   */
  const fetchMessages = useCallback(async () => {
    if (!emailId) {
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      const fetchedMessages = await emailApiClient.getMessages(emailId);
      
      // Compare with previous messages to detect changes
      const hasChanges = 
        fetchedMessages.length !== previousMessagesRef.current.length ||
        fetchedMessages.some((msg, index) => 
          msg.id !== previousMessagesRef.current[index]?.id
        );

      if (hasChanges) {
        setMessages(fetchedMessages);
        previousMessagesRef.current = fetchedMessages;
      }
    } catch (err) {
      // Handle errors silently - continue polling on next interval
      // Only update error state for debugging purposes
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.warn('Auto-refresh error (will retry on next interval):', error.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [emailId]);

  // Set up polling when emailId is provided
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset state when emailId changes
    if (!emailId) {
      setMessages([]);
      setIsRefreshing(false);
      setError(null);
      previousMessagesRef.current = [];
      return;
    }

    // Fetch immediately on mount or when emailId changes
    fetchMessages();

    // Start polling at specified interval
    intervalRef.current = setInterval(() => {
      fetchMessages();
    }, interval);

    // Cleanup function to clear interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [emailId, interval, fetchMessages]);

  return {
    messages,
    isRefreshing,
    error,
  };
}

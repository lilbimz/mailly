'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from '@/types';
import { emailApiClient } from '@/lib/emailApiClient';
import { getMessagesReadStatus } from '@/lib/localStorage';
import { useNotifications } from '@/lib/useNotifications';

/**
 * Custom hook for auto-refreshing inbox messages at regular intervals
 * Polls for new messages and detects changes without blocking the UI
 * Sends browser notifications for new messages
 * 
 * @param emailId - The temporary email ID to poll (null to stop polling)
 * @param interval - Polling interval in milliseconds (default: 15000ms = 15 seconds)
 * @param onNewMessage - Optional callback when new message is detected (for focusing tab)
 * @returns Object containing messages array, isRefreshing flag, and error
 * 
 * @example
 * const { messages, isRefreshing, error } = useAutoRefresh(activeEmailId, 15000, handleNewMessage);
 */
export function useAutoRefresh(
  emailId: string | null,
  interval: number = 15000,
  onNewMessage?: (message: Message) => void
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to track interval and previous messages for comparison
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousMessagesRef = useRef<Message[]>([]);
  const hasInitialFetchRef = useRef(false);
  const lastEmailIdRef = useRef<string | null>(null);

  // Get notification hook
  const { sendNotification, permission } = useNotifications();

  /**
   * Fetch messages from the API and update state
   * Handles errors silently to continue polling on next interval
   * Detects new messages and sends notifications
   */
  const fetchMessages = useCallback(async () => {
    if (!emailId) {
      return;
    }

    setIsRefreshing(true);

    try {
      const fetchedMessages = await emailApiClient.getMessages(emailId);
      
      // Clear error on successful fetch
      setError(null);
      
      // Apply read status from localStorage
      const messageIds = fetchedMessages.map(m => m.id);
      const readStatus = getMessagesReadStatus(messageIds);
      const messagesWithReadStatus = fetchedMessages.map(msg => ({
        ...msg,
        isRead: readStatus[msg.id] || false,
      }));
      
      // Compare with previous messages to detect new ones
      const previousMessageIds = new Set(previousMessagesRef.current.map(m => m.id));
      const newMessages = messagesWithReadStatus.filter(msg => !previousMessageIds.has(msg.id));

      // Send notifications for new messages
      if (newMessages.length > 0 && permission === 'granted') {
        newMessages.forEach(msg => {
          sendNotification(
            `New email from ${msg.from}`,
            msg.subject || '(No subject)',
            () => {
              // Focus window and call callback when notification is clicked
              window.focus();
              if (onNewMessage) {
                onNewMessage(msg);
              }
            }
          );
        });
      }
      
      // Compare with previous messages to detect changes
      const hasChanges = 
        messagesWithReadStatus.length !== previousMessagesRef.current.length ||
        messagesWithReadStatus.some((msg, index) => 
          msg.id !== previousMessagesRef.current[index]?.id
        );

      if (hasChanges) {
        setMessages(messagesWithReadStatus);
        previousMessagesRef.current = messagesWithReadStatus;
      } else {
        // No changes - keep the same reference to avoid unnecessary re-renders
        previousMessagesRef.current = messagesWithReadStatus;
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
  }, [emailId, permission, sendNotification, onNewMessage]);

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
      lastEmailIdRef.current = null;
      return;
    }

    // Fetch immediately when emailId changes (not on every render)
    if (lastEmailIdRef.current !== emailId) {
      lastEmailIdRef.current = emailId;
      fetchMessages();
    }

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

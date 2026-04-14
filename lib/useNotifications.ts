'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing browser notification permissions and sending
 * Handles permission requests and notification sending with graceful degradation
 * 
 * @returns Object containing permission status and notification functions
 * 
 * @example
 * const { permission, requestPermission, sendNotification } = useNotifications();
 * await requestPermission();
 * sendNotification('New Email', 'You have a new message from sender@example.com', () => {
 *   window.focus();
 * });
 */
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check current notification permission on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    setPermission(Notification.permission);
  }, []);

  /**
   * Request notification permission from the user
   * Updates permission state after user responds
   */
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications are not supported in this browser');
      return;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }, []);

  /**
   * Send a browser notification with title and body
   * Handles permission denied gracefully by doing nothing
   * 
   * @param title - Notification title
   * @param body - Notification body text
   * @param onClick - Optional callback when notification is clicked
   */
  const sendNotification = useCallback((title: string, body: string, onClick?: () => void) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Gracefully handle permission denied - do nothing
    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, { body });
      
      // Handle notification click if callback provided
      if (onClick) {
        notification.onclick = () => {
          onClick();
          notification.close();
        };
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification,
  };
}

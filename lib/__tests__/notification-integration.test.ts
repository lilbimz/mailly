import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmailManager } from '../useEmailManager';
import { useAutoRefresh } from '../useAutoRefresh';
import { useNotifications } from '../useNotifications';
import { emailApiClient } from '../emailApiClient';
import { Message, TemporaryEmail } from '@/types';

// Mock dependencies
jest.mock('../emailApiClient');
jest.mock('../localStorage', () => ({
  cleanupExpiredEmails: jest.fn(() => 0),
  saveEmail: jest.fn(),
  removeEmail: jest.fn(),
  loadEmails: jest.fn(() => []),
  getMessagesReadStatus: jest.fn(() => ({})),
  markMessageAsRead: jest.fn(),
}));

describe('Notification Integration Tests', () => {
  let mockNotification: jest.Mock;
  let originalNotification: any;

  const mockEmail: TemporaryEmail = {
    id: 'email123',
    email: 'test@temp.mail',
    createdAt: new Date('2024-01-01T12:00:00Z'),
    expiresAt: new Date('2024-01-01T13:00:00Z'),
    duration: '1hr',
    unreadCount: 0,
  };

  const mockMessage: Message = {
    id: 'msg1',
    emailId: 'email123',
    from: 'sender@example.com',
    subject: 'Test Subject',
    receivedAt: new Date('2024-01-01T12:05:00Z'),
    preview: 'Test preview',
    body: 'Test body',
    isHtml: false,
    isRead: false,
  };

  beforeEach(() => {
    // Save original Notification
    originalNotification = global.Notification;

    // Create mock Notification constructor
    mockNotification = jest.fn();
    mockNotification.permission = 'default';
    mockNotification.requestPermission = jest.fn();

    // Replace global Notification
    global.Notification = mockNotification as any;

    // Mock localStorage
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore original Notification
    global.Notification = originalNotification;
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Permission request on first email creation', () => {
    it('should request notification permission when creating first email', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('granted');

      const mockCreateEmail = emailApiClient.createEmail as jest.MockedFunction<
        typeof emailApiClient.createEmail
      >;
      mockCreateEmail.mockResolvedValue(mockEmail);

      const { result } = renderHook(() => useEmailManager());

      // Create first email
      await act(async () => {
        await result.current.createEmail('1hr');
      });

      // Should have requested permission
      expect(mockNotification.requestPermission).toHaveBeenCalled();
    });

    it('should not request permission if already granted', async () => {
      mockNotification.permission = 'granted';
      mockNotification.requestPermission.mockResolvedValue('granted');

      const mockCreateEmail = emailApiClient.createEmail as jest.MockedFunction<
        typeof emailApiClient.createEmail
      >;
      mockCreateEmail.mockResolvedValue(mockEmail);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.createEmail('1hr');
      });

      // Should not request permission if already granted
      expect(mockNotification.requestPermission).not.toHaveBeenCalled();
    });

    it('should not request permission on subsequent email creations', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('granted');

      const mockCreateEmail = emailApiClient.createEmail as jest.MockedFunction<
        typeof emailApiClient.createEmail
      >;
      mockCreateEmail.mockResolvedValue(mockEmail);

      const { result, rerender } = renderHook(() => useEmailManager());

      // Create first email
      await act(async () => {
        await result.current.createEmail('1hr');
      });

      expect(mockNotification.requestPermission).toHaveBeenCalledTimes(1);

      // Clear mock
      mockNotification.requestPermission.mockClear();

      // Create second email
      const secondEmail = { ...mockEmail, id: 'email456', email: 'test2@temp.mail' };
      mockCreateEmail.mockResolvedValue(secondEmail);

      await act(async () => {
        await result.current.createEmail('1hr');
      });

      // Should not request permission again
      expect(mockNotification.requestPermission).not.toHaveBeenCalled();
    });

    it('should handle permission denial gracefully', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('denied');

      const mockCreateEmail = emailApiClient.createEmail as jest.MockedFunction<
        typeof emailApiClient.createEmail
      >;
      mockCreateEmail.mockResolvedValue(mockEmail);

      const { result } = renderHook(() => useEmailManager());

      // Should not throw error
      await act(async () => {
        await result.current.createEmail('1hr');
      });

      expect(result.current.emails).toHaveLength(1);
    });
  });

  describe('Notification sent when new message detected', () => {
    it('should send notification when new message is detected', async () => {
      mockNotification.permission = 'granted';

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      // First call returns empty
      mockGetMessages.mockResolvedValueOnce([]);
      // Second call returns new message
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      // Advance time to trigger next poll
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      // Wait for second fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      // Should have sent notification
      expect(mockNotification).toHaveBeenCalledWith(
        'New email from sender@example.com',
        { body: 'Test Subject' }
      );
    });

    it('should not send notification if permission is denied', async () => {
      mockNotification.permission = 'denied';

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      // Should not have sent notification
      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('should not send notification if permission is default', async () => {
      mockNotification.permission = 'default';

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      // Should not have sent notification
      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('should send multiple notifications for multiple new messages', async () => {
      mockNotification.permission = 'granted';

      const message2: Message = {
        ...mockMessage,
        id: 'msg2',
        from: 'sender2@example.com',
        subject: 'Second Subject',
      };

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage, message2]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      // Should have sent two notifications
      expect(mockNotification).toHaveBeenCalledTimes(2);
      expect(mockNotification).toHaveBeenNthCalledWith(1, 'New email from sender@example.com', {
        body: 'Test Subject',
      });
      expect(mockNotification).toHaveBeenNthCalledWith(2, 'New email from sender2@example.com', {
        body: 'Second Subject',
      });
    });

    it('should not send notification for existing messages', async () => {
      mockNotification.permission = 'granted';

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      // Both calls return same message
      mockGetMessages.mockResolvedValue([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      // Clear notification mock
      mockNotification.mockClear();

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      // Should not have sent notification for existing message
      expect(mockNotification).not.toHaveBeenCalled();
    });
  });

  describe('Notification content (sender and subject)', () => {
    it('should include sender in notification title', async () => {
      mockNotification.permission = 'granted';

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockNotification).toHaveBeenCalledWith(
          expect.stringContaining('sender@example.com'),
          expect.any(Object)
        );
      });
    });

    it('should include subject in notification body', async () => {
      mockNotification.permission = 'granted';

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockNotification).toHaveBeenCalledWith(
          expect.any(String),
          { body: 'Test Subject' }
        );
      });
    });

    it('should handle empty subject gracefully', async () => {
      mockNotification.permission = 'granted';

      const messageWithoutSubject: Message = {
        ...mockMessage,
        subject: '',
      };

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([messageWithoutSubject]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockNotification).toHaveBeenCalledWith(
          expect.any(String),
          { body: '(No subject)' }
        );
      });
    });

    it('should handle special characters in sender and subject', async () => {
      mockNotification.permission = 'granted';

      const messageWithSpecialChars: Message = {
        ...mockMessage,
        from: 'sender+test@example.com',
        subject: 'Test <Subject> & "Quotes"',
      };

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([messageWithSpecialChars]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockNotification).toHaveBeenCalledWith(
          'New email from sender+test@example.com',
          { body: 'Test <Subject> & "Quotes"' }
        );
      });
    });
  });

  describe('Notification click focuses tab and shows message', () => {
    it('should focus window when notification is clicked', async () => {
      mockNotification.permission = 'granted';

      const mockFocus = jest.fn();
      global.window.focus = mockFocus;

      let capturedOnClick: (() => void) | null = null;
      mockNotification.mockImplementation((title: string, options: any) => {
        return {
          onclick: null,
          close: jest.fn(),
          set onclick(handler: () => void) {
            capturedOnClick = handler;
          },
          get onclick() {
            return capturedOnClick;
          },
        };
      });

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockNotification).toHaveBeenCalled();
      });

      // Simulate notification click
      if (capturedOnClick) {
        capturedOnClick();
      }

      // Should have focused window
      expect(mockFocus).toHaveBeenCalled();
    });

    it('should call onNewMessage callback when notification is clicked', async () => {
      mockNotification.permission = 'granted';

      const mockFocus = jest.fn();
      global.window.focus = mockFocus;

      const onNewMessage = jest.fn();

      let capturedOnClick: (() => void) | null = null;
      mockNotification.mockImplementation((title: string, options: any) => {
        return {
          onclick: null,
          close: jest.fn(),
          set onclick(handler: () => void) {
            capturedOnClick = handler;
          },
          get onclick() {
            return capturedOnClick;
          },
        };
      });

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000, onNewMessage));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockNotification).toHaveBeenCalled();
      });

      // Simulate notification click
      if (capturedOnClick) {
        capturedOnClick();
      }

      // Should have called callback with message
      expect(onNewMessage).toHaveBeenCalledWith(mockMessage);
    });

    it('should close notification after click', async () => {
      mockNotification.permission = 'granted';

      const mockClose = jest.fn();
      mockNotification.mockImplementation(() => ({
        onclick: null,
        close: mockClose,
      }));

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockNotification).toHaveBeenCalled();
      });

      // Get the notification instance
      const notificationInstance = mockNotification.mock.results[0].value;

      // Simulate notification click
      if (notificationInstance && notificationInstance.onclick) {
        notificationInstance.onclick();
      }

      // Should have closed notification
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('Graceful degradation when permission denied', () => {
    it('should continue to work normally when permission is denied', async () => {
      mockNotification.permission = 'denied';

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      // Should have received message even without notification
      expect(result.current.messages[0]).toEqual(mockMessage);
    });

    it('should continue polling after permission denial', async () => {
      mockNotification.permission = 'denied';

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValue([mockMessage]);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      // Advance multiple intervals
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(3);
      });
    });

    it('should handle notification API not available', async () => {
      // Remove Notification from window
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      // Should still work without notifications
      expect(result.current.messages[0]).toEqual(mockMessage);

      global.Notification = originalNotification;
    });

    it('should handle notification errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockNotification.permission = 'granted';
      mockNotification.mockImplementation(() => {
        throw new Error('Notification failed');
      });

      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      mockGetMessages.mockResolvedValueOnce([]);
      mockGetMessages.mockResolvedValueOnce([mockMessage]);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
      });

      // Should have logged error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error sending notification:',
        expect.any(Error)
      );

      // Should still have received message
      expect(result.current.messages[0]).toEqual(mockMessage);

      consoleErrorSpy.mockRestore();
    });
  });
});

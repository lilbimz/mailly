import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifications } from '../useNotifications';

describe('useNotifications', () => {
  let mockNotification: jest.Mock;
  let originalNotification: any;

  beforeEach(() => {
    // Save original Notification
    originalNotification = global.Notification;

    // Create mock Notification constructor
    mockNotification = jest.fn();
    mockNotification.permission = 'default';
    mockNotification.requestPermission = jest.fn();

    // Replace global Notification
    global.Notification = mockNotification as any;
  });

  afterEach(() => {
    // Restore original Notification
    global.Notification = originalNotification;
    jest.clearAllMocks();
  });

  describe('permission status checking', () => {
    it('should return default permission status on mount', () => {
      mockNotification.permission = 'default';

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe('default');
    });

    it('should return granted permission status when already granted', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe('granted');
    });

    it('should return denied permission status when denied', () => {
      mockNotification.permission = 'denied';

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe('denied');
    });

    it('should check permission on mount', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe('granted');
    });

    it('should handle missing Notification API gracefully', () => {
      // Remove Notification from window
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;

      const { result } = renderHook(() => useNotifications());

      // Should still return default permission
      expect(result.current.permission).toBe('default');

      // Restore Notification
      global.Notification = originalNotification;
    });
  });

  describe('permission request handling', () => {
    it('should request permission when called', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('granted');

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(mockNotification.requestPermission).toHaveBeenCalled();
    });

    it('should update permission state after successful request', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('granted');

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.permission).toBe('granted');
      });
    });

    it('should update permission state when user denies', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('denied');

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.permission).toBe('denied');
      });
    });

    it('should not request permission if already granted', async () => {
      mockNotification.permission = 'granted';
      mockNotification.requestPermission.mockResolvedValue('granted');

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.requestPermission();
      });

      // Should not call requestPermission if already granted
      expect(mockNotification.requestPermission).not.toHaveBeenCalled();
      expect(result.current.permission).toBe('granted');
    });

    it('should handle permission request errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockRejectedValue(new Error('Permission request failed'));

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error requesting notification permission:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing Notification API when requesting permission', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Remove Notification from window
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;

      const { result } = renderHook(() => useNotifications());

      await act(async () => {
        await result.current.requestPermission();
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Notifications are not supported in this browser'
      );

      consoleWarnSpy.mockRestore();
      global.Notification = originalNotification;
    });

    it('should handle multiple permission requests', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission
        .mockResolvedValueOnce('default')
        .mockResolvedValueOnce('granted');

      const { result } = renderHook(() => useNotifications());

      // First request - user dismisses
      await act(async () => {
        await result.current.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.permission).toBe('default');
      });

      // Second request - user grants
      await act(async () => {
        await result.current.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.permission).toBe('granted');
      });

      expect(mockNotification.requestPermission).toHaveBeenCalledTimes(2);
    });
  });

  describe('notification sending', () => {
    it('should send notification when permission is granted', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.sendNotification('Test Title', 'Test Body');
      });

      expect(mockNotification).toHaveBeenCalledWith('Test Title', { body: 'Test Body' });
    });

    it('should not send notification when permission is denied', () => {
      mockNotification.permission = 'denied';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.sendNotification('Test Title', 'Test Body');
      });

      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('should not send notification when permission is default', () => {
      mockNotification.permission = 'default';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.sendNotification('Test Title', 'Test Body');
      });

      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('should send notification with correct title and body', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.sendNotification('New Email', 'You have a new message');
      });

      expect(mockNotification).toHaveBeenCalledWith('New Email', {
        body: 'You have a new message',
      });
    });

    it('should handle notification errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockNotification.permission = 'granted';
      mockNotification.mockImplementation(() => {
        throw new Error('Notification failed');
      });

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.sendNotification('Test Title', 'Test Body');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error sending notification:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle missing Notification API when sending', () => {
      // Remove Notification from window
      const originalNotification = global.Notification;
      // @ts-ignore
      delete global.Notification;

      const { result } = renderHook(() => useNotifications());

      // Should not throw error
      act(() => {
        result.current.sendNotification('Test Title', 'Test Body');
      });

      // No error should be thrown
      expect(true).toBe(true);

      global.Notification = originalNotification;
    });

    it('should send multiple notifications', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.sendNotification('Title 1', 'Body 1');
        result.current.sendNotification('Title 2', 'Body 2');
        result.current.sendNotification('Title 3', 'Body 3');
      });

      expect(mockNotification).toHaveBeenCalledTimes(3);
      expect(mockNotification).toHaveBeenNthCalledWith(1, 'Title 1', { body: 'Body 1' });
      expect(mockNotification).toHaveBeenNthCalledWith(2, 'Title 2', { body: 'Body 2' });
      expect(mockNotification).toHaveBeenNthCalledWith(3, 'Title 3', { body: 'Body 3' });
    });

    it('should handle empty title and body', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.sendNotification('', '');
      });

      expect(mockNotification).toHaveBeenCalledWith('', { body: '' });
    });

    it('should handle special characters in title and body', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.sendNotification(
          'Test <Title> & "Quotes"',
          'Body with special chars: @#$%^&*()'
        );
      });

      expect(mockNotification).toHaveBeenCalledWith('Test <Title> & "Quotes"', {
        body: 'Body with special chars: @#$%^&*()',
      });
    });

    it('should handle very long title and body', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      const longTitle = 'A'.repeat(1000);
      const longBody = 'B'.repeat(5000);

      act(() => {
        result.current.sendNotification(longTitle, longBody);
      });

      expect(mockNotification).toHaveBeenCalledWith(longTitle, { body: longBody });
    });
  });

  describe('graceful handling when permission denied', () => {
    it('should not throw error when sending notification with denied permission', () => {
      mockNotification.permission = 'denied';

      const { result } = renderHook(() => useNotifications());

      // Should not throw
      expect(() => {
        act(() => {
          result.current.sendNotification('Test', 'Test');
        });
      }).not.toThrow();
    });

    it('should continue to work after permission is denied', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('denied');

      const { result } = renderHook(() => useNotifications());

      // Request permission and get denied
      await act(async () => {
        await result.current.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.permission).toBe('denied');
      });

      // Try to send notification - should not throw
      act(() => {
        result.current.sendNotification('Test', 'Test');
      });

      expect(mockNotification).not.toHaveBeenCalled();
    });

    it('should allow requesting permission again after denial', async () => {
      mockNotification.permission = 'denied';
      mockNotification.requestPermission.mockResolvedValue('denied');

      const { result } = renderHook(() => useNotifications());

      // Try to request permission even though denied
      await act(async () => {
        await result.current.requestPermission();
      });

      expect(mockNotification.requestPermission).toHaveBeenCalled();
    });

    it('should handle permission change from denied to granted', async () => {
      mockNotification.permission = 'denied';

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe('denied');

      // Simulate user changing permission in browser settings
      mockNotification.permission = 'granted';
      mockNotification.requestPermission.mockResolvedValue('granted');

      await act(async () => {
        await result.current.requestPermission();
      });

      await waitFor(() => {
        expect(result.current.permission).toBe('granted');
      });

      // Now should be able to send notifications
      act(() => {
        result.current.sendNotification('Test', 'Test');
      });

      expect(mockNotification).toHaveBeenCalled();
    });
  });

  describe('return values and functions', () => {
    it('should return permission status', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      expect(result.current).toHaveProperty('permission');
      expect(result.current.permission).toBe('granted');
    });

    it('should return requestPermission function', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current).toHaveProperty('requestPermission');
      expect(typeof result.current.requestPermission).toBe('function');
    });

    it('should return sendNotification function', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current).toHaveProperty('sendNotification');
      expect(typeof result.current.sendNotification).toBe('function');
    });

    it('should maintain stable function references', () => {
      const { result, rerender } = renderHook(() => useNotifications());

      const firstRequestPermission = result.current.requestPermission;
      const firstSendNotification = result.current.sendNotification;

      rerender();

      expect(result.current.requestPermission).toBe(firstRequestPermission);
      expect(result.current.sendNotification).toBe(firstSendNotification);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid permission requests', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValue('granted');

      const { result } = renderHook(() => useNotifications());

      // Make multiple rapid requests
      await act(async () => {
        await Promise.all([
          result.current.requestPermission(),
          result.current.requestPermission(),
          result.current.requestPermission(),
        ]);
      });

      // Should handle gracefully
      expect(result.current.permission).toBe('granted');
    });

    it('should handle rapid notification sends', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      // Send many notifications rapidly
      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.sendNotification(`Title ${i}`, `Body ${i}`);
        }
      });

      expect(mockNotification).toHaveBeenCalledTimes(100);
    });

    it('should handle unmount during permission request', async () => {
      mockNotification.permission = 'default';
      
      let resolvePermission: (value: NotificationPermission) => void;
      const permissionPromise = new Promise<NotificationPermission>((resolve) => {
        resolvePermission = resolve;
      });
      mockNotification.requestPermission.mockReturnValue(permissionPromise);

      const { result, unmount } = renderHook(() => useNotifications());

      // Start permission request
      act(() => {
        result.current.requestPermission();
      });

      // Unmount before promise resolves
      unmount();

      // Resolve promise after unmount
      await act(async () => {
        resolvePermission!('granted');
      });

      // Should not cause errors
      expect(true).toBe(true);
    });

    it('should handle server-side rendering', () => {
      // Simulate SSR by making window undefined
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const { result } = renderHook(() => useNotifications());

      expect(result.current.permission).toBe('default');
      expect(typeof result.current.requestPermission).toBe('function');
      expect(typeof result.current.sendNotification).toBe('function');

      // Restore window
      global.window = originalWindow;
    });

    it('should handle notification with undefined body', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        // @ts-ignore - testing runtime behavior
        result.current.sendNotification('Title', undefined);
      });

      expect(mockNotification).toHaveBeenCalledWith('Title', { body: undefined });
    });

    it('should handle notification with null title', () => {
      mockNotification.permission = 'granted';

      const { result } = renderHook(() => useNotifications());

      act(() => {
        // @ts-ignore - testing runtime behavior
        result.current.sendNotification(null, 'Body');
      });

      expect(mockNotification).toHaveBeenCalledWith(null, { body: 'Body' });
    });
  });
});

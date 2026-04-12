import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoRefresh } from '../useAutoRefresh';
import { emailApiClient } from '../emailApiClient';
import { Message } from '@/types';

// Mock the emailApiClient
jest.mock('../emailApiClient', () => ({
  emailApiClient: {
    getMessages: jest.fn(),
  },
}));

describe('useAutoRefresh', () => {
  const mockMessages: Message[] = [
    {
      id: 'msg1',
      emailId: 'email123',
      from: 'sender1@example.com',
      subject: 'Test Message 1',
      receivedAt: new Date('2024-01-01T12:00:00Z'),
      preview: 'This is a test message',
      body: 'This is a test message body',
      isHtml: false,
      isRead: false,
    },
    {
      id: 'msg2',
      emailId: 'email123',
      from: 'sender2@example.com',
      subject: 'Test Message 2',
      receivedAt: new Date('2024-01-01T11:00:00Z'),
      preview: 'Another test message',
      body: 'Another test message body',
      isHtml: false,
      isRead: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('polling starts when emailId provided', () => {
    it('should fetch messages immediately when emailId is provided', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledWith('email123');
      });
    });

    it('should start polling at specified interval', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      renderHook(() => useAutoRefresh('email123', 15000));

      // Initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Advance time by 15 seconds
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      // Advance another 15 seconds
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(3);
      });
    });

    it('should use custom interval when provided', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      renderHook(() => useAutoRefresh('email123', 5000));

      // Initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Advance time by 5 seconds (custom interval)
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });
    });

    it('should set isRefreshing to true during fetch', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      // Create a promise that we can control
      let resolvePromise: (value: Message[]) => void;
      const promise = new Promise<Message[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetMessages.mockReturnValue(promise);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      // Wait for the fetch to start
      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolvePromise!(mockMessages);
      });

      // Wait for isRefreshing to become false
      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });
    });
  });

  describe('polling stops when emailId is null', () => {
    it('should not fetch messages when emailId is null', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      renderHook(() => useAutoRefresh(null, 15000));

      // Advance time
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockGetMessages).not.toHaveBeenCalled();
    });

    it('should stop polling when emailId changes to null', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { rerender } = renderHook(
        ({ emailId }) => useAutoRefresh(emailId, 15000),
        { initialProps: { emailId: 'email123' } }
      );

      // Initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Change emailId to null
      rerender({ emailId: null });

      // Clear the mock to reset call count
      mockGetMessages.mockClear();

      // Advance time - should not fetch anymore
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockGetMessages).not.toHaveBeenCalled();
    });

    it('should clear messages when emailId becomes null', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { result, rerender } = renderHook(
        ({ emailId }) => useAutoRefresh(emailId, 15000),
        { initialProps: { emailId: 'email123' } }
      );

      // Wait for messages to be fetched
      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      // Change emailId to null
      rerender({ emailId: null });

      // Messages should be cleared
      expect(result.current.messages).toEqual([]);
    });

    it('should reset isRefreshing when emailId becomes null', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { result, rerender } = renderHook(
        ({ emailId }) => useAutoRefresh(emailId, 15000),
        { initialProps: { emailId: 'email123' } }
      );

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalled();
      });

      // Change emailId to null
      rerender({ emailId: null });

      expect(result.current.isRefreshing).toBe(false);
    });

    it('should reset error when emailId becomes null', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockRejectedValue(new Error('API Error'));

      const { result, rerender } = renderHook(
        ({ emailId }) => useAutoRefresh(emailId, 15000),
        { initialProps: { emailId: 'email123' } }
      );

      // Wait for error to be set
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Change emailId to null
      rerender({ emailId: null });

      expect(result.current.error).toBeNull();
    });
  });

  describe('message fetching at correct interval', () => {
    it('should fetch messages at default 15 second interval', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      renderHook(() => useAutoRefresh('email123'));

      // Initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Advance by default interval (15000ms)
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });
    });

    it('should fetch messages multiple times at correct intervals', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      renderHook(() => useAutoRefresh('email123', 10000));

      // Initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // First interval
      await act(async () => {
        jest.advanceTimersByTime(10000);
      });
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      // Second interval
      await act(async () => {
        jest.advanceTimersByTime(10000);
      });
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(3);
      });

      // Third interval
      await act(async () => {
        jest.advanceTimersByTime(10000);
      });
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(4);
      });
    });

    it('should restart polling when interval changes', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { rerender } = renderHook(
        ({ interval }) => useAutoRefresh('email123', interval),
        { initialProps: { interval: 15000 } }
      );

      // Initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Change interval
      rerender({ interval: 5000 });

      // Should fetch immediately on interval change
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      // Advance by new interval
      await act(async () => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('new message detection', () => {
    it('should update messages when new messages are detected', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      // Wait for initial messages
      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      // Add a new message
      const newMessages: Message[] = [
        {
          id: 'msg3',
          emailId: 'email123',
          from: 'sender3@example.com',
          subject: 'New Message',
          receivedAt: new Date('2024-01-01T13:00:00Z'),
          preview: 'New message preview',
          body: 'New message body',
          isHtml: false,
          isRead: false,
        },
        ...mockMessages,
      ];
      mockGetMessages.mockResolvedValue(newMessages);

      // Advance time to trigger next poll
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      // Should detect new message
      await waitFor(() => {
        expect(result.current.messages.length).toBe(3);
        expect(result.current.messages[0].id).toBe('msg3');
      });
    });

    it('should detect when message count changes', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      // Return fewer messages
      mockGetMessages.mockResolvedValue([mockMessages[0]]);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(result.current.messages.length).toBe(1);
      });
    });

    it('should detect when message IDs change', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(result.current.messages[0].id).toBe('msg1');
      });

      // Return messages with different IDs
      const differentMessages: Message[] = [
        {
          ...mockMessages[0],
          id: 'msg1-updated',
        },
        mockMessages[1],
      ];
      mockGetMessages.mockResolvedValue(differentMessages);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      await waitFor(() => {
        expect(result.current.messages[0].id).toBe('msg1-updated');
      });
    });

    it('should not update state when messages are unchanged', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(result.current.messages.length).toBe(2);
      });

      const firstMessagesReference = result.current.messages;

      // Return same messages
      mockGetMessages.mockResolvedValue(mockMessages);

      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      // Messages reference should remain the same (no state update)
      await waitFor(() => {
        expect(result.current.messages).toBe(firstMessagesReference);
      });
    });
  });

  describe('error handling (silent failure)', () => {
    it('should handle API errors silently', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockRejectedValue(new Error('API Error'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Auto-refresh error'),
        expect.any(String)
      );

      consoleWarnSpy.mockRestore();
    });

    it('should continue polling after error', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      // First call fails
      mockGetMessages.mockRejectedValueOnce(new Error('API Error'));
      // Second call succeeds
      mockGetMessages.mockResolvedValueOnce(mockMessages);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      renderHook(() => useAutoRefresh('email123', 15000));

      // Wait for first call to fail
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Advance time to trigger next poll
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      // Should have called again despite previous error
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });

      consoleWarnSpy.mockRestore();
    });

    it('should set error state when fetch fails', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      const testError = new Error('Network error');
      mockGetMessages.mockRejectedValue(testError);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(result.current.error).toEqual(testError);
      });

      consoleWarnSpy.mockRestore();
    });

    it('should clear error on successful fetch after failure', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      // First call fails
      mockGetMessages.mockRejectedValueOnce(new Error('API Error'));
      // Second call succeeds
      mockGetMessages.mockResolvedValueOnce(mockMessages);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      // Wait for error to be set
      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      // Advance time to trigger next poll
      await act(async () => {
        jest.advanceTimersByTime(15000);
      });

      // Error should be cleared
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      consoleWarnSpy.mockRestore();
    });

    it('should set isRefreshing to false after error', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockRejectedValue(new Error('API Error'));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
      });

      expect(result.current.isRefreshing).toBe(false);

      consoleWarnSpy.mockRestore();
    });

    it('should handle non-Error objects thrown by API', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockRejectedValue('String error');

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(result.current.error).not.toBeNull();
        expect(result.current.error?.message).toBe('Unknown error occurred');
      });

      consoleWarnSpy.mockRestore();
    });
  });

  describe('cleanup on unmount', () => {
    it('should clear interval on unmount', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { unmount } = renderHook(() => useAutoRefresh('email123', 15000));

      // Wait for initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Unmount
      unmount();

      // Clear mock to reset call count
      mockGetMessages.mockClear();

      // Advance time - should not fetch anymore
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      expect(mockGetMessages).not.toHaveBeenCalled();
    });

    it('should not update state after unmount', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      
      let resolvePromise: (value: Message[]) => void;
      const promise = new Promise<Message[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetMessages.mockReturnValue(promise);

      const { unmount } = renderHook(() => useAutoRefresh('email123', 15000));

      // Unmount before promise resolves
      unmount();

      // Resolve promise after unmount - should not cause errors
      await act(async () => {
        resolvePromise!(mockMessages);
      });

      // No errors should be thrown
      expect(true).toBe(true);
    });

    it('should handle rapid mount/unmount cycles', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { unmount: unmount1 } = renderHook(() => useAutoRefresh('email123', 15000));
      unmount1();

      const { unmount: unmount2 } = renderHook(() => useAutoRefresh('email123', 15000));
      unmount2();

      const { unmount: unmount3 } = renderHook(() => useAutoRefresh('email123', 15000));
      unmount3();

      // Should not throw any errors
      await act(async () => {
        jest.advanceTimersByTime(30000);
      });

      expect(true).toBe(true);
    });

    it('should cleanup when emailId changes', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const { rerender } = renderHook(
        ({ emailId }) => useAutoRefresh(emailId, 15000),
        { initialProps: { emailId: 'email123' } }
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledWith('email123');
      });

      // Change emailId
      rerender({ emailId: 'email456' });

      // Should fetch with new emailId
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledWith('email456');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty message array', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue([]);

      const { result } = renderHook(() => useAutoRefresh('email123', 15000));

      await waitFor(() => {
        expect(result.current.messages).toEqual([]);
      });
    });

    it('should handle very short intervals', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      renderHook(() => useAutoRefresh('email123', 100));

      // Initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Advance by short interval
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle very long intervals', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      renderHook(() => useAutoRefresh('email123', 60000));

      // Initial fetch
      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(1);
      });

      // Advance by long interval
      await act(async () => {
        jest.advanceTimersByTime(60000);
      });

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledTimes(2);
      });
    });

    it('should handle emailId with special characters', async () => {
      const mockGetMessages = emailApiClient.getMessages as jest.MockedFunction<
        typeof emailApiClient.getMessages
      >;
      mockGetMessages.mockResolvedValue(mockMessages);

      const specialEmailId = 'email-123_test@special';
      renderHook(() => useAutoRefresh(specialEmailId, 15000));

      await waitFor(() => {
        expect(mockGetMessages).toHaveBeenCalledWith(specialEmailId);
      });
    });
  });
});

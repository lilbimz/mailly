import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmailManager } from '../useEmailManager';
import { emailApiClient } from '../emailApiClient';
import * as localStorageModule from '../localStorage';
import { mockTemporaryEmail, mockTemporaryEmails } from './fixtures';
import { TemporaryEmail } from '@/types';

// Mock dependencies
jest.mock('../emailApiClient');
jest.mock('../localStorage');

describe('useEmailManager', () => {
  // Mock functions
  const mockSaveEmail = jest.fn();
  const mockRemoveEmail = jest.fn();
  const mockLoadEmails = jest.fn();
  const mockCleanupExpiredEmails = jest.fn();
  const mockGetMessagesReadStatus = jest.fn();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    localStorage.clear();

    // Setup localStorage mocks
    (localStorageModule.saveEmail as jest.Mock) = mockSaveEmail;
    (localStorageModule.removeEmail as jest.Mock) = mockRemoveEmail;
    (localStorageModule.loadEmails as jest.Mock) = mockLoadEmails;
    (localStorageModule.cleanupExpiredEmails as jest.Mock) = mockCleanupExpiredEmails;
    (localStorageModule.getMessagesReadStatus as jest.Mock) = mockGetMessagesReadStatus;

    // Default mock implementations
    mockLoadEmails.mockReturnValue([]);
    mockCleanupExpiredEmails.mockReturnValue(0);
    mockGetMessagesReadStatus.mockReturnValue({});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty emails array', () => {
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      expect(result.current.emails).toEqual([]);
      expect(result.current.activeEmail).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load emails from localStorage on mount', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      expect(mockLoadEmails).toHaveBeenCalled();
      expect(result.current.emails).toEqual(mockTemporaryEmails);
    });

    it('should run cleanup on mount', () => {
      mockLoadEmails.mockReturnValue([]);

      renderHook(() => useEmailManager());

      expect(mockCleanupExpiredEmails).toHaveBeenCalled();
    });

    it('should auto-select email when only one exists', () => {
      mockLoadEmails.mockReturnValue([mockTemporaryEmail]);

      const { result } = renderHook(() => useEmailManager());

      expect(result.current.activeEmail).toEqual(mockTemporaryEmail);
    });

    it('should not auto-select when multiple emails exist', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      expect(result.current.activeEmail).toBeNull();
    });

    it('should restore previously selected email from localStorage', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);
      localStorage.setItem('tempmail_active_email', mockTemporaryEmails[1].id);

      const { result } = renderHook(() => useEmailManager());

      expect(result.current.activeEmail).toEqual(mockTemporaryEmails[1]);
    });

    it('should not restore active email if it no longer exists', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);
      localStorage.setItem('tempmail_active_email', 'non-existent-id');

      const { result } = renderHook(() => useEmailManager());

      expect(result.current.activeEmail).toBeNull();
      expect(localStorage.getItem('tempmail_active_email')).toBeNull();
    });

    it('should prioritize restored email over auto-select', () => {
      mockLoadEmails.mockReturnValue([mockTemporaryEmail]);
      localStorage.setItem('tempmail_active_email', mockTemporaryEmail.id);

      const { result } = renderHook(() => useEmailManager());

      expect(result.current.activeEmail).toEqual(mockTemporaryEmail);
    });

    it('should handle initialization errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLoadEmails.mockImplementation(() => {
        throw new Error('Failed to load');
      });

      const { result } = renderHook(() => useEmailManager());

      expect(result.current.error).toBe('Failed to load emails');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createEmail', () => {
    it('should create email and add to state', async () => {
      const newEmail: TemporaryEmail = {
        ...mockTemporaryEmail,
        id: 'new-email-123',
        email: 'new@temp.mail',
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(newEmail);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.createEmail('1hr');
      });

      expect(emailApiClient.createEmail).toHaveBeenCalledWith('1hr', undefined);
      expect(result.current.emails).toContainEqual(newEmail);
    });

    it('should save email to localStorage', async () => {
      const newEmail: TemporaryEmail = {
        ...mockTemporaryEmail,
        id: 'new-email-123',
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(newEmail);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.createEmail('1hr');
      });

      expect(mockSaveEmail).toHaveBeenCalledWith(newEmail);
    });

    it('should set created email as active', async () => {
      const newEmail: TemporaryEmail = {
        ...mockTemporaryEmail,
        id: 'new-email-123',
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(newEmail);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.createEmail('1hr');
      });

      expect(result.current.activeEmail).toEqual(newEmail);
    });

    it('should set loading state during creation', async () => {
      const newEmail: TemporaryEmail = mockTemporaryEmail;

      (emailApiClient.createEmail as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(newEmail), 100))
      );
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      let loadingDuringCall = false;

      act(() => {
        result.current.createEmail('1hr').then(() => {
          // Check loading state after promise resolves
        });
      });

      // Check loading state immediately after calling
      await waitFor(() => {
        if (result.current.isLoading) {
          loadingDuringCall = true;
        }
      });

      expect(loadingDuringCall).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear loading state after creation completes', async () => {
      const newEmail: TemporaryEmail = mockTemporaryEmail;

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(newEmail);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.createEmail('1hr');
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      (emailApiClient.createEmail as jest.Mock).mockRejectedValue(error);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        try {
          await result.current.createEmail('1hr');
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('API Error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      (emailApiClient.createEmail as jest.Mock).mockRejectedValue('String error');
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        try {
          await result.current.createEmail('1hr');
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to create email');
    });

    it('should add email to existing emails', async () => {
      const existingEmail = mockTemporaryEmails[0];
      const newEmail: TemporaryEmail = {
        ...mockTemporaryEmail,
        id: 'new-email-456',
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(newEmail);
      mockLoadEmails.mockReturnValue([existingEmail]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.createEmail('1hr');
      });

      expect(result.current.emails).toHaveLength(2);
      expect(result.current.emails).toContainEqual(existingEmail);
      expect(result.current.emails).toContainEqual(newEmail);
    });

    it('should return created email', async () => {
      const newEmail: TemporaryEmail = mockTemporaryEmail;

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(newEmail);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      let returnedEmail: TemporaryEmail | undefined;

      await act(async () => {
        returnedEmail = await result.current.createEmail('1hr');
      });

      expect(returnedEmail).toEqual(newEmail);
    });
  });

  describe('deleteEmail', () => {
    it('should delete email and remove from state', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      const emailToDelete = mockTemporaryEmails[0];

      await act(async () => {
        await result.current.deleteEmail(emailToDelete.id);
      });

      expect(emailApiClient.deleteEmail).toHaveBeenCalledWith(emailToDelete.id);
      expect(result.current.emails).not.toContainEqual(emailToDelete);
    });

    it('should remove email from localStorage', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      const emailToDelete = mockTemporaryEmails[0];

      await act(async () => {
        await result.current.deleteEmail(emailToDelete.id);
      });

      expect(mockRemoveEmail).toHaveBeenCalledWith(emailToDelete.id);
    });

    it('should clear active email if deleted', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockLoadEmails.mockReturnValue([mockTemporaryEmail]);

      const { result } = renderHook(() => useEmailManager());

      // Active email is auto-selected since there's only one
      expect(result.current.activeEmail).toEqual(mockTemporaryEmail);

      await act(async () => {
        await result.current.deleteEmail(mockTemporaryEmail.id);
      });

      expect(result.current.activeEmail).toBeNull();
    });

    it('should clear active email from localStorage when deleted', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockLoadEmails.mockReturnValue([mockTemporaryEmail]);

      const { result } = renderHook(() => useEmailManager());

      // Active email is auto-selected and saved to localStorage
      expect(localStorage.getItem('tempmail_active_email')).toBe(mockTemporaryEmail.id);

      await act(async () => {
        await result.current.deleteEmail(mockTemporaryEmail.id);
      });

      expect(localStorage.getItem('tempmail_active_email')).toBeNull();
    });

    it('should not clear active email if different email deleted', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      // Select first email
      act(() => {
        result.current.selectEmail(mockTemporaryEmails[0].id);
      });

      // Delete second email
      await act(async () => {
        await result.current.deleteEmail(mockTemporaryEmails[1].id);
      });

      expect(result.current.activeEmail).toEqual(mockTemporaryEmails[0]);
    });

    it('should set loading state during deletion', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      let loadingDuringCall = false;

      act(() => {
        result.current.deleteEmail(mockTemporaryEmails[0].id).then(() => {
          // Check loading state after promise resolves
        });
      });

      // Check loading state immediately after calling
      await waitFor(() => {
        if (result.current.isLoading) {
          loadingDuringCall = true;
        }
      });

      expect(loadingDuringCall).toBe(true);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should clear loading state after deletion completes', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.deleteEmail(mockTemporaryEmails[0].id);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle API errors', async () => {
      const error = new Error('Delete failed');
      (emailApiClient.deleteEmail as jest.Mock).mockRejectedValue(error);
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        try {
          await result.current.deleteEmail(mockTemporaryEmails[0].id);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Delete failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockRejectedValue('String error');
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        try {
          await result.current.deleteEmail(mockTemporaryEmails[0].id);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to delete email');
    });

    it('should not modify state if API call fails', async () => {
      const error = new Error('Delete failed');
      (emailApiClient.deleteEmail as jest.Mock).mockRejectedValue(error);
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      const initialEmails = [...result.current.emails];

      await act(async () => {
        try {
          await result.current.deleteEmail(mockTemporaryEmails[0].id);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.emails).toEqual(initialEmails);
    });
  });

  describe('selectEmail', () => {
    it('should set active email by ID', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.selectEmail(mockTemporaryEmails[1].id);
      });

      expect(result.current.activeEmail).toEqual(mockTemporaryEmails[1]);
    });

    it('should persist active email ID to localStorage', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.selectEmail(mockTemporaryEmails[1].id);
      });

      expect(localStorage.getItem('tempmail_active_email')).toBe(mockTemporaryEmails[1].id);
    });

    it('should clear error when selecting email', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      // Set an error
      act(() => {
        (result.current as any).error = 'Some error';
      });

      act(() => {
        result.current.selectEmail(mockTemporaryEmails[0].id);
      });

      expect(result.current.error).toBeNull();
    });

    it('should return null for non-existent email ID', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.selectEmail('non-existent-id');
      });

      expect(result.current.activeEmail).toBeNull();
    });

    it('should allow switching between emails', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.selectEmail(mockTemporaryEmails[0].id);
      });

      expect(result.current.activeEmail).toEqual(mockTemporaryEmails[0]);

      act(() => {
        result.current.selectEmail(mockTemporaryEmails[1].id);
      });

      expect(result.current.activeEmail).toEqual(mockTemporaryEmails[1]);
    });
  });

  describe('refreshEmails', () => {
    it('should run cleanup and reload emails', () => {
      const updatedEmails = [mockTemporaryEmails[0]];
      mockLoadEmails
        .mockReturnValueOnce(mockTemporaryEmails)
        .mockReturnValueOnce(updatedEmails);
      mockCleanupExpiredEmails.mockReturnValue(2);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.refreshEmails();
      });

      expect(mockCleanupExpiredEmails).toHaveBeenCalled();
      expect(mockLoadEmails).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
      expect(result.current.emails).toEqual(updatedEmails);
    });

    it('should clear active email if it was removed', () => {
      const updatedEmails = [mockTemporaryEmails[1]];
      mockLoadEmails
        .mockReturnValueOnce(mockTemporaryEmails)
        .mockReturnValueOnce(updatedEmails);
      mockCleanupExpiredEmails.mockReturnValue(1);

      const { result } = renderHook(() => useEmailManager());

      // Select first email
      act(() => {
        result.current.selectEmail(mockTemporaryEmails[0].id);
      });

      expect(result.current.activeEmail).toEqual(mockTemporaryEmails[0]);

      // Refresh (first email is removed)
      act(() => {
        result.current.refreshEmails();
      });

      expect(result.current.activeEmail).toBeNull();
    });

    it('should clear active email from localStorage when removed during refresh', () => {
      const updatedEmails = [mockTemporaryEmails[1]];
      mockLoadEmails
        .mockReturnValueOnce(mockTemporaryEmails)
        .mockReturnValueOnce(updatedEmails);
      mockCleanupExpiredEmails.mockReturnValue(1);

      const { result } = renderHook(() => useEmailManager());

      // Select first email
      act(() => {
        result.current.selectEmail(mockTemporaryEmails[0].id);
      });

      expect(localStorage.getItem('tempmail_active_email')).toBe(mockTemporaryEmails[0].id);

      // Refresh (first email is removed)
      act(() => {
        result.current.refreshEmails();
      });

      expect(localStorage.getItem('tempmail_active_email')).toBeNull();
    });

    it('should keep active email if it still exists', () => {
      const updatedEmails = [mockTemporaryEmails[0]];
      mockLoadEmails
        .mockReturnValueOnce(mockTemporaryEmails)
        .mockReturnValueOnce(updatedEmails);
      mockCleanupExpiredEmails.mockReturnValue(2);

      const { result } = renderHook(() => useEmailManager());

      // Select first email
      act(() => {
        result.current.selectEmail(mockTemporaryEmails[0].id);
      });

      // Refresh (first email still exists)
      act(() => {
        result.current.refreshEmails();
      });

      expect(result.current.activeEmail).toEqual(mockTemporaryEmails[0]);
    });

    it('should log cleanup results', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);
      mockCleanupExpiredEmails.mockReturnValue(3);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.refreshEmails();
      });

      expect(consoleLogSpy).toHaveBeenCalledWith('Removed 3 expired email(s)');

      consoleLogSpy.mockRestore();
    });

    it('should not log when no emails removed', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);
      mockCleanupExpiredEmails.mockReturnValue(0);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.refreshEmails();
      });

      expect(consoleLogSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should handle refresh errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLoadEmails.mockReturnValueOnce(mockTemporaryEmails);
      mockCleanupExpiredEmails.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.refreshEmails();
      });

      expect(result.current.error).toBe('Failed to refresh emails');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('periodic cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should run cleanup every 5 minutes', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);
      mockCleanupExpiredEmails.mockReturnValue(0);

      renderHook(() => useEmailManager());

      // Initial cleanup on mount
      expect(mockCleanupExpiredEmails).toHaveBeenCalledTimes(1);

      // Fast-forward 5 minutes
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockCleanupExpiredEmails).toHaveBeenCalledTimes(2);

      // Fast-forward another 5 minutes
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockCleanupExpiredEmails).toHaveBeenCalledTimes(3);
    });

    it('should cleanup interval on unmount', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { unmount } = renderHook(() => useEmailManager());

      unmount();

      // Fast-forward time after unmount
      act(() => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });

      // Should only have been called once (on mount)
      expect(mockCleanupExpiredEmails).toHaveBeenCalledTimes(1);
    });
  });

  describe('localStorage sync', () => {
    it('should sync emails with localStorage on create', async () => {
      const newEmail: TemporaryEmail = mockTemporaryEmail;

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(newEmail);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.createEmail('1hr');
      });

      // Should save to localStorage
      expect(mockSaveEmail).toHaveBeenCalledWith(newEmail);
    });

    it('should sync emails with localStorage on delete', async () => {
      (emailApiClient.deleteEmail as jest.Mock).mockResolvedValue(undefined);
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        await result.current.deleteEmail(mockTemporaryEmails[0].id);
      });

      // Should remove from localStorage
      expect(mockRemoveEmail).toHaveBeenCalledWith(mockTemporaryEmails[0].id);
    });

    it('should load emails from localStorage on mount', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      expect(mockLoadEmails).toHaveBeenCalled();
      expect(result.current.emails).toEqual(mockTemporaryEmails);
    });

    it('should reload emails from localStorage on refresh', () => {
      const updatedEmails = [mockTemporaryEmails[0]];
      mockLoadEmails
        .mockReturnValueOnce(mockTemporaryEmails)
        .mockReturnValueOnce(updatedEmails);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.refreshEmails();
      });

      expect(mockLoadEmails).toHaveBeenCalledTimes(2);
      expect(result.current.emails).toEqual(updatedEmails);
    });
  });

  describe('error handling', () => {
    it('should set error state on create failure', async () => {
      const error = new Error('Network error');
      (emailApiClient.createEmail as jest.Mock).mockRejectedValue(error);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        try {
          await result.current.createEmail('1hr');
        } catch (err) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should set error state on delete failure', async () => {
      const error = new Error('Delete error');
      (emailApiClient.deleteEmail as jest.Mock).mockRejectedValue(error);
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      await act(async () => {
        try {
          await result.current.deleteEmail(mockTemporaryEmails[0].id);
        } catch (err) {
          // Expected
        }
      });

      expect(result.current.error).toBe('Delete error');
    });

    it('should clear error on successful operation', async () => {
      const newEmail: TemporaryEmail = mockTemporaryEmail;

      (emailApiClient.createEmail as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(newEmail);
      mockLoadEmails.mockReturnValue([]);

      const { result } = renderHook(() => useEmailManager());

      // First call fails
      await act(async () => {
        try {
          await result.current.createEmail('1hr');
        } catch (err) {
          // Expected
        }
      });

      expect(result.current.error).toBe('First error');

      // Second call succeeds
      await act(async () => {
        await result.current.createEmail('1hr');
      });

      expect(result.current.error).toBeNull();
    });

    it('should clear error on selectEmail', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      // Manually set error (simulating previous error)
      act(() => {
        (result.current as any).error = 'Previous error';
      });

      act(() => {
        result.current.selectEmail(mockTemporaryEmails[0].id);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('updateUnreadCount', () => {
    it('should update unread count for specific email', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      const messages = [
        { id: 'msg1', isRead: false } as any,
        { id: 'msg2', isRead: false } as any,
        { id: 'msg3', isRead: true } as any,
      ];

      act(() => {
        result.current.updateUnreadCount(mockTemporaryEmails[0].id, messages);
      });

      const updatedEmail = result.current.emails.find(e => e.id === mockTemporaryEmails[0].id);
      expect(updatedEmail?.unreadCount).toBe(2);
    });

    it('should calculate unread count correctly', () => {
      mockLoadEmails.mockReturnValue([mockTemporaryEmail]);

      const { result } = renderHook(() => useEmailManager());

      const allReadMessages = [
        { id: 'msg1', isRead: true } as any,
        { id: 'msg2', isRead: true } as any,
      ];

      act(() => {
        result.current.updateUnreadCount(mockTemporaryEmail.id, allReadMessages);
      });

      expect(result.current.emails[0].unreadCount).toBe(0);
    });

    it('should not affect other emails', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      const messages = [
        { id: 'msg1', isRead: false } as any,
      ];

      const otherEmailInitialCount = mockTemporaryEmails[1].unreadCount;

      act(() => {
        result.current.updateUnreadCount(mockTemporaryEmails[0].id, messages);
      });

      const otherEmail = result.current.emails.find(e => e.id === mockTemporaryEmails[1].id);
      expect(otherEmail?.unreadCount).toBe(otherEmailInitialCount);
    });

    it('should handle empty message array', () => {
      mockLoadEmails.mockReturnValue([mockTemporaryEmail]);

      const { result } = renderHook(() => useEmailManager());

      act(() => {
        result.current.updateUnreadCount(mockTemporaryEmail.id, []);
      });

      expect(result.current.emails[0].unreadCount).toBe(0);
    });

    it('should handle non-existent email ID gracefully', () => {
      mockLoadEmails.mockReturnValue(mockTemporaryEmails);

      const { result } = renderHook(() => useEmailManager());

      const initialEmails = [...result.current.emails];

      act(() => {
        result.current.updateUnreadCount('non-existent-id', []);
      });

      expect(result.current.emails).toEqual(initialEmails);
    });
  });
});

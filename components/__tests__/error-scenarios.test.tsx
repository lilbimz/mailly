/**
 * Comprehensive error scenario tests for Mailly
 * Tests error boundary, API errors, network errors, and localStorage quota exceeded
 * 
 * **Validates: Requirements R1.5, R2.4, R4.5, R6.5, R8.5**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';
import EmailCreator from '../EmailCreator';
import EmailList from '../EmailList';
import InboxViewer from '../InboxViewer';
import { MessageViewer } from '../MessageViewer';
import { CopyButton } from '../CopyButton';
import { useEmailManager } from '@/lib/useEmailManager';
import { useAutoRefresh } from '@/lib/useAutoRefresh';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { emailApiClient, ApiError } from '@/lib/emailApiClient';
import { TemporaryEmail, Message, ERROR_CODES } from '@/types';

// Mock console methods to avoid cluttering test output
const originalError = console.error;
const originalWarn = console.warn;
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock data
const mockEmail: TemporaryEmail = {
  id: 'test123',
  email: 'test@temp.mail',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  expiresAt: new Date('2024-01-01T13:00:00Z'),
  duration: '1hr',
  unreadCount: 0,
};

const mockMessage: Message = {
  id: 'msg123',
  emailId: 'test123',
  from: 'sender@example.com',
  subject: 'Test Subject',
  receivedAt: new Date('2024-01-01T12:05:00Z'),
  preview: 'Test preview',
  body: 'Test body',
  isHtml: false,
  isRead: false,
};

describe('Error Boundary Tests', () => {
  const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
    if (shouldThrow) {
      throw new Error('Component rendering error');
    }
    return <div>No error</div>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should catch rendering errors and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
  });

  it('should log error details when error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Error Boundary caught an error:',
      expect.any(Error)
    );
  });

  it('should have a clickable refresh button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();
    
    // Verify button is clickable (doesn't throw)
    expect(() => fireEvent.click(refreshButton)).not.toThrow();
  });
});

describe('API Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EmailCreator API Errors', () => {
    it('should display error message when email creation fails', async () => {
      const mockCreateEmail = jest.fn().mockRejectedValue(
        new ApiError(ERROR_CODES.API_ERROR, 'Failed to create email')
      );

      render(<EmailCreator onCreateEmail={mockCreateEmail} />);

      // Select duration and create email
      fireEvent.click(screen.getByText('1 hour'));
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create email')).toBeInTheDocument();
      });
    });

    it('should display rate limit error message', async () => {
      const mockCreateEmail = jest.fn().mockRejectedValue(
        new ApiError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests. Please wait a moment and try again.')
      );

      render(<EmailCreator onCreateEmail={mockCreateEmail} />);

      fireEvent.click(screen.getByText('1 hour'));
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });
    });

    it('should display generic error for unknown errors', async () => {
      const mockCreateEmail = jest.fn().mockRejectedValue(new Error('Unknown error'));

      render(<EmailCreator onCreateEmail={mockCreateEmail} />);

      fireEvent.click(screen.getByText('1 hour'));
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Unknown error')).toBeInTheDocument();
      });
    });
  });

  describe('EmailList API Errors', () => {
    it('should handle delete email errors gracefully', async () => {
      const mockDeleteEmail = jest.fn().mockRejectedValue(
        new ApiError(ERROR_CODES.API_ERROR, 'Failed to delete email')
      );

      render(
        <EmailList
          emails={[mockEmail]}
          activeEmailId={mockEmail.id}
          onEmailSelect={jest.fn()}
          onEmailDelete={mockDeleteEmail}
        />
      );

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete email');
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Failed to delete email:',
          expect.any(ApiError)
        );
      });
    });
  });
});

describe('Network Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle network timeout errors', async () => {
    const mockCreateEmail = jest.fn().mockRejectedValue(
      new ApiError(ERROR_CODES.NETWORK_ERROR, 'Request timeout. Please check your connection and try again.')
    );

    render(<EmailCreator onCreateEmail={mockCreateEmail} />);

    fireEvent.click(screen.getByText('1 hour'));
    fireEvent.click(screen.getByText('Create Email'));

    await waitFor(() => {
      expect(screen.getByText(/request timeout/i)).toBeInTheDocument();
    });
  });

  it('should handle network connection errors', async () => {
    const mockCreateEmail = jest.fn().mockRejectedValue(
      new ApiError(ERROR_CODES.NETWORK_ERROR, 'Network error. Please check your connection and try again.')
    );

    render(<EmailCreator onCreateEmail={mockCreateEmail} />);

    fireEvent.click(screen.getByText('1 hour'));
    fireEvent.click(screen.getByText('Create Email'));

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('should continue auto-refresh polling after network errors', async () => {
    jest.useFakeTimers();

    // Mock API to fail first, then succeed
    let callCount = 0;
    jest.spyOn(emailApiClient, 'getMessages').mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new ApiError(ERROR_CODES.NETWORK_ERROR, 'Network error'));
      }
      return Promise.resolve([mockMessage]);
    });

    const { result } = renderHook(() => useAutoRefresh('test123', 1000));

    // Wait for first call (should fail)
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(result.current.error).toBeTruthy();

    // Wait for second call (should succeed)
    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.error).toBeNull();

    jest.useRealTimers();
  });
});

describe('localStorage Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should handle localStorage quota exceeded error', () => {
    const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
    mockSetItem.mockImplementation(() => {
      const error: any = new Error('QuotaExceededError');
      error.code = 22;
      throw error;
    });

    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    // Should still update state even if localStorage fails
    expect(result.current[0]).toBe('new value');

    // Should log error (either quota exceeded or generic error)
    expect(console.error).toHaveBeenCalled();

    mockSetItem.mockRestore();
  });

  it('should handle corrupted localStorage data gracefully', () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('test_key', 'invalid json {');

    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));

    // Should return default value when data is corrupted
    expect(result.current[0]).toBe('default');

    // Should log warning
    expect(console.warn).toHaveBeenCalledWith(
      'Error reading localStorage key "test_key":',
      expect.any(Error)
    );
  });

  it('should handle localStorage write errors gracefully', () => {
    const mockSetItem = jest.spyOn(Storage.prototype, 'setItem');
    mockSetItem.mockImplementation(() => {
      throw new Error('Storage write error');
    });

    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    // Should still update state
    expect(result.current[0]).toBe('new value');

    // Should log error
    expect(console.error).toHaveBeenCalledWith(
      'Error setting localStorage key "test_key":',
      expect.any(Error)
    );

    mockSetItem.mockRestore();
  });

  it('should handle missing localStorage gracefully', () => {
    const originalLocalStorage = window.localStorage;
    
    // Remove localStorage
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
      writable: true,
    });

    const { result } = renderHook(() => useLocalStorage('test_key', 'default'));

    // Should return default value
    expect(result.current[0]).toBe('default');

    // Restore localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });
});

describe('Clipboard API Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display error when clipboard API is not supported', async () => {
    // Remove clipboard API
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    });

    render(<CopyButton text="test@temp.mail" />);

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/copy not supported/i)).toBeInTheDocument();
    });

    // Restore clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
    });
  });

  it('should display error when clipboard write fails', async () => {
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard write failed'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    render(<CopyButton text="test@temp.mail" />);

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Clipboard write failed')).toBeInTheDocument();
    });
  });

  it('should clear error message after 2 seconds', async () => {
    jest.useFakeTimers();

    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });

    render(<CopyButton text="test@temp.mail" />);

    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Clipboard error')).toBeInTheDocument();
    });

    // Fast-forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Clipboard error')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});

describe('Component Error State Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state during email creation', async () => {
    const mockCreateEmail = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<EmailCreator onCreateEmail={mockCreateEmail} />);

    fireEvent.click(screen.getByText('1 hour'));
    fireEvent.click(screen.getByText('Create Email'));

    expect(screen.getByText('Creating...')).toBeInTheDocument();
  });

  it('should disable buttons during loading state', async () => {
    const mockCreateEmail = jest.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    render(<EmailCreator onCreateEmail={mockCreateEmail} />);

    fireEvent.click(screen.getByText('1 hour'));
    const createButton = screen.getByText('Create Email');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createButton).toBeDisabled();
    });
  });

  it('should re-enable buttons after error', async () => {
    const mockCreateEmail = jest.fn().mockRejectedValue(new Error('API Error'));

    render(<EmailCreator onCreateEmail={mockCreateEmail} />);

    fireEvent.click(screen.getByText('1 hour'));
    const createButton = screen.getByText('Create Email');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });

    // Button should be enabled again
    expect(createButton).not.toBeDisabled();
  });
});

describe('Error Recovery Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow retry after failed email creation', async () => {
    let callCount = 0;
    const mockCreateEmail = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('First attempt failed'));
      }
      return Promise.resolve();
    });

    render(<EmailCreator onCreateEmail={mockCreateEmail} />);

    // First attempt
    fireEvent.click(screen.getByText('1 hour'));
    fireEvent.click(screen.getByText('Create Email'));

    await waitFor(() => {
      expect(screen.getByText('First attempt failed')).toBeInTheDocument();
    });

    // Retry
    fireEvent.click(screen.getByText('Create Email'));

    await waitFor(() => {
      expect(mockCreateEmail).toHaveBeenCalledTimes(2);
    });
  });

  it('should clear error message on successful retry', async () => {
    let callCount = 0;
    const mockCreateEmail = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(new Error('First attempt failed'));
      }
      return Promise.resolve();
    });

    render(<EmailCreator onCreateEmail={mockCreateEmail} />);

    // First attempt (fails)
    fireEvent.click(screen.getByText('1 hour'));
    fireEvent.click(screen.getByText('Create Email'));

    await waitFor(() => {
      expect(screen.getByText('First attempt failed')).toBeInTheDocument();
    });

    // Retry (succeeds)
    fireEvent.click(screen.getByText('Create Email'));

    await waitFor(() => {
      expect(screen.queryByText('First attempt failed')).not.toBeInTheDocument();
    });
  });
});

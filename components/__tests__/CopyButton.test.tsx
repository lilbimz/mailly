import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/__tests__/test-utils';
import { CopyButton } from '../CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('successful copy operation', () => {
    it('should copy text to clipboard when button is clicked', async () => {
      const testText = 'test@temp.mail';
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text={testText} />);

      const button = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(testText);
      });
    });

    it('should use custom label when provided', () => {
      render(<CopyButton text="test" label="Copy Email" />);
      expect(screen.getByRole('button', { name: /copy email/i })).toBeInTheDocument();
    });

    it('should use default label when not provided', () => {
      render(<CopyButton text="test" />);
      expect(screen.getByRole('button', { name: /^copy$/i })).toBeInTheDocument();
    });
  });

  describe('success feedback display', () => {
    it('should display success feedback after successful copy', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
      });
    });

    it('should display success feedback within 200ms', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      const startTime = Date.now();
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(200);
    });

    it('should clear success feedback after 2 seconds', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" label="Copy" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
      });

      // Fast-forward time by 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText('✓ Copied!')).not.toBeInTheDocument();
        expect(screen.getByText('Copy')).toBeInTheDocument();
      });
    });

    it('should disable button while showing success feedback', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should apply success styling when copied', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass('bg-green-500');
      });
    });
  });

  describe('error handling for copy failures', () => {
    it('should display error message when copy fails', async () => {
      const mockWriteText = jest.fn().mockRejectedValue(new Error('Copy failed'));
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('✗ Error')).toBeInTheDocument();
      });
    });

    it('should display detailed error message for Error instances', async () => {
      const mockWriteText = jest.fn().mockRejectedValue(new Error('Permission denied'));
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Permission denied')).toBeInTheDocument();
      });
    });

    it('should display generic error message for non-Error failures', async () => {
      const mockWriteText = jest.fn().mockRejectedValue('Unknown error');
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to copy to clipboard')).toBeInTheDocument();
      });
    });

    it('should clear error message after 2 seconds', async () => {
      const mockWriteText = jest.fn().mockRejectedValue(new Error('Copy failed'));
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" label="Copy" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copy failed')).toBeInTheDocument();
      });

      // Fast-forward time by 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText('Copy failed')).not.toBeInTheDocument();
      });
    });

    it('should disable button while showing error', async () => {
      const mockWriteText = jest.fn().mockRejectedValue(new Error('Copy failed'));
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it('should apply error styling when copy fails', async () => {
      const mockWriteText = jest.fn().mockRejectedValue(new Error('Copy failed'));
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass('bg-red-500');
      });
    });
  });

  describe('fallback for unsupported Clipboard API', () => {
    it('should display error when Clipboard API is not supported', async () => {
      // Remove clipboard API
      Object.assign(navigator, {
        clipboard: undefined,
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copy not supported in your browser')).toBeInTheDocument();
      });
    });

    it('should show error button state when Clipboard API is not supported', async () => {
      Object.assign(navigator, {
        clipboard: undefined,
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('✗ Error')).toBeInTheDocument();
      });
    });

    it('should not call writeText when Clipboard API is not supported', async () => {
      const mockWriteText = jest.fn();
      Object.assign(navigator, {
        clipboard: undefined,
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copy not supported in your browser')).toBeInTheDocument();
      });

      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it('should clear unsupported error after 2 seconds', async () => {
      Object.assign(navigator, {
        clipboard: undefined,
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copy not supported in your browser')).toBeInTheDocument();
      });

      // Fast-forward time by 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText('Copy not supported in your browser')).not.toBeInTheDocument();
      });
    });
  });

  describe('multiple copy attempts', () => {
    it('should handle multiple successful copy operations', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');

      // First copy
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
      });

      // Wait for feedback to clear
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(screen.queryByText('✓ Copied!')).not.toBeInTheDocument();
      });

      // Second copy
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
      });

      expect(mockWriteText).toHaveBeenCalledTimes(2);
    });

    it('should clear previous error before new copy attempt', async () => {
      const mockWriteText = jest
        .fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(undefined);

      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText,
        },
      });

      render(<CopyButton text="test@temp.mail" />);

      const button = screen.getByRole('button');

      // First copy (fails)
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Wait for error to clear
      jest.advanceTimersByTime(2000);
      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument();
      });

      // Second copy (succeeds)
      fireEvent.click(button);
      await waitFor(() => {
        expect(screen.getByText('✓ Copied!')).toBeInTheDocument();
      });
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });
});

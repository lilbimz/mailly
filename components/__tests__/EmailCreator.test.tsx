import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/__tests__/test-utils';
import EmailCreator from '../EmailCreator';
import { emailApiClient, ApiError } from '@/lib/emailApiClient';
import { TemporaryEmail } from '@/types';

// Mock the emailApiClient
jest.mock('@/lib/emailApiClient', () => ({
  emailApiClient: {
    createEmail: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public code: string, message: string, public status?: number) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

describe('EmailCreator', () => {
  const mockOnEmailCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering of duration options', () => {
    it('should render all three duration options', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      expect(screen.getByText('10 minutes')).toBeInTheDocument();
      expect(screen.getByText('1 hour')).toBeInTheDocument();
      expect(screen.getByText('1 day')).toBeInTheDocument();
    });

    it('should render duration options as buttons', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      const durationButtons = screen.getAllByRole('button').filter(
        (button) =>
          button.textContent === '10 minutes' ||
          button.textContent === '1 hour' ||
          button.textContent === '1 day'
      );

      expect(durationButtons).toHaveLength(3);
    });

    it('should have 1 hour selected by default', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      const oneHourButton = screen.getByText('1 hour');
      expect(oneHourButton).toHaveClass('bg-blue-600');
    });
  });

  describe('duration selection', () => {
    it('should select 10 minutes when clicked', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      const tenMinButton = screen.getByText('10 minutes');
      fireEvent.click(tenMinButton);

      expect(tenMinButton).toHaveClass('bg-blue-600');
    });

    it('should select 1 day when clicked', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      const oneDayButton = screen.getByText('1 day');
      fireEvent.click(oneDayButton);

      expect(oneDayButton).toHaveClass('bg-blue-600');
    });

    it('should deselect previous duration when new one is selected', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      const oneHourButton = screen.getByText('1 hour');
      const tenMinButton = screen.getByText('10 minutes');

      // 1 hour is selected by default
      expect(oneHourButton).toHaveClass('bg-blue-600');

      // Click 10 minutes
      fireEvent.click(tenMinButton);

      // 10 minutes should be selected, 1 hour should not
      expect(tenMinButton).toHaveClass('bg-blue-600');
      expect(oneHourButton).not.toHaveClass('bg-blue-600');
    });

    it('should allow switching between all duration options', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      const tenMinButton = screen.getByText('10 minutes');
      const oneHourButton = screen.getByText('1 hour');
      const oneDayButton = screen.getByText('1 day');

      // Switch to 10 minutes
      fireEvent.click(tenMinButton);
      expect(tenMinButton).toHaveClass('bg-blue-600');

      // Switch to 1 day
      fireEvent.click(oneDayButton);
      expect(oneDayButton).toHaveClass('bg-blue-600');
      expect(tenMinButton).not.toHaveClass('bg-blue-600');

      // Switch back to 1 hour
      fireEvent.click(oneHourButton);
      expect(oneHourButton).toHaveClass('bg-blue-600');
      expect(oneDayButton).not.toHaveClass('bg-blue-600');
    });
  });

  describe('API call on create button click', () => {
    it('should call createEmail API with selected duration', async () => {
      const mockEmail: TemporaryEmail = {
        id: 'test123',
        email: 'test@temp.mail',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        duration: '1hr',
        unreadCount: 0,
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(mockEmail);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      const createButton = screen.getByText('Create Email');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(emailApiClient.createEmail).toHaveBeenCalledWith('1hr');
      });
    });

    it('should call createEmail with 10min when 10 minutes is selected', async () => {
      const mockEmail: TemporaryEmail = {
        id: 'test123',
        email: 'test@temp.mail',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 600000),
        duration: '10min',
        unreadCount: 0,
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(mockEmail);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('10 minutes'));
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(emailApiClient.createEmail).toHaveBeenCalledWith('10min');
      });
    });

    it('should call createEmail with 1day when 1 day is selected', async () => {
      const mockEmail: TemporaryEmail = {
        id: 'test123',
        email: 'test@temp.mail',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        duration: '1day',
        unreadCount: 0,
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(mockEmail);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('1 day'));
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(emailApiClient.createEmail).toHaveBeenCalledWith('1day');
      });
    });

    it('should emit onEmailCreated event on successful creation', async () => {
      const mockEmail: TemporaryEmail = {
        id: 'test123',
        email: 'test@temp.mail',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        duration: '1hr',
        unreadCount: 0,
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(mockEmail);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(mockOnEmailCreated).toHaveBeenCalledWith(mockEmail);
      });
    });
  });

  describe('loading state display', () => {
    it('should display loading state during API call', async () => {
      (emailApiClient.createEmail as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    it('should show spinner icon during loading', async () => {
      (emailApiClient.createEmail as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      const spinner = screen.getByText('Creating...').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should disable create button during loading', async () => {
      (emailApiClient.createEmail as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      const createButton = screen.getByText('Create Email');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });

      const loadingButton = screen.getByText('Creating...').closest('button');
      expect(loadingButton).toBeDisabled();
    });

    it('should disable duration buttons during loading', async () => {
      (emailApiClient.createEmail as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });

      expect(screen.getByText('10 minutes')).toBeDisabled();
      expect(screen.getByText('1 hour')).toBeDisabled();
      expect(screen.getByText('1 day')).toBeDisabled();
    });

    it('should clear loading state after successful creation', async () => {
      const mockEmail: TemporaryEmail = {
        id: 'test123',
        email: 'test@temp.mail',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        duration: '1hr',
        unreadCount: 0,
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(mockEmail);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.queryByText('Creating...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Create Email')).toBeInTheDocument();
    });
  });

  describe('error message display on failure', () => {
    it('should display error message when API call fails with ApiError', async () => {
      const apiError = new ApiError('API_ERROR', 'Service temporarily unavailable');
      (emailApiClient.createEmail as jest.Mock).mockRejectedValue(apiError);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Service temporarily unavailable')).toBeInTheDocument();
      });
    });

    it('should display generic error message for non-ApiError failures', async () => {
      (emailApiClient.createEmail as jest.Mock).mockRejectedValue(new Error('Unknown error'));

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create email. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display error in styled error container', async () => {
      const apiError = new ApiError('RATE_LIMIT_EXCEEDED', 'Too many requests');
      (emailApiClient.createEmail as jest.Mock).mockRejectedValue(apiError);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        const errorMessage = screen.getByText('Too many requests');
        const errorContainer = errorMessage.closest('div');
        expect(errorContainer).toHaveClass('bg-red-50');
      });
    });

    it('should clear error message on successful retry', async () => {
      const apiError = new ApiError('NETWORK_ERROR', 'Network error');
      (emailApiClient.createEmail as jest.Mock)
        .mockRejectedValueOnce(apiError)
        .mockResolvedValueOnce({
          id: 'test123',
          email: 'test@temp.mail',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
          duration: '1hr',
          unreadCount: 0,
        });

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      // First attempt - fails
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Second attempt - succeeds
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.queryByText('Network error')).not.toBeInTheDocument();
      });
    });

    it('should not call onEmailCreated when creation fails', async () => {
      const apiError = new ApiError('API_ERROR', 'Creation failed');
      (emailApiClient.createEmail as jest.Mock).mockRejectedValue(apiError);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });

      expect(mockOnEmailCreated).not.toHaveBeenCalled();
    });

    it('should clear loading state after error', async () => {
      const apiError = new ApiError('API_ERROR', 'Creation failed');
      (emailApiClient.createEmail as jest.Mock).mockRejectedValue(apiError);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });

      expect(screen.queryByText('Creating...')).not.toBeInTheDocument();
      expect(screen.getByText('Create Email')).toBeInTheDocument();
    });
  });

  describe('onEmailCreated event emission', () => {
    it('should emit complete email object with all properties', async () => {
      const mockEmail: TemporaryEmail = {
        id: 'abc123',
        email: 'user@temp.mail',
        createdAt: new Date('2024-01-01T12:00:00Z'),
        expiresAt: new Date('2024-01-01T13:00:00Z'),
        duration: '1hr',
        unreadCount: 0,
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(mockEmail);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(mockOnEmailCreated).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'abc123',
            email: 'user@temp.mail',
            createdAt: expect.any(Date),
            expiresAt: expect.any(Date),
            duration: '1hr',
            unreadCount: 0,
          })
        );
      });
    });

    it('should emit event only once per successful creation', async () => {
      const mockEmail: TemporaryEmail = {
        id: 'test123',
        email: 'test@temp.mail',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        duration: '1hr',
        unreadCount: 0,
      };

      (emailApiClient.createEmail as jest.Mock).mockResolvedValue(mockEmail);

      render(<EmailCreator onEmailCreated={mockOnEmailCreated} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(mockOnEmailCreated).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('disabled prop behavior', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} disabled={true} />);

      expect(screen.getByText('10 minutes')).toBeDisabled();
      expect(screen.getByText('1 hour')).toBeDisabled();
      expect(screen.getByText('1 day')).toBeDisabled();
      expect(screen.getByText('Create Email')).toBeDisabled();
    });

    it('should not call API when create button clicked while disabled', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} disabled={true} />);

      fireEvent.click(screen.getByText('Create Email'));

      expect(emailApiClient.createEmail).not.toHaveBeenCalled();
    });

    it('should not allow duration selection when disabled', () => {
      render(<EmailCreator onEmailCreated={mockOnEmailCreated} disabled={true} />);

      const tenMinButton = screen.getByText('10 minutes');
      fireEvent.click(tenMinButton);

      // 1 hour should still be selected (default)
      expect(screen.getByText('1 hour')).toHaveClass('bg-blue-600');
      expect(tenMinButton).not.toHaveClass('bg-blue-600');
    });
  });
});

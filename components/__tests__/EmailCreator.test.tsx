import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/__tests__/test-utils';
import EmailCreator from '../EmailCreator';

describe('EmailCreator', () => {
  const mockOnCreateEmail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering of duration options', () => {
    it('should render all three duration options', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      expect(screen.getByText('10 minutes')).toBeInTheDocument();
      expect(screen.getByText('1 hour')).toBeInTheDocument();
      expect(screen.getByText('1 day')).toBeInTheDocument();
    });

    it('should render duration options as buttons', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      const durationButtons = screen.getAllByRole('button').filter(
        (button) =>
          button.textContent === '10 minutes' ||
          button.textContent === '1 hour' ||
          button.textContent === '1 day'
      );

      expect(durationButtons).toHaveLength(3);
    });

    it('should have 1 hour selected by default', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      const oneHourButton = screen.getByText('1 hour');
      expect(oneHourButton).toHaveClass('bg-blue-600');
    });
  });

  describe('duration selection', () => {
    it('should select 10 minutes when clicked', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      const tenMinButton = screen.getByText('10 minutes');
      fireEvent.click(tenMinButton);

      expect(tenMinButton).toHaveClass('bg-blue-600');
    });

    it('should select 1 day when clicked', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      const oneDayButton = screen.getByText('1 day');
      fireEvent.click(oneDayButton);

      expect(oneDayButton).toHaveClass('bg-blue-600');
    });

    it('should deselect previous duration when new one is selected', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

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
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

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

  describe('callback on create button click', () => {
    it('should call onCreateEmail with selected duration', async () => {
      mockOnCreateEmail.mockResolvedValue(undefined);

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      const createButton = screen.getByText('Create Email');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnCreateEmail).toHaveBeenCalledWith('1hr', 'nondon.store');
      });
    });

    it('should call onCreateEmail with 10min when 10 minutes is selected', async () => {
      mockOnCreateEmail.mockResolvedValue(undefined);

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('10 minutes'));
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(mockOnCreateEmail).toHaveBeenCalledWith('10min', 'nondon.store');
      });
    });

    it('should call onCreateEmail with 1day when 1 day is selected', async () => {
      mockOnCreateEmail.mockResolvedValue(undefined);

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('1 day'));
      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(mockOnCreateEmail).toHaveBeenCalledWith('1day', 'nondon.store');
      });
    });
  });

  describe('loading state display', () => {
    it('should display loading state during callback execution', async () => {
      mockOnCreateEmail.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('Create Email'));

      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    it('should show spinner icon during loading', async () => {
      mockOnCreateEmail.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('Create Email'));

      const spinner = screen.getByText('Creating...').querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should disable create button during loading', async () => {
      mockOnCreateEmail.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      const createButton = screen.getByText('Create Email');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });

      const loadingButton = screen.getByText('Creating...').closest('button');
      expect(loadingButton).toBeDisabled();
    });

    it('should disable duration buttons during loading', async () => {
      mockOnCreateEmail.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });

      expect(screen.getByText('10 minutes')).toBeDisabled();
      expect(screen.getByText('1 hour')).toBeDisabled();
      expect(screen.getByText('1 day')).toBeDisabled();
    });

    it('should clear loading state after successful creation', async () => {
      mockOnCreateEmail.mockResolvedValue(undefined);

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.queryByText('Creating...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Create Email')).toBeInTheDocument();
    });
  });

  describe('error message display on failure', () => {
    it('should display error message when callback fails', async () => {
      mockOnCreateEmail.mockRejectedValue(new Error('Service temporarily unavailable'));

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Service temporarily unavailable')).toBeInTheDocument();
      });
    });

    it('should display generic error message for unknown failures', async () => {
      mockOnCreateEmail.mockRejectedValue('Unknown error');

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create email. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display error in styled error container', async () => {
      mockOnCreateEmail.mockRejectedValue(new Error('Too many requests'));

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        const errorMessage = screen.getByText('Too many requests');
        const errorContainer = errorMessage.closest('div');
        expect(errorContainer).toHaveClass('bg-red-50');
      });
    });

    it('should clear error message on successful retry', async () => {
      mockOnCreateEmail
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

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

    it('should clear loading state after error', async () => {
      mockOnCreateEmail.mockRejectedValue(new Error('Creation failed'));

      render(<EmailCreator onCreateEmail={mockOnCreateEmail} />);

      fireEvent.click(screen.getByText('Create Email'));

      await waitFor(() => {
        expect(screen.getByText('Creation failed')).toBeInTheDocument();
      });

      expect(screen.queryByText('Creating...')).not.toBeInTheDocument();
      expect(screen.getByText('Create Email')).toBeInTheDocument();
    });
  });

  describe('disabled prop behavior', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} disabled={true} />);

      expect(screen.getByText('10 minutes')).toBeDisabled();
      expect(screen.getByText('1 hour')).toBeDisabled();
      expect(screen.getByText('1 day')).toBeDisabled();
      expect(screen.getByText('Create Email')).toBeDisabled();
    });

    it('should not call callback when create button clicked while disabled', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} disabled={true} />);

      fireEvent.click(screen.getByText('Create Email'));

      expect(mockOnCreateEmail).not.toHaveBeenCalled();
    });

    it('should not allow duration selection when disabled', () => {
      render(<EmailCreator onCreateEmail={mockOnCreateEmail} disabled={true} />);

      const tenMinButton = screen.getByText('10 minutes');
      fireEvent.click(tenMinButton);

      // 1 hour should still be selected (default)
      expect(screen.getByText('1 hour')).toHaveClass('bg-blue-600');
      expect(tenMinButton).not.toHaveClass('bg-blue-600');
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/lib/__tests__/test-utils';
import EmailList from '../EmailList';
import { TemporaryEmail } from '@/types';

// Mock CountdownTimer to avoid timer complexity in these tests
jest.mock('../CountdownTimer', () => {
  return function MockCountdownTimer({ expiresAt, onExpire }: any) {
    return <div data-testid="countdown-timer">01:00:00</div>;
  };
});

describe('EmailList', () => {
  const mockEmails: TemporaryEmail[] = [
    {
      id: 'email1',
      email: 'test1@temp.mail',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      expiresAt: new Date('2024-01-01T13:00:00Z'),
      duration: '1hr',
      unreadCount: 2,
    },
    {
      id: 'email2',
      email: 'test2@temp.mail',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      expiresAt: new Date('2024-01-01T13:00:00Z'),
      duration: '1hr',
      unreadCount: 0,
    },
    {
      id: 'email3',
      email: 'test3@temp.mail',
      createdAt: new Date('2024-01-01T12:00:00Z'),
      expiresAt: new Date('2024-01-01T13:00:00Z'),
      duration: '1hr',
      unreadCount: 5,
    },
  ];

  const mockOnEmailSelect = jest.fn();
  const mockOnEmailDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering email list', () => {
    it('should render all emails', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      expect(screen.getByText('test1@temp.mail')).toBeInTheDocument();
      expect(screen.getByText('test2@temp.mail')).toBeInTheDocument();
      expect(screen.getByText('test3@temp.mail')).toBeInTheDocument();
    });

    it('should display empty state when no emails', () => {
      render(
        <EmailList
          emails={[]}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      expect(screen.getByText('No emails yet')).toBeInTheDocument();
      expect(screen.getByText('Create a temporary email to get started')).toBeInTheDocument();
    });

    it('should render countdown timer for each email', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const timers = screen.getAllByTestId('countdown-timer');
      expect(timers).toHaveLength(3);
    });
  });

  describe('unread count badges', () => {
    it('should show unread count badge when unreadCount > 0', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should not show unread count badge when unreadCount is 0', () => {
      render(
        <EmailList
          emails={[mockEmails[1]]}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      // Only the email address should be visible, no badge
      expect(screen.getByText('test2@temp.mail')).toBeInTheDocument();
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should display correct unread count for each email', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const badge2 = screen.getByText('2');
      const badge5 = screen.getByText('5');

      expect(badge2).toHaveClass('bg-blue-600');
      expect(badge5).toHaveClass('bg-blue-600');
    });
  });

  describe('highlighting active email', () => {
    it('should highlight the active email', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId="email2"
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      // Find the parent container with border classes (now an li element)
      const email2Text = screen.getByText('test2@temp.mail');
      const email2Container = email2Text.closest('li[class*="border-"]');
      expect(email2Container).toHaveClass('border-blue-500');
    });

    it('should not highlight any email when activeEmailId is null', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const containers = screen.getAllByText(/@temp\.mail/).map(el => el.closest('li[class*="border-"]'));
      containers.forEach(container => {
        expect(container).not.toHaveClass('border-blue-500');
        expect(container).toHaveClass('border-gray-200');
      });
    });

    it('should apply different styling to non-active emails', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId="email1"
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const email2Text = screen.getByText('test2@temp.mail');
      const email2Container = email2Text.closest('li[class*="border-"]');
      expect(email2Container).toHaveClass('border-gray-200');
      expect(email2Container).not.toHaveClass('border-blue-500');
    });
  });

  describe('email selection', () => {
    it('should call onEmailSelect when email is clicked', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const email1 = screen.getByText('test1@temp.mail').closest('div');
      fireEvent.click(email1!);

      expect(mockOnEmailSelect).toHaveBeenCalledWith('email1');
    });

    it('should call onEmailSelect with correct email ID', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const email3 = screen.getByText('test3@temp.mail').closest('div');
      fireEvent.click(email3!);

      expect(mockOnEmailSelect).toHaveBeenCalledWith('email3');
    });

    it('should allow selecting already active email', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId="email1"
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const email1 = screen.getByText('test1@temp.mail').closest('div');
      fireEvent.click(email1!);

      expect(mockOnEmailSelect).toHaveBeenCalledWith('email1');
    });
  });

  describe('delete button and confirmation', () => {
    it('should show delete button for each email', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      expect(deleteButtons).toHaveLength(3);
    });

    it('should show confirmation buttons when delete is clicked', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should not call onEmailSelect when delete button is clicked', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      fireEvent.click(deleteButtons[0]);

      expect(mockOnEmailSelect).not.toHaveBeenCalled();
    });

    it('should call onEmailDelete when confirm is clicked', async () => {
      mockOnEmailDelete.mockResolvedValue(undefined);

      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnEmailDelete).toHaveBeenCalledWith('email1');
      });
    });

    it('should hide confirmation buttons when cancel is clicked', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      fireEvent.click(deleteButtons[0]);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('should not call onEmailDelete when cancel is clicked', () => {
      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      fireEvent.click(deleteButtons[0]);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnEmailDelete).not.toHaveBeenCalled();
    });

    it('should show loading state during deletion', async () => {
      mockOnEmailDelete.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      // Should show spinner during deletion
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
    });

    it('should handle deletion errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockOnEmailDelete.mockRejectedValue(new Error('Delete failed'));

      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should not call onEmailSelect when confirm button is clicked', async () => {
      mockOnEmailDelete.mockResolvedValue(undefined);

      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      const deleteButtons = screen.getAllByLabelText('Delete email');
      fireEvent.click(deleteButtons[0]);

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnEmailDelete).toHaveBeenCalled();
      });

      expect(mockOnEmailSelect).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle single email', () => {
      render(
        <EmailList
          emails={[mockEmails[0]]}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      expect(screen.getByText('test1@temp.mail')).toBeInTheDocument();
      expect(screen.queryByText('test2@temp.mail')).not.toBeInTheDocument();
    });

    it('should handle very long email addresses', () => {
      const longEmail: TemporaryEmail = {
        id: 'long',
        email: 'verylongemailaddressthatmightoverflow@temp.mail',
        createdAt: new Date(),
        expiresAt: new Date(),
        duration: '1hr',
        unreadCount: 0,
      };

      render(
        <EmailList
          emails={[longEmail]}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      expect(screen.getByText(longEmail.email)).toBeInTheDocument();
    });

    it('should handle large unread counts', () => {
      const emailWithManyUnread: TemporaryEmail = {
        ...mockEmails[0],
        unreadCount: 999,
      };

      render(
        <EmailList
          emails={[emailWithManyUnread]}
          activeEmailId={null}
          onEmailSelect={mockOnEmailSelect}
          onEmailDelete={mockOnEmailDelete}
        />
      );

      expect(screen.getByText('999')).toBeInTheDocument();
    });
  });
});

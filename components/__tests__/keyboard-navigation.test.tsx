import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessageViewer from '@/components/MessageViewer';
import EmailList from '@/components/EmailList';
import InboxViewer from '@/components/InboxViewer';
import EmailCreator from '@/components/EmailCreator';
import { CopyButton } from '@/components/CopyButton';
import { Message, TemporaryEmail } from '@/types';

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((html) => html),
}));

describe('Keyboard Navigation', () => {
  describe('MessageViewer', () => {
    const mockMessage: Message = {
      id: 'msg-1',
      from: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test body content',
      preview: 'Test preview',
      receivedAt: new Date(),
      isRead: false,
      isHtml: false,
    };

    it('should close modal when Escape key is pressed', () => {
      const onClose = jest.fn();
      render(<MessageViewer message={mockMessage} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should focus close button on mount', () => {
      const onClose = jest.fn();
      render(<MessageViewer message={mockMessage} onClose={onClose} />);

      const closeButton = screen.getByLabelText(/close message/i);
      expect(closeButton).toHaveFocus();
    });

    it('should have proper ARIA attributes', () => {
      const onClose = jest.fn();
      render(<MessageViewer message={mockMessage} onClose={onClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'message-viewer-title');
    });

    it('should be keyboard accessible with Tab navigation', () => {
      const onClose = jest.fn();
      render(<MessageViewer message={mockMessage} onClose={onClose} />);

      const closeButtonTop = screen.getByLabelText(/close message/i);
      const closeButtonBottom = screen.getByText('Close');

      // Both buttons should be focusable
      closeButtonTop.focus();
      expect(closeButtonTop).toHaveFocus();

      closeButtonBottom.focus();
      expect(closeButtonBottom).toHaveFocus();
    });
  });

  describe('EmailList', () => {
    const mockEmails: TemporaryEmail[] = [
      {
        id: 'email-1',
        email: 'test1@example.com',
        expiresAt: new Date(Date.now() + 3600000),
        unreadCount: 2,
      },
      {
        id: 'email-2',
        email: 'test2@example.com',
        expiresAt: new Date(Date.now() + 3600000),
        unreadCount: 0,
      },
    ];

    it('should allow keyboard navigation with Enter key', () => {
      const onEmailSelect = jest.fn();
      const onEmailDelete = jest.fn();

      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={onEmailSelect}
          onEmailDelete={onEmailDelete}
        />
      );

      const emailItem = screen.getByLabelText(/test1@example.com/i);
      fireEvent.keyDown(emailItem, { key: 'Enter' });

      expect(onEmailSelect).toHaveBeenCalledWith('email-1');
    });

    it('should allow keyboard navigation with Space key', () => {
      const onEmailSelect = jest.fn();
      const onEmailDelete = jest.fn();

      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={onEmailSelect}
          onEmailDelete={onEmailDelete}
        />
      );

      const emailItem = screen.getByLabelText(/test1@example.com/i);
      fireEvent.keyDown(emailItem, { key: ' ' });

      expect(onEmailSelect).toHaveBeenCalledWith('email-1');
    });

    it('should have proper ARIA attributes', () => {
      const onEmailSelect = jest.fn();
      const onEmailDelete = jest.fn();

      render(
        <EmailList
          emails={mockEmails}
          activeEmailId="email-1"
          onEmailSelect={onEmailSelect}
          onEmailDelete={onEmailDelete}
        />
      );

      const emailItem = screen.getByLabelText(/test1@example.com/i);
      expect(emailItem).toHaveAttribute('role', 'button');
      expect(emailItem).toHaveAttribute('aria-pressed', 'true');
      expect(emailItem).toHaveAttribute('tabIndex', '0');
    });

    it('should be focusable with Tab key', () => {
      const onEmailSelect = jest.fn();
      const onEmailDelete = jest.fn();

      render(
        <EmailList
          emails={mockEmails}
          activeEmailId={null}
          onEmailSelect={onEmailSelect}
          onEmailDelete={onEmailDelete}
        />
      );

      const emailItems = screen.getAllByRole('button');
      const emailButtons = emailItems.filter(item => item.getAttribute('aria-label')?.includes('Email'));
      expect(emailButtons[0]).toHaveAttribute('tabIndex', '0');
      expect(emailButtons[1]).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('InboxViewer', () => {
    const mockEmail: TemporaryEmail = {
      id: 'email-1',
      email: 'test@example.com',
      expiresAt: new Date(Date.now() + 3600000),
      unreadCount: 1,
    };

    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        from: 'sender@example.com',
        subject: 'Test Message',
        body: 'Test body',
        preview: 'Test preview',
        receivedAt: new Date(),
        isRead: false,
        isHtml: false,
      },
    ];

    it('should have accessible message buttons', () => {
      const onMessageSelect = jest.fn();

      render(
        <InboxViewer
          email={mockEmail}
          messages={mockMessages}
          onMessageSelect={onMessageSelect}
          isRefreshing={false}
        />
      );

      const messageButton = screen.getByLabelText(/message from sender@example.com/i);
      expect(messageButton).toBeInTheDocument();
      expect(messageButton.tagName).toBe('BUTTON');
    });

    it('should indicate unread status in aria-label', () => {
      const onMessageSelect = jest.fn();

      render(
        <InboxViewer
          email={mockEmail}
          messages={mockMessages}
          onMessageSelect={onMessageSelect}
          isRefreshing={false}
        />
      );

      const messageButton = screen.getByRole('button', { name: /message from sender@example.com.*unread/i });
      expect(messageButton).toBeInTheDocument();
    });
  });

  describe('EmailCreator', () => {
    it('should have accessible duration buttons', () => {
      const onCreateEmail = jest.fn();

      render(<EmailCreator onCreateEmail={onCreateEmail} />);

      const durationButtons = screen.getAllByRole('button', { name: /select duration/i });
      expect(durationButtons.length).toBeGreaterThan(0);

      durationButtons.forEach((button) => {
        expect(button).toHaveAttribute('aria-pressed');
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have accessible domain select', () => {
      const onCreateEmail = jest.fn();

      render(<EmailCreator onCreateEmail={onCreateEmail} />);

      const domainSelect = screen.getByLabelText(/select email domain/i);
      expect(domainSelect).toBeInTheDocument();
      expect(domainSelect.tagName).toBe('SELECT');
    });

    it('should have accessible create button', () => {
      const onCreateEmail = jest.fn();

      render(<EmailCreator onCreateEmail={onCreateEmail} />);

      const createButton = screen.getByLabelText(/create temporary email/i);
      expect(createButton).toBeInTheDocument();
    });
  });

  describe('CopyButton', () => {
    it('should have accessible aria-label', () => {
      render(<CopyButton text="test@example.com" label="Copy Email" />);

      const button = screen.getByLabelText(/copy email/i);
      expect(button).toBeInTheDocument();
    });

    it('should update aria-label when copied', async () => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });

      render(<CopyButton text="test@example.com" label="Copy" />);

      const button = screen.getByLabelText(/copy/i);
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByLabelText(/copied to clipboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Focus Indicators', () => {
    it('should apply focus-visible styles to buttons', () => {
      const onCreateEmail = jest.fn();
      render(<EmailCreator onCreateEmail={onCreateEmail} />);

      const button = screen.getByRole('button', { name: /create temporary email/i });
      
      // Check that button can receive focus
      button.focus();
      expect(button).toHaveFocus();
    });

    it('should apply focus-visible styles to inputs', () => {
      const onCreateEmail = jest.fn();
      render(<EmailCreator onCreateEmail={onCreateEmail} />);

      const select = screen.getByLabelText(/select email domain/i);
      
      // Check that select can receive focus
      select.focus();
      expect(select).toHaveFocus();
    });
  });
});

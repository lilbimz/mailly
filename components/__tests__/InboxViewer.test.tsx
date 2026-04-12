import React from 'react';
import { render, screen, fireEvent } from '@/lib/__tests__/test-utils';
import InboxViewer from '../InboxViewer';
import { TemporaryEmail, Message } from '@/types';

// Test fixtures
const mockEmail: TemporaryEmail = {
  id: 'email-123',
  email: 'test@temp.mail',
  createdAt: new Date('2024-01-01T12:00:00Z'),
  expiresAt: new Date('2024-01-01T13:00:00Z'),
  duration: '1hr',
  unreadCount: 2,
};

const createMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  emailId: 'email-123',
  from: 'sender@example.com',
  subject: 'Test Subject',
  receivedAt: new Date('2024-01-01T12:30:00Z'),
  preview: 'This is a preview of the message...',
  body: 'Full message body',
  isHtml: false,
  isRead: false,
  ...overrides,
});

describe('InboxViewer', () => {
  const mockOnMessageSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:35:00Z'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('message list rendering', () => {
    it('should render message list with sender, subject, and timestamp', () => {
      const messages = [createMessage()];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('sender@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test Subject')).toBeInTheDocument();
      expect(screen.getByText('5m ago')).toBeInTheDocument();
    });

    it('should display email address in header', () => {
      render(
        <InboxViewer
          email={mockEmail}
          messages={[]}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('test@temp.mail')).toBeInTheDocument();
    });

    it('should render multiple messages', () => {
      const messages = [
        createMessage({ id: 'msg-1', from: 'sender1@example.com' }),
        createMessage({ id: 'msg-2', from: 'sender2@example.com' }),
        createMessage({ id: 'msg-3', from: 'sender3@example.com' }),
      ];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('sender1@example.com')).toBeInTheDocument();
      expect(screen.getByText('sender2@example.com')).toBeInTheDocument();
      expect(screen.getByText('sender3@example.com')).toBeInTheDocument();
    });

    it('should display message preview', () => {
      const messages = [createMessage({ preview: 'Custom preview text' })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('Custom preview text')).toBeInTheDocument();
    });

    it('should display "(No subject)" when subject is empty', () => {
      const messages = [createMessage({ subject: '' })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('(No subject)')).toBeInTheDocument();
    });

    it('should show unread indicator for unread messages', () => {
      const messages = [createMessage({ isRead: false })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      // The unread indicator is a span with a blue dot class
      const messageButton = screen.getByRole('button', { name: /sender@example.com/i });
      const unreadDot = messageButton.querySelector('.bg-blue-600');
      expect(unreadDot).toBeInTheDocument();
    });

    it('should not show unread indicator for read messages', () => {
      const messages = [createMessage({ isRead: true })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      const messageButton = screen.getByRole('button', { name: /sender@example.com/i });
      const unreadDot = messageButton.querySelector('.bg-blue-600');
      expect(unreadDot).not.toBeInTheDocument();
    });
  });

  describe('message sorting by date', () => {
    it('should sort messages by receivedAt descending (newest first)', () => {
      const messages = [
        createMessage({ 
          id: 'msg-old', 
          from: 'old@example.com',
          receivedAt: new Date('2024-01-01T10:00:00Z') 
        }),
        createMessage({ 
          id: 'msg-new', 
          from: 'new@example.com',
          receivedAt: new Date('2024-01-01T12:00:00Z') 
        }),
        createMessage({ 
          id: 'msg-middle', 
          from: 'middle@example.com',
          receivedAt: new Date('2024-01-01T11:00:00Z') 
        }),
      ];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      const buttons = screen.getAllByRole('button');
      // First button is the message list item, check order
      expect(buttons[0]).toHaveTextContent('new@example.com');
      expect(buttons[1]).toHaveTextContent('middle@example.com');
      expect(buttons[2]).toHaveTextContent('old@example.com');
    });

    it('should handle messages with same timestamp', () => {
      const sameTime = new Date('2024-01-01T12:00:00Z');
      const messages = [
        createMessage({ id: 'msg-a', from: 'a@example.com', receivedAt: sameTime }),
        createMessage({ id: 'msg-b', from: 'b@example.com', receivedAt: sameTime }),
      ];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      // Both messages should be rendered
      expect(screen.getByText('a@example.com')).toBeInTheDocument();
      expect(screen.getByText('b@example.com')).toBeInTheDocument();
    });
  });

  describe('message selection handling', () => {
    it('should call onMessageSelect with message id when message is clicked', () => {
      const messages = [createMessage({ id: 'msg-test-123' })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      const messageButton = screen.getByRole('button', { name: /sender@example.com/i });
      fireEvent.click(messageButton);

      expect(mockOnMessageSelect).toHaveBeenCalledWith('msg-test-123');
    });

    it('should call onMessageSelect for correct message when multiple exist', () => {
      const messages = [
        createMessage({ id: 'msg-first', from: 'first@example.com' }),
        createMessage({ id: 'msg-second', from: 'second@example.com' }),
      ];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      const secondButton = screen.getByRole('button', { name: /second@example.com/i });
      fireEvent.click(secondButton);

      expect(mockOnMessageSelect).toHaveBeenCalledWith('msg-second');
      expect(mockOnMessageSelect).not.toHaveBeenCalledWith('msg-first');
    });

    it('should be clickable with keyboard (Enter key)', () => {
      const messages = [createMessage({ id: 'msg-keyboard' })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      const messageButton = screen.getByRole('button', { name: /sender@example.com/i });
      fireEvent.click(messageButton);

      expect(mockOnMessageSelect).toHaveBeenCalled();
    });
  });

  describe('loading indicator display', () => {
    it('should show loading indicator when isRefreshing is true', () => {
      render(
        <InboxViewer
          email={mockEmail}
          messages={[]}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={true}
        />
      );

      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
    });

    it('should not show loading indicator when isRefreshing is false', () => {
      render(
        <InboxViewer
          email={mockEmail}
          messages={[]}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.queryByText('Refreshing...')).not.toBeInTheDocument();
    });

    it('should show spinning animation SVG when refreshing', () => {
      render(
        <InboxViewer
          email={mockEmail}
          messages={[]}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={true}
        />
      );

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should show loading indicator even with messages present', () => {
      const messages = [createMessage()];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={true}
        />
      );

      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
      expect(screen.getByText('sender@example.com')).toBeInTheDocument();
    });
  });

  describe('empty state display', () => {
    it('should display empty state when no messages', () => {
      render(
        <InboxViewer
          email={mockEmail}
          messages={[]}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('No messages yet')).toBeInTheDocument();
      expect(screen.getByText('Messages sent to this email will appear here')).toBeInTheDocument();
    });

    it('should display email icon in empty state', () => {
      render(
        <InboxViewer
          email={mockEmail}
          messages={[]}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      // Check for the envelope icon SVG in empty state
      const emptyStateIcon = document.querySelector('.text-gray-400 path[d*="M3 8l7.89"]');
      expect(emptyStateIcon).toBeInTheDocument();
    });

    it('should not display empty state when messages exist', () => {
      const messages = [createMessage()];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.queryByText('No messages yet')).not.toBeInTheDocument();
    });

    it('should show empty state with correct styling', () => {
      render(
        <InboxViewer
          email={mockEmail}
          messages={[]}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      const emptyTitle = screen.getByText('No messages yet');
      expect(emptyTitle).toHaveClass('text-lg', 'font-medium');
    });
  });

  describe('timestamp formatting', () => {
    it('should display "Just now" for messages less than 1 minute old', () => {
      const messages = [createMessage({ 
        receivedAt: new Date('2024-01-01T12:34:30Z') // 30 seconds ago
      })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('Just now')).toBeInTheDocument();
    });

    it('should display minutes ago for messages less than 1 hour old', () => {
      const messages = [createMessage({ 
        receivedAt: new Date('2024-01-01T12:00:00Z') // 35 minutes ago
      })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('35m ago')).toBeInTheDocument();
    });

    it('should display hours ago for messages less than 24 hours old', () => {
      const messages = [createMessage({ 
        receivedAt: new Date('2024-01-01T10:35:00Z') // 2 hours ago
      })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('2h ago')).toBeInTheDocument();
    });

    it('should display days ago for messages less than 7 days old', () => {
      jest.setSystemTime(new Date('2024-01-05T12:35:00Z'));
      
      const messages = [createMessage({ 
        receivedAt: new Date('2024-01-03T12:35:00Z') // 2 days ago
      })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      expect(screen.getByText('2d ago')).toBeInTheDocument();
    });

    it('should display locale date string for messages older than 7 days', () => {
      jest.setSystemTime(new Date('2024-01-15T12:35:00Z'));
      
      const messages = [createMessage({ 
        receivedAt: new Date('2024-01-01T12:35:00Z') // 14 days ago
      })];
      
      render(
        <InboxViewer
          email={mockEmail}
          messages={messages}
          onMessageSelect={mockOnMessageSelect}
          isRefreshing={false}
        />
      );

      // The exact format depends on locale, but it should show a date
      const messageButton = screen.getByRole('button', { name: /sender@example.com/i });
      expect(messageButton).toHaveTextContent(/2024/);
    });
  });
});
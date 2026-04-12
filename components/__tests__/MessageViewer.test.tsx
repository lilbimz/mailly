import React from 'react';
import { render, screen, fireEvent } from '@/lib/__tests__/test-utils';
import { MessageViewer } from '../MessageViewer';
import { Message } from '@/types';
import DOMPurify from 'dompurify';

// Mock DOMPurify
jest.mock('dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: jest.fn((dirty: string) => dirty),
  },
}));

describe('MessageViewer', () => {
  const mockOnClose = jest.fn();

  const createMockMessage = (overrides?: Partial<Message>): Message => ({
    id: 'msg-123',
    emailId: 'email-456',
    from: 'sender@example.com',
    subject: 'Test Subject',
    receivedAt: new Date('2024-01-15T10:30:00Z'),
    preview: 'This is a preview...',
    body: 'This is the full message body.',
    isHtml: false,
    isRead: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DOMPurify mock
    (DOMPurify.sanitize as jest.Mock).mockImplementation((dirty: string) => dirty);
  });

  describe('message details rendering', () => {
    it('should render message sender', () => {
      const message = createMockMessage({ from: 'test@example.com' });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('From')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should render message subject', () => {
      const message = createMockMessage({ subject: 'Important Message' });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('Subject')).toBeInTheDocument();
      expect(screen.getByText('Important Message')).toBeInTheDocument();
    });

    it('should render formatted received date', () => {
      const message = createMockMessage({
        receivedAt: new Date('2024-01-15T10:30:00Z'),
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('Received')).toBeInTheDocument();
      // Date formatting is locale-dependent, just check it exists
      const dateElement = screen.getByText(/Jan|January/i);
      expect(dateElement).toBeInTheDocument();
    });

    it('should render message body label', () => {
      const message = createMockMessage();
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('should render modal title', () => {
      const message = createMockMessage();
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('Message Details')).toBeInTheDocument();
    });

    it('should render all message fields together', () => {
      const message = createMockMessage({
        from: 'sender@test.com',
        subject: 'Test Email',
        body: 'Email content here',
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('sender@test.com')).toBeInTheDocument();
      expect(screen.getByText('Test Email')).toBeInTheDocument();
      expect(screen.getByText('Email content here')).toBeInTheDocument();
    });
  });

  describe('text message display', () => {
    it('should render plain text message when isHtml is false', () => {
      const message = createMockMessage({
        body: 'This is a plain text message.',
        isHtml: false,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const bodyElement = screen.getByText('This is a plain text message.');
      expect(bodyElement).toBeInTheDocument();
      expect(bodyElement.tagName).toBe('PRE');
    });

    it('should preserve whitespace in plain text messages', () => {
      const message = createMockMessage({
        body: 'Line 1\n\nLine 2\n  Indented line',
        isHtml: false,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const bodyElement = screen.getByText(/Line 1/);
      expect(bodyElement).toHaveClass('whitespace-pre-wrap');
    });

    it('should not sanitize plain text messages', () => {
      const message = createMockMessage({
        body: 'Plain text with <tags>',
        isHtml: false,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(DOMPurify.sanitize).not.toHaveBeenCalled();
      expect(screen.getByText('Plain text with <tags>')).toBeInTheDocument();
    });

    it('should render long plain text messages', () => {
      const longText = 'A'.repeat(1000);
      const message = createMockMessage({
        body: longText,
        isHtml: false,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should apply correct styling to plain text container', () => {
      const message = createMockMessage({
        body: 'Test message',
        isHtml: false,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const bodyElement = screen.getByText('Test message');
      expect(bodyElement).toHaveClass('font-sans');
    });
  });

  describe('HTML message display', () => {
    it('should render HTML message when isHtml is true', () => {
      const message = createMockMessage({
        body: '<p>This is <strong>HTML</strong> content.</p>',
        isHtml: true,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText(/This is/)).toBeInTheDocument();
      expect(screen.getByText('HTML')).toBeInTheDocument();
    });

    it('should render HTML with dangerouslySetInnerHTML', () => {
      const message = createMockMessage({
        body: '<div><h1>Title</h1><p>Content</p></div>',
        isHtml: true,
      });
      const { container } = render(
        <MessageViewer message={message} onClose={mockOnClose} />
      );

      const htmlContainer = container.querySelector('.prose');
      expect(htmlContainer).toBeInTheDocument();
    });

    it('should apply prose styling to HTML messages', () => {
      const message = createMockMessage({
        body: '<p>HTML content</p>',
        isHtml: true,
      });
      const { container } = render(
        <MessageViewer message={message} onClose={mockOnClose} />
      );

      const htmlContainer = container.querySelector('.prose');
      expect(htmlContainer).toHaveClass('prose');
      expect(htmlContainer).toHaveClass('dark:prose-invert');
    });

    it('should render complex HTML structures', () => {
      const message = createMockMessage({
        body: '<ul><li>Item 1</li><li>Item 2</li></ul>',
        isHtml: true,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('HTML sanitization with DOMPurify', () => {
    it('should sanitize HTML content before rendering', () => {
      const message = createMockMessage({
        body: '<p>Safe content</p><script>alert("xss")</script>',
        isHtml: true,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(
        '<p>Safe content</p><script>alert("xss")</script>',
        expect.objectContaining({
          ALLOWED_TAGS: expect.arrayContaining(['p', 'strong', 'em', 'a']),
          ALLOWED_ATTR: expect.arrayContaining(['href', 'target', 'class']),
          ALLOW_DATA_ATTR: false,
          ALLOWED_URI_REGEXP: expect.any(RegExp),
        })
      );
    });

    it('should use strict sanitization configuration', () => {
      const message = createMockMessage({
        body: '<p>Content</p>',
        isHtml: true,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const sanitizeCall = (DOMPurify.sanitize as jest.Mock).mock.calls[0];
      const config = sanitizeCall[1];

      expect(config.ALLOWED_TAGS).toContain('p');
      expect(config.ALLOWED_TAGS).toContain('strong');
      expect(config.ALLOWED_TAGS).toContain('a');
      expect(config.ALLOWED_ATTR).toContain('href');
      expect(config.ALLOW_DATA_ATTR).toBe(false);
    });

    it('should sanitize HTML with allowed tags', () => {
      const message = createMockMessage({
        body: '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>',
        isHtml: true,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(DOMPurify.sanitize).toHaveBeenCalled();
      expect(screen.getByText(/Paragraph/)).toBeInTheDocument();
    });

    it('should sanitize HTML with links', () => {
      const message = createMockMessage({
        body: '<a href="https://example.com">Link</a>',
        isHtml: true,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(
        '<a href="https://example.com">Link</a>',
        expect.objectContaining({
          ALLOWED_URI_REGEXP: expect.any(RegExp),
        })
      );
    });

    it('should only sanitize HTML messages, not plain text', () => {
      const message = createMockMessage({
        body: 'Plain text message',
        isHtml: false,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(DOMPurify.sanitize).not.toHaveBeenCalled();
    });

    it('should sanitize empty HTML content', () => {
      const message = createMockMessage({
        body: '',
        isHtml: true,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(DOMPurify.sanitize).toHaveBeenCalledWith('', expect.any(Object));
    });

    it('should handle sanitization of malicious scripts', () => {
      const maliciousHtml =
        '<img src="x" onerror="alert(1)"><script>alert(2)</script>';
      const message = createMockMessage({
        body: maliciousHtml,
        isHtml: true,
      });

      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(DOMPurify.sanitize).toHaveBeenCalledWith(
        maliciousHtml,
        expect.any(Object)
      );
    });
  });

  describe('close button functionality', () => {
    it('should render close button in header', () => {
      const message = createMockMessage();
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close message/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render close button in footer', () => {
      const message = createMockMessage();
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      expect(closeButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should call onClose when header close button is clicked', () => {
      const message = createMockMessage();
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close message/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when footer close button is clicked', () => {
      const message = createMockMessage();
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const footerCloseButton = screen.getByRole('button', { name: /^close$/i });
      fireEvent.click(footerCloseButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose multiple times on single click', () => {
      const message = createMockMessage();
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /close message/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose for each button click separately', () => {
      const message = createMockMessage();
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const headerCloseButton = screen.getByRole('button', {
        name: /close message/i,
      });
      fireEvent.click(headerCloseButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);

      const footerCloseButton = screen.getByRole('button', { name: /^close$/i });
      fireEvent.click(footerCloseButton);

      expect(mockOnClose).toHaveBeenCalledTimes(2);
    });

    it('should render close icon in header button', () => {
      const message = createMockMessage();
      const { container } = render(
        <MessageViewer message={message} onClose={mockOnClose} />
      );

      const closeButton = screen.getByRole('button', { name: /close message/i });
      const svg = closeButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('modal layout and styling', () => {
    it('should render as a modal overlay', () => {
      const message = createMockMessage();
      const { container } = render(
        <MessageViewer message={message} onClose={mockOnClose} />
      );

      const overlay = container.querySelector('.fixed.inset-0');
      expect(overlay).toBeInTheDocument();
    });

    it('should have proper z-index for modal', () => {
      const message = createMockMessage();
      const { container } = render(
        <MessageViewer message={message} onClose={mockOnClose} />
      );

      const overlay = container.querySelector('.z-50');
      expect(overlay).toBeInTheDocument();
    });

    it('should render scrollable content area', () => {
      const message = createMockMessage();
      const { container } = render(
        <MessageViewer message={message} onClose={mockOnClose} />
      );

      const scrollArea = container.querySelector('.overflow-y-auto');
      expect(scrollArea).toBeInTheDocument();
    });

    it('should apply dark mode classes', () => {
      const message = createMockMessage();
      const { container } = render(
        <MessageViewer message={message} onClose={mockOnClose} />
      );

      const darkElements = container.querySelectorAll('[class*="dark:"]');
      expect(darkElements.length).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty message body', () => {
      const message = createMockMessage({ body: '' });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('should handle very long email addresses', () => {
      const longEmail = 'very.long.email.address.that.might.overflow@example.com';
      const message = createMockMessage({ from: longEmail });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      const emailElement = screen.getByText(longEmail);
      expect(emailElement).toHaveClass('break-all');
    });

    it('should handle empty subject', () => {
      const message = createMockMessage({ subject: '' });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('Subject')).toBeInTheDocument();
    });

    it('should handle special characters in subject', () => {
      const message = createMockMessage({
        subject: 'Test <>&" Special Characters',
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(screen.getByText('Test <>&" Special Characters')).toBeInTheDocument();
    });

    it('should handle HTML entities in plain text', () => {
      const message = createMockMessage({
        body: 'Text with &lt;entities&gt; and &amp;',
        isHtml: false,
      });
      render(<MessageViewer message={message} onClose={mockOnClose} />);

      expect(
        screen.getByText('Text with &lt;entities&gt; and &amp;')
      ).toBeInTheDocument();
    });
  });
});

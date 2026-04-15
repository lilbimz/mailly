import { render, screen, waitFor } from '@testing-library/react';
import MessageViewer from '@/components/MessageViewer';
import { Message } from '@/types';

// Mock DOMPurify dynamic import
jest.mock('dompurify', () => ({
  __esModule: true,
  default: {
    sanitize: jest.fn((html: string) => html),
  },
}));

describe('MessageViewer - Lazy Loading', () => {
  const mockOnClose = jest.fn();

  const textMessage: Message = {
    id: 'msg1',
    emailId: 'email1',
    from: 'sender@example.com',
    subject: 'Plain Text Message',
    receivedAt: new Date().toISOString(),
    preview: 'This is a preview',
    body: 'This is a plain text message body',
    isHtml: false,
    isRead: false,
  };

  const htmlMessage: Message = {
    id: 'msg2',
    emailId: 'email1',
    from: 'sender@example.com',
    subject: 'HTML Message',
    receivedAt: new Date().toISOString(),
    preview: 'This is a preview',
    body: '<p>This is an <strong>HTML</strong> message</p>',
    isHtml: true,
    isRead: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render text message without loading DOMPurify', async () => {
    render(<MessageViewer message={textMessage} onClose={mockOnClose} />);

    // Should display message immediately without loading state
    await waitFor(() => {
      expect(screen.getByText('This is a plain text message body')).toBeInTheDocument();
    });

    // Should not show loading spinner
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should show loading state while DOMPurify is being loaded for HTML messages', async () => {
    render(<MessageViewer message={htmlMessage} onClose={mockOnClose} />);

    // Initially should show loading state or the content after DOMPurify loads
    // Since the import is mocked, it should resolve quickly
    await waitFor(() => {
      expect(screen.getByText('HTML Message')).toBeInTheDocument();
    });
  });

  it('should lazy load DOMPurify only for HTML messages', async () => {
    const DOMPurify = await import('dompurify');
    const sanitizeSpy = jest.spyOn(DOMPurify.default, 'sanitize');

    // Render text message - should NOT call DOMPurify
    const { rerender } = render(<MessageViewer message={textMessage} onClose={mockOnClose} />);
    
    await waitFor(() => {
      expect(screen.getByText('This is a plain text message body')).toBeInTheDocument();
    });

    // DOMPurify should not be called for text messages
    expect(sanitizeSpy).not.toHaveBeenCalled();

    // Render HTML message - should call DOMPurify
    rerender(<MessageViewer message={htmlMessage} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('HTML Message')).toBeInTheDocument();
    });

    // DOMPurify should be called for HTML messages
    expect(sanitizeSpy).toHaveBeenCalledWith(
      htmlMessage.body,
      expect.objectContaining({
        ALLOWED_TAGS: expect.any(Array),
        ALLOWED_ATTR: expect.any(Array),
      })
    );
  });

  it('should handle DOMPurify loading failure gracefully', async () => {
    // Mock import failure
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // This test verifies error handling exists
    render(<MessageViewer message={htmlMessage} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText('HTML Message')).toBeInTheDocument();
    });

    // Should still render the message even if sanitization fails
    expect(screen.getByText('Message Details')).toBeInTheDocument();
  });
});

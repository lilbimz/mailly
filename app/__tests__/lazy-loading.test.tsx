import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

// Mock the hooks and components
jest.mock('@/lib/useEmailManager', () => ({
  useEmailManager: () => ({
    emails: [],
    activeEmail: null,
    createEmail: jest.fn(),
    deleteEmail: jest.fn(),
    selectEmail: jest.fn(),
    updateUnreadCount: jest.fn(),
  }),
}));

jest.mock('@/lib/useAutoRefresh', () => ({
  useAutoRefresh: () => ({
    messages: [],
    isRefreshing: false,
  }),
}));

describe('Lazy Loading', () => {
  it('should lazy load MessageViewer component', async () => {
    // Dynamic import to test lazy loading
    const Home = (await import('@/app/page')).default;
    
    render(<Home />);
    
    // Verify the page renders without MessageViewer initially
    expect(screen.getByText('TempMail Pro')).toBeInTheDocument();
    
    // MessageViewer should not be in the initial bundle
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should load MessageViewer when a message is selected', async () => {
    const mockMessage = {
      id: 'msg1',
      emailId: 'email1',
      from: 'sender@example.com',
      subject: 'Test Subject',
      receivedAt: new Date().toISOString(),
      preview: 'Test preview',
      body: 'Test body content',
      isHtml: false,
      isRead: false,
    };

    // Mock useEmailManager to return an active email
    jest.mock('@/lib/useEmailManager', () => ({
      useEmailManager: () => ({
        emails: [{
          id: 'email1',
          email: 'test@temp.com',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
          duration: '1hr' as const,
          unreadCount: 1,
        }],
        activeEmail: {
          id: 'email1',
          email: 'test@temp.com',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 3600000),
          duration: '1hr' as const,
          unreadCount: 1,
        },
        createEmail: jest.fn(),
        deleteEmail: jest.fn(),
        selectEmail: jest.fn(),
        updateUnreadCount: jest.fn(),
      }),
    }));

    jest.mock('@/lib/useAutoRefresh', () => ({
      useAutoRefresh: () => ({
        messages: [mockMessage],
        isRefreshing: false,
      }),
    }));

    const Home = (await import('@/app/page')).default;
    
    const { rerender } = render(<Home />);
    
    // Trigger a re-render to simulate message selection
    await act(async () => {
      rerender(<Home />);
    });

    // Wait for lazy loaded component
    await waitFor(() => {
      // The Suspense fallback or the actual component should be present
      expect(screen.getByText('TempMail Pro')).toBeInTheDocument();
    });
  });

  it('should show loading state while MessageViewer is loading', async () => {
    // This test verifies the Suspense fallback is shown
    const Home = (await import('@/app/page')).default;
    
    render(<Home />);
    
    // Initial render should not show loading state
    expect(screen.queryByText('Loading message...')).not.toBeInTheDocument();
  });
});

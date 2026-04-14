/**
 * Integration test for theme management
 * Tests the complete flow: useTheme hook -> ThemeProvider -> ThemeToggle
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Theme Management Integration', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Clear document classes
    document.documentElement.classList.remove('light', 'dark');
  });

  it('should initialize with light theme and apply to document', () => {
    render(
      <ThemeProvider>
        <div data-testid="content">Test Content</div>
      </ThemeProvider>
    );

    // Check that light theme class is applied to document
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should toggle theme and persist to localStorage', async () => {
    render(
      <ThemeProvider>
        <div data-testid="content">Test Content</div>
      </ThemeProvider>
    );

    // Find and click the theme toggle button
    const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(toggleButton);

    // Wait for state update
    await waitFor(() => {
      // Check that dark theme class is applied to document
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    // Check that theme is persisted to localStorage
    const storedTheme = localStorageMock.getItem('tempmail_theme');
    expect(storedTheme).toBe('"dark"');
  });

  it('should load theme from localStorage on mount', () => {
    // Pre-populate localStorage with dark theme
    localStorageMock.setItem('tempmail_theme', '"dark"');

    render(
      <ThemeProvider>
        <div data-testid="content">Test Content</div>
      </ThemeProvider>
    );

    // Check that dark theme class is applied to document
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);

    // Check that toggle button shows correct state
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('should toggle theme multiple times', async () => {
    render(
      <ThemeProvider>
        <div data-testid="content">Test Content</div>
      </ThemeProvider>
    );

    // Initial state: light
    expect(document.documentElement.classList.contains('light')).toBe(true);

    // Toggle to dark
    const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    // Toggle back to light
    const toggleButtonDark = screen.getByRole('button', { name: /switch to light mode/i });
    fireEvent.click(toggleButtonDark);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('should render children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="content">Test Content</div>
        <button>Test Button</button>
      </ThemeProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../ThemeProvider';

// Mock the useTheme hook
jest.mock('@/lib/useTheme', () => ({
  useTheme: jest.fn(),
}));

// Mock ThemeToggle component
jest.mock('@/components/ThemeToggle', () => {
  return function MockThemeToggle({ theme, onThemeChange }: any) {
    return (
      <button
        data-testid="theme-toggle"
        onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
      </button>
    );
  };
});

import { useTheme } from '@/lib/useTheme';

describe('ThemeProvider', () => {
  let mockSetTheme: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue(['light', mockSetTheme]);
  });

  it('should render children', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Child</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('should render ThemeToggle component', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('should pass current theme to ThemeToggle', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Switch to Dark')).toBeInTheDocument();
  });

  it('should call setTheme when ThemeToggle triggers theme change', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId('theme-toggle');
    fireEvent.click(toggleButton);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should update ThemeToggle when theme changes', () => {
    const { rerender } = render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Switch to Dark')).toBeInTheDocument();

    // Simulate theme change
    (useTheme as jest.Mock).mockReturnValue(['dark', mockSetTheme]);

    rerender(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    expect(screen.getByText('Switch to Light')).toBeInTheDocument();
  });

  it('should position ThemeToggle in fixed top-right corner', () => {
    const { container } = render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>
    );

    const toggleContainer = container.querySelector('.fixed.top-4.right-4.z-50');
    expect(toggleContainer).toBeInTheDocument();
  });
});

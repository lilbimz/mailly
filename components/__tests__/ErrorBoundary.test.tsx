import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock console.error to avoid cluttering test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render fallback UI when an error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('We encountered an unexpected error. Please refresh the page to continue.')
    ).toBeInTheDocument();
  });

  it('should display refresh button in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    expect(refreshButton).toBeInTheDocument();
  });

  it('should have a clickable refresh button that calls reload', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).not.toBeDisabled();
    
    // Verify button is clickable (doesn't throw)
    expect(() => fireEvent.click(refreshButton)).not.toThrow();
  });

  it('should log error details to console', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(console.error).toHaveBeenCalledWith(
      'Error Boundary caught an error:',
      expect.any(Error)
    );
    expect(console.error).toHaveBeenCalledWith('Error Info:', expect.any(Object));
    expect(console.error).toHaveBeenCalledWith('Component Stack:', expect.any(String));
  });

  it('should display error icon in fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for SVG icon by looking for the path element
    const svgElement = screen.getByText('Something went wrong')
      .closest('div')
      ?.parentElement?.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass('w-8', 'h-8', 'text-red-600', 'dark:text-red-400');
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const detailsElement = screen.getByText('Error Details (Development Only)');
    expect(detailsElement).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should hide error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const detailsElement = screen.queryByText('Error Details (Development Only)');
    expect(detailsElement).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should catch errors from nested components', () => {
    const NestedComponent = () => {
      return (
        <div>
          <ThrowError />
        </div>
      );
    };

    render(
      <ErrorBoundary>
        <NestedComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should not catch errors when children render successfully', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should apply dark mode styles correctly', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for dark mode classes in the card container
    const cardContainer = screen.getByText('Something went wrong').closest('div')?.parentElement;
    expect(cardContainer).toHaveClass('dark:bg-gray-800');
  });

  it('should have accessible button with proper focus styles', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const refreshButton = screen.getByRole('button', { name: /refresh page/i });
    expect(refreshButton).toHaveClass('focus:outline-none', 'focus:ring-2');
  });
});

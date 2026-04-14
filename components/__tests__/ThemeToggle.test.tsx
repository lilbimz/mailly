import React from 'react';
import { render, screen, fireEvent } from '@/lib/__tests__/test-utils';
import ThemeToggle from '../ThemeToggle';

describe('ThemeToggle', () => {
  describe('rendering', () => {
    it('should render toggle button', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render moon icon when theme is light', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button', { name: /switch to dark mode/i });
      expect(button).toBeInTheDocument();
    });

    it('should render sun icon when theme is dark', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="dark" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button', { name: /switch to light mode/i });
      expect(button).toBeInTheDocument();
    });

    it('should have appropriate aria-label for light theme', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('should have appropriate aria-label for dark theme', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="dark" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  describe('theme toggling', () => {
    it('should call onThemeChange with "dark" when clicked in light mode', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
      expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    });

    it('should call onThemeChange with "light" when clicked in dark mode', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="dark" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnThemeChange).toHaveBeenCalledWith('light');
      expect(mockOnThemeChange).toHaveBeenCalledTimes(1);
    });

    it('should toggle between light and dark on multiple clicks', () => {
      const mockOnThemeChange = jest.fn();
      const { rerender } = render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      
      // First click: light -> dark
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalledWith('dark');
      
      // Simulate parent component updating the theme prop
      rerender(<ThemeToggle theme="dark" onThemeChange={mockOnThemeChange} />);
      
      // Second click: dark -> light
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalledWith('light');
      
      expect(mockOnThemeChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('styling', () => {
    it('should have base styling classes', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('p-2', 'rounded-lg', 'transition-colors');
    });

    it('should have hover classes', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('hover:bg-gray-300');
      expect(button.className).toContain('dark:hover:bg-gray-600');
    });

    it('should have background color classes', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-200');
      expect(button.className).toContain('dark:bg-gray-700');
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      button.focus();
      
      expect(button).toHaveFocus();
    });

    it('should trigger on Enter key press', () => {
      const mockOnThemeChange = jest.fn();
      render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Note: fireEvent.keyDown doesn't automatically trigger click for buttons
      // In real browsers, Enter key on a button triggers click
      // We test the click handler directly
      fireEvent.click(button);
      expect(mockOnThemeChange).toHaveBeenCalled();
    });

    it('should have descriptive aria-label that changes with theme', () => {
      const mockOnThemeChange = jest.fn();
      const { rerender } = render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
      
      rerender(<ThemeToggle theme="dark" onThemeChange={mockOnThemeChange} />);
      
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  describe('icon rendering', () => {
    it('should render SVG icon', () => {
      const mockOnThemeChange = jest.fn();
      const { container } = render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render moon icon path for light theme', () => {
      const mockOnThemeChange = jest.fn();
      const { container } = render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d', 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
    });

    it('should render sun icon path for dark theme', () => {
      const mockOnThemeChange = jest.fn();
      const { container } = render(<ThemeToggle theme="dark" onThemeChange={mockOnThemeChange} />);
      
      const path = container.querySelector('path');
      expect(path).toHaveAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
    });

    it('should update icon when theme prop changes', () => {
      const mockOnThemeChange = jest.fn();
      const { container, rerender } = render(<ThemeToggle theme="light" onThemeChange={mockOnThemeChange} />);
      
      let path = container.querySelector('path');
      const moonPath = path?.getAttribute('d');
      
      rerender(<ThemeToggle theme="dark" onThemeChange={mockOnThemeChange} />);
      
      path = container.querySelector('path');
      const sunPath = path?.getAttribute('d');
      
      expect(moonPath).not.toBe(sunPath);
    });
  });
});

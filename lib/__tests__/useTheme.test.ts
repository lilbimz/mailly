import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

// Mock useLocalStorage
jest.mock('../useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}));

import { useLocalStorage } from '../useLocalStorage';

describe('useTheme', () => {
  let mockSetTheme: jest.Mock;
  let mockTheme: 'light' | 'dark';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock values
    mockTheme = 'light';
    mockSetTheme = jest.fn((newTheme) => {
      mockTheme = typeof newTheme === 'function' ? newTheme(mockTheme) : newTheme;
    });

    // Mock useLocalStorage to return our controlled values
    (useLocalStorage as jest.Mock).mockImplementation(() => [mockTheme, mockSetTheme]);

    // Mock document.documentElement
    document.documentElement.classList.remove = jest.fn();
    document.documentElement.classList.add = jest.fn();
  });

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current[0]).toBe('light');
    expect(useLocalStorage).toHaveBeenCalledWith('tempmail_theme', 'light');
  });

  it('should apply theme class to document root on mount', () => {
    renderHook(() => useTheme());
    
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('light');
  });

  it('should update theme when setTheme is called', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current[1]('dark');
    });
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should apply dark theme class when theme changes to dark', () => {
    // Start with light theme
    const { rerender } = renderHook(() => useTheme());
    
    // Change to dark theme
    mockTheme = 'dark';
    (useLocalStorage as jest.Mock).mockImplementation(() => [mockTheme, mockSetTheme]);
    
    rerender();
    
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });

  it('should remove old theme class before adding new one', () => {
    const { rerender } = renderHook(() => useTheme());
    
    // Verify initial state
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('light');
    
    // Clear mock calls
    jest.clearAllMocks();
    
    // Change theme
    mockTheme = 'dark';
    (useLocalStorage as jest.Mock).mockImplementation(() => [mockTheme, mockSetTheme]);
    
    rerender();
    
    // Verify classes are removed before adding new one
    const removeCalls = (document.documentElement.classList.remove as jest.Mock).mock.calls;
    const addCalls = (document.documentElement.classList.add as jest.Mock).mock.calls;
    
    expect(removeCalls.length).toBeGreaterThan(0);
    expect(addCalls.length).toBeGreaterThan(0);
    
    // Remove should be called before add
    const removeCallOrder = (document.documentElement.classList.remove as jest.Mock).mock.invocationCallOrder[0];
    const addCallOrder = (document.documentElement.classList.add as jest.Mock).mock.invocationCallOrder[0];
    
    expect(removeCallOrder).toBeLessThan(addCallOrder);
  });

  it('should persist theme preference using useLocalStorage', () => {
    renderHook(() => useTheme());
    
    expect(useLocalStorage).toHaveBeenCalledWith('tempmail_theme', 'light');
  });
});

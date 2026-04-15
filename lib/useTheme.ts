'use client';

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type Theme = 'light' | 'dark';

/**
 * Custom hook for managing theme preference
 * Persists theme to localStorage and applies to document root
 * 
 * @returns Tuple of [theme, setTheme]
 * 
 * @example
 * const [theme, setTheme] = useTheme();
 * setTheme('dark'); // Updates theme and persists to localStorage
 */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useLocalStorage<Theme>('mailly_theme', 'light');

  // Apply theme class to document root element
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = document.documentElement;
    
    // Remove both classes first to ensure clean state
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
  }, [theme]);

  return [theme, setTheme];
}

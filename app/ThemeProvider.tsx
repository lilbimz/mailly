'use client';

import { useTheme } from '@/lib/useTheme';
import ThemeToggle from '@/components/ThemeToggle';

/**
 * ThemeProvider component that manages theme state and provides theme toggle
 * Wraps the application to provide theme management functionality
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useTheme();

  return (
    <>
      {/* Theme Toggle Button - Fixed position in top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
      </div>
      
      {children}
    </>
  );
}

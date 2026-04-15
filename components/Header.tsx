'use client';

import { memo, useState } from 'react';
import { useTheme } from '@/lib/useTheme';
import ThemeToggle from './ThemeToggle';

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-midnight/80 backdrop-blur-xl border-b border-surface-container-low">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <a href="/" className="font-display text-xl sm:text-2xl font-bold text-on-surface hover:text-primary transition-colors cursor-pointer">
              Mailly
            </a>
            
            <nav className="hidden md:flex items-center gap-6">
              <a href="/#features" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Features
              </a>
              <a href="/security" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Security
              </a>
              <a href="/domains" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                Domains
              </a>
              <a href="/api-docs" className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                API
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle theme={theme} onThemeChange={setTheme} />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-on-surface-variant hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-surface-container-low pt-4">
            <div className="flex flex-col gap-3">
              <a 
                href="/#features" 
                className="text-base text-on-surface-variant hover:text-on-surface transition-colors py-2 px-3 rounded-lg hover:bg-surface-container"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="/security" 
                className="text-base text-on-surface-variant hover:text-on-surface transition-colors py-2 px-3 rounded-lg hover:bg-surface-container"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Security
              </a>
              <a 
                href="/domains" 
                className="text-base text-on-surface-variant hover:text-on-surface transition-colors py-2 px-3 rounded-lg hover:bg-surface-container"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Domains
              </a>
              <a 
                href="/api-docs" 
                className="text-base text-on-surface-variant hover:text-on-surface transition-colors py-2 px-3 rounded-lg hover:bg-surface-container"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                API
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default memo(Header);

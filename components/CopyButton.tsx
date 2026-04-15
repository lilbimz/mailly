'use client';

import { useState, memo, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

function CopyButtonComponent({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    setError(null);

    // Check if Clipboard API is supported
    if (!navigator.clipboard) {
      setError('Copy not supported in your browser');
      
      // Clear error after 2 seconds
      setTimeout(() => {
        setError(null);
      }, 2000);
      
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Reset success feedback after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to copy to clipboard';
      setError(errorMessage);

      // Clear error after 2 seconds
      setTimeout(() => {
        setError(null);
      }, 2000);
    }
  }, [text]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        aria-label={copied ? 'Copied to clipboard' : error ? 'Copy failed' : `Copy ${label.toLowerCase()}`}
        className={`px-3 py-2 rounded-md font-medium transition-colors min-h-[44px] touch-manipulation ${
          copied
            ? 'bg-green-500 dark:bg-green-600 text-white'
            : error
              ? 'bg-red-500 dark:bg-red-600 text-white'
              : 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700'
        }`}
        disabled={copied || error !== null}
      >
        {copied ? '✓ Copied!' : error ? '✗ Error' : label}
      </button>
      {error && <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const CopyButton = memo(CopyButtonComponent);

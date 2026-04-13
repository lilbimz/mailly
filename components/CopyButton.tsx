'use client';

import { useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
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
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className={`px-3 py-2 rounded-md font-medium transition-colors ${
          copied
            ? 'bg-green-500 text-white'
            : error
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        disabled={copied || error !== null}
      >
        {copied ? '✓ Copied!' : error ? '✗ Error' : label}
      </button>
      {error && <span className="text-sm text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}

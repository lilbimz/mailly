'use client';

import { useState, useEffect, memo } from 'react';
import { formatTimeRemaining, isEmailExpired } from '@/lib/utils';

interface CountdownTimerProps {
  expiresAt: Date;
  onExpire: () => void;
}

function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>(() => 
    formatTimeRemaining(expiresAt)
  );
  const [hasExpired, setHasExpired] = useState<boolean>(() => 
    isEmailExpired(expiresAt)
  );

  useEffect(() => {
    // If already expired on mount, call onExpire immediately
    if (hasExpired) {
      onExpire();
      return;
    }

    // Update countdown every second
    const intervalId = setInterval(() => {
      const formatted = formatTimeRemaining(expiresAt);
      setTimeRemaining(formatted);

      // Check if countdown reached zero
      if (formatted === 'Expired' || isEmailExpired(expiresAt)) {
        setHasExpired(true);
        onExpire();
        clearInterval(intervalId);
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [expiresAt, onExpire, hasExpired]);

  return (
    <div className="flex items-center gap-2" aria-live="polite" aria-atomic="true">
      {hasExpired ? (
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          Expired
        </span>
      ) : (
        <>
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {timeRemaining}
          </span>
        </>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(CountdownTimer);

'use client';

import { useState } from 'react';
import { Duration } from '@/types';

interface EmailCreatorProps {
  onCreateEmail: (duration: Duration, domain?: string) => Promise<void>;
  disabled?: boolean;
}

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: '10min', label: '10 minutes' },
  { value: '1hr', label: '1 hour' },
  { value: '1day', label: '1 day' },
];

// List of reliable domains that accept emails
const DOMAIN_OPTIONS = [
  { value: 'nondon.store', label: '📧 nondon.store (Recommended)' },
  { value: 'norion.shop', label: '📧 norion.shop' },
  { value: 'noniton.store', label: '📧 noniton.store' },
  { value: 'random', label: '🎲 Random Domain' },
];

export default function EmailCreator({ onCreateEmail, disabled = false }: EmailCreatorProps) {
  const [selectedDuration, setSelectedDuration] = useState<Duration>('1hr');
  const [selectedDomain, setSelectedDomain] = useState<string>('nondon.store');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateEmail = async () => {
    setError(null);
    setIsCreating(true);

    try {
      const domain = selectedDomain === 'random' ? undefined : selectedDomain;
      await onCreateEmail(selectedDuration, domain);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create email. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Create Temporary Email
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Duration
        </label>
        <div className="flex flex-wrap gap-3">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedDuration(option.value)}
              disabled={disabled || isCreating}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all
                ${
                  selectedDuration === option.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
                ${disabled || isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Select Domain
        </label>
        <select
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
          disabled={disabled || isCreating}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {DOMAIN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          💡 Tip: Use nondon.store for best email delivery reliability
        </p>
      </div>

      <button
        onClick={handleCreateEmail}
        disabled={disabled || isCreating}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold text-white transition-all
          ${
            disabled || isCreating
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
          }
        `}
      >
        {isCreating ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating...
          </span>
        ) : (
          'Create Email'
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
}

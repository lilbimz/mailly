'use client';

import { useState, memo, useCallback } from 'react';
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

function EmailCreator({ onCreateEmail, disabled = false }: EmailCreatorProps) {
  const [selectedDuration, setSelectedDuration] = useState<Duration>('1hr');
  const [selectedDomain, setSelectedDomain] = useState<string>('nondon.store');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>('awaiting_generation@mailly.sh');

  const handleCreateEmail = useCallback(async () => {
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
  }, [selectedDuration, selectedDomain, onCreateEmail]);

  const handleCopyEmail = useCallback(() => {
    navigator.clipboard.writeText(generatedEmail);
  }, [generatedEmail]);

  return (
    <section className="w-full max-w-lg mx-auto">
      <div className="bg-surface-container-high rounded-sm p-4 sm:p-6 border-gradient shadow-ambient">
        <h2 className="font-display text-xs text-on-surface-variant mb-4 sm:mb-5 text-center tracking-widest uppercase font-medium">
          Generate Instant Identity
        </h2>

        {/* Duration Selection */}
        <div className="mb-3 sm:mb-4">
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Select duration">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDuration(option.value)}
                disabled={disabled || isCreating}
                aria-pressed={selectedDuration === option.value}
                className={`
                  px-2 sm:px-3 py-2.5 sm:py-2 rounded-sm text-xs font-medium transition-all min-h-[44px] touch-manipulation
                  ${
                    selectedDuration === option.value
                      ? 'bg-surface-bright text-on-surface'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-low'
                  }
                  ${disabled || isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {option.label.replace(' minutes', 'min').replace(' hour', 'h').replace(' day', 'day')}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Email Display */}
        <div className="mb-3 sm:mb-4">
          <div className="bg-surface-container-lowest rounded-sm p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-3">
            <span className="font-mono text-xs text-on-surface-variant flex-1 truncate break-all">
              {generatedEmail}
            </span>
            <button
              onClick={handleCopyEmail}
              className="flex-shrink-0 p-2 text-on-surface-variant hover:text-primary transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
              aria-label="Copy email address"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateEmail}
          disabled={disabled || isCreating}
          className={`
            w-full py-3.5 sm:py-3 px-6 rounded-lg font-display font-semibold text-sm sm:text-base
            gradient-mint text-midnight shadow-glow
            hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 min-h-[48px] sm:min-h-[44px] touch-manipulation
            ${disabled || isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {isCreating ? 'Creating...' : 'Create Email'}
        </button>

        {error && (
          <div className="mt-3 p-2.5 bg-surface-container-lowest rounded-sm" role="alert">
            <p className="text-xs text-on-surface-variant">{error}</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(EmailCreator);

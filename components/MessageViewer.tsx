'use client';

import { useEffect, useRef, useState, memo, useMemo } from 'react';
import { Message } from '@/types';

interface MessageViewerProps {
  message: Message;
  onClose: () => void;
}

// Strict DOMPurify configuration for HTML sanitization
const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'a',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'code',
    'span',
    'div',
  ],
  ALLOWED_ATTR: ['href', 'target', 'class'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^https?:\/\//,
};

function MessageViewer({ message, onClose }: MessageViewerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [sanitizedBody, setSanitizedBody] = useState<string>('');
  const [isLoadingSanitizer, setIsLoadingSanitizer] = useState(message.isHtml);

  // Lazy load DOMPurify only when needed (for HTML messages)
  useEffect(() => {
    if (message.isHtml) {
      setIsLoadingSanitizer(true);
      import('dompurify')
        .then((DOMPurify) => {
          const sanitized = DOMPurify.default.sanitize(message.body, SANITIZE_CONFIG);
          setSanitizedBody(sanitized);
          setIsLoadingSanitizer(false);
        })
        .catch((error) => {
          console.error('Failed to load DOMPurify:', error);
          // Fallback to plain text if DOMPurify fails to load
          setSanitizedBody(message.body);
          setIsLoadingSanitizer(false);
        });
    } else {
      setSanitizedBody(message.body);
      setIsLoadingSanitizer(false);
    }
  }, [message.body, message.isHtml]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Focus the close button when modal opens for keyboard navigation
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // Memoize formatted date to avoid recalculating on every render
  const formattedDate = useMemo(() => {
    return new Date(message.receivedAt).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, [message.receivedAt]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-viewer-title"
      onClick={onClose}
    >
      <article 
        className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-lg shadow-xl max-w-3xl w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 
            id="message-viewer-title"
            className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white"
          >
            Message Details
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 min-w-[44px] min-h-[44px] touch-manipulation"
            aria-label="Close message (Press Escape)"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        {/* Message Details */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 overscroll-contain">
          <div className="space-y-4">
            {/* From */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                From
              </label>
              <p className="text-sm text-gray-900 dark:text-white break-all">
                {message.from}
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Subject
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-medium break-words">
                {message.subject}
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Received
              </label>
              <p className="text-sm text-gray-900 dark:text-white">{formattedDate}</p>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Message
              </label>
              <div className="mt-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                {isLoadingSanitizer ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : message.isHtml ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-gray-900 dark:text-white break-words [&_a]:break-all"
                    dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 dark:text-white break-words">
                    {sanitizedBody}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 sm:p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0 safe-area-inset-bottom">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium min-h-[48px] sm:min-h-[44px] touch-manipulation"
          >
            Close
          </button>
        </footer>
      </article>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(MessageViewer);

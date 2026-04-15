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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-viewer-title"
    >
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 
            id="message-viewer-title"
            className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white"
          >
            Message Details
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 rounded min-w-[44px] min-h-[44px] touch-manipulation"
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
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* From */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                From
              </label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">
                {message.from}
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Subject
              </label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white font-medium break-words">
                {message.subject}
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Received
              </label>
              <p className="text-sm sm:text-base text-gray-900 dark:text-white">{formattedDate}</p>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Message
              </label>
              <div className="mt-2 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                {isLoadingSanitizer ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : message.isHtml ? (
                  <div
                    className="prose prose-sm sm:prose dark:prose-invert max-w-none text-gray-900 dark:text-white break-words"
                    dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-sm sm:text-base text-gray-900 dark:text-white break-words">
                    {sanitizedBody}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium min-h-[44px] touch-manipulation"
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

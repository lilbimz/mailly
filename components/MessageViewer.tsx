'use client';

import { Message } from '@/types';
import DOMPurify from 'dompurify';

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

export function MessageViewer({ message, onClose }: MessageViewerProps) {
  // Sanitize HTML content before rendering
  const sanitizedBody = message.isHtml
    ? DOMPurify.sanitize(message.body, SANITIZE_CONFIG)
    : message.body;

  // Format the received date
  const formattedDate = new Date(message.receivedAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Message Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Close message"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Message Details */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="space-y-4">
            {/* From */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                From
              </label>
              <p className="text-gray-900 dark:text-white break-all">
                {message.from}
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Subject
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {message.subject}
              </p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Received
              </label>
              <p className="text-gray-900 dark:text-white">{formattedDate}</p>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Message
              </label>
              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                {message.isHtml ? (
                  <div
                    className="prose dark:prose-invert max-w-none text-gray-900 dark:text-white"
                    dangerouslySetInnerHTML={{ __html: sanitizedBody }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-white">
                    {sanitizedBody}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

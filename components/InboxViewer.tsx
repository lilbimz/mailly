'use client';

import { useMemo, memo, useCallback } from 'react';
import { TemporaryEmail, Message } from '@/types';

interface InboxViewerProps {
  email: TemporaryEmail;
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
  isRefreshing: boolean;
}

function InboxViewer({
  email,
  messages,
  onMessageSelect,
  isRefreshing,
}: InboxViewerProps) {
  // Memoize sorted messages to avoid re-sorting on every render
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => {
      const dateA = new Date(a.receivedAt).getTime();
      const dateB = new Date(b.receivedAt).getTime();
      return dateB - dateA;
    });
  }, [messages]);

  // Memoize timestamp formatter to avoid recreating on every render
  const formatTimestamp = useCallback((date: Date): string => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return messageDate.toLocaleDateString();
  }, []);

  return (
    <section className="w-full bg-surface-container-low rounded-sm p-3 sm:p-5 shadow-ambient" aria-live="polite" aria-atomic="false">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-5 gap-2">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-on-surface mb-1">
            Inbox
          </h2>
          <p className="text-xs text-on-surface-variant">
            {sortedMessages.length} {sortedMessages.length === 1 ? 'message' : 'messages'}
          </p>
        </div>
        {isRefreshing && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant" aria-live="polite">
            <svg
              className="animate-spin h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <span>Refreshing...</span>
          </div>
        )}
      </div>

      <div className="mb-4 sm:mb-5 p-2.5 sm:p-3 bg-surface-container-lowest rounded-sm">
        <p className="text-xs text-on-surface-variant break-all">
          Email: <span className="font-mono text-on-surface">{email.email}</span>
        </p>
      </div>

      {sortedMessages.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-10 w-10 text-on-surface-variant opacity-50"
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-3 text-base font-medium text-on-surface">
            No messages yet
          </h3>
          <p className="mt-1 text-xs text-on-surface-variant">
            Messages sent to this email will appear here
          </p>
        </div>
      ) : (
        <ul className="space-y-2" role="list">
          {sortedMessages.map((message) => (
            <li key={message.id}>
              <button
                onClick={() => onMessageSelect(message.id)}
                className="w-full text-left p-2.5 sm:p-3 bg-surface-container hover:bg-surface-container-high rounded-sm transition-all min-h-[56px] touch-manipulation"
                aria-label={`Message from ${message.from}: ${message.subject || '(No subject)'}${!message.isRead ? ' (unread)' : ''}`}
              >
              <div className="flex items-start justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {!message.isRead && (
                      <span 
                        className="flex-shrink-0 w-1.5 h-1.5 bg-secondary-fixed-dim rounded-full shadow-glow"
                        aria-label="Unread"
                      ></span>
                    )}
                    <p className="text-xs font-semibold text-on-surface truncate break-all">
                      {message.from}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-on-surface truncate mb-1">
                    {message.subject || '(No subject)'}
                  </p>
                  <p className="text-xs text-on-surface-variant line-clamp-2 sm:truncate">
                    {message.preview}
                  </p>
                </div>
                <div className="flex-shrink-0 pt-0.5">
                  <p className="text-xs text-on-surface-variant whitespace-nowrap">
                    {formatTimestamp(message.receivedAt)}
                  </p>
                </div>
              </div>
            </button>
          </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(InboxViewer);

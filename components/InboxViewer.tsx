'use client';

import { TemporaryEmail, Message } from '@/types';

interface InboxViewerProps {
  email: TemporaryEmail;
  messages: Message[];
  onMessageSelect: (messageId: string) => void;
  isRefreshing: boolean;
}

export default function InboxViewer({
  email,
  messages,
  onMessageSelect,
  isRefreshing,
}: InboxViewerProps) {
  // Sort messages by receivedAt descending (newest first)
  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = new Date(a.receivedAt).getTime();
    const dateB = new Date(b.receivedAt).getTime();
    return dateB - dateA;
  });

  // Format timestamp for display
  const formatTimestamp = (date: Date): string => {
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
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Inbox
        </h2>
        {isRefreshing && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="animate-spin h-4 w-4"
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
            <span>Refreshing...</span>
          </div>
        )}
      </div>

      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Email: <span className="font-mono text-gray-900 dark:text-gray-100">{email.email}</span>
        </p>
      </div>

      {sortedMessages.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No messages yet
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Messages sent to this email will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedMessages.map((message) => (
            <button
              key={message.id}
              onClick={() => onMessageSelect(message.id)}
              className="w-full text-left p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {message.from}
                    </p>
                    {!message.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-base font-medium text-gray-800 dark:text-gray-200 truncate mb-1">
                    {message.subject || '(No subject)'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {message.preview}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTimestamp(message.receivedAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

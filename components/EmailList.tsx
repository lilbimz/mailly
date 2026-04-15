'use client';

import { useState, memo, useCallback } from 'react';
import { TemporaryEmail } from '@/types';
import CountdownTimer from './CountdownTimer';

interface EmailListProps {
  emails: TemporaryEmail[];
  activeEmailId: string | null;
  onEmailSelect: (emailId: string) => void;
  onEmailDelete: (emailId: string) => void;
}

function EmailList({
  emails,
  activeEmailId,
  onEmailSelect,
  onEmailDelete,
}: EmailListProps) {
  const [deletingEmailId, setDeletingEmailId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteClick = useCallback((emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(emailId);
  }, []);

  const handleConfirmDelete = useCallback(async (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingEmailId(emailId);
    setConfirmDeleteId(null);
    
    try {
      await onEmailDelete(emailId);
    } catch (error) {
      console.error('Failed to delete email:', error);
    } finally {
      setDeletingEmailId(null);
    }
  }, [onEmailDelete]);

  const handleCancelDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  }, []);

  const handleExpire = useCallback((emailId: string) => {
    // Email expired, could trigger cleanup or notification
    console.log(`Email ${emailId} has expired`);
  }, []);

  if (emails.length === 0) {
    return (
      <section className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Your Emails
        </h2>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No emails yet
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a temporary email to get started
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Your Emails
      </h2>
      <ul className="space-y-2 sm:space-y-3" role="list">
        {emails.map((email) => (
          <li
            key={email.id}
            onClick={() => onEmailSelect(email.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEmailSelect(email.id);
              }
            }}
            tabIndex={0}
            role="button"
            aria-pressed={activeEmailId === email.id}
            aria-current={activeEmailId === email.id ? 'true' : undefined}
            aria-label={`Email ${email.email}${email.unreadCount > 0 ? `, ${email.unreadCount} unread messages` : ''}`}
            className={`
              p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer min-h-[44px] touch-manipulation
              ${
                activeEmailId === email.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }
            `}
          >
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xs sm:text-sm font-mono text-gray-900 dark:text-gray-100 truncate break-all">
                    {email.email}
                  </p>
                  {email.unreadCount > 0 && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                      {email.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <CountdownTimer
                    expiresAt={email.expiresAt}
                    onExpire={() => handleExpire(email.id)}
                  />
                </div>
              </div>
              <div className="flex-shrink-0">
                {confirmDeleteId === email.id ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={(e) => handleConfirmDelete(email.id, e)}
                      disabled={deletingEmailId === email.id}
                      className="px-3 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors disabled:opacity-50 min-h-[44px] touch-manipulation"
                      aria-label="Confirm delete email"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      disabled={deletingEmailId === email.id}
                      className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded transition-colors disabled:opacity-50 min-h-[44px] touch-manipulation"
                      aria-label="Cancel delete"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleDeleteClick(email.id, e)}
                    disabled={deletingEmailId === email.id}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] touch-manipulation"
                    aria-label="Delete email"
                  >
                    {deletingEmailId === email.id ? (
                      <svg
                        className="animate-spin h-5 w-5"
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
                    ) : (
                      <svg
                        className="h-5 w-5"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(EmailList);

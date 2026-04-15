'use client';

import { useState, memo, useCallback } from 'react';
import { TemporaryEmail, Message } from '@/types';
import CountdownTimer from './CountdownTimer';
import InboxViewer from './InboxViewer';

interface EmailListProps {
  emails: TemporaryEmail[];
  activeEmailId: string | null;
  onEmailSelect: (emailId: string) => void;
  onEmailDelete: (emailId: string) => void;
  activeEmail: TemporaryEmail | null;
  currentMessages: Message[];
  onMessageSelect: (messageId: string) => void;
  isRefreshing: boolean;
}

function EmailList({
  emails,
  activeEmailId,
  onEmailSelect,
  onEmailDelete,
  activeEmail,
  currentMessages,
  onMessageSelect,
  isRefreshing,
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
    return null;
  }

  return (
    <section className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-on-surface mb-1 sm:mb-2">
            Your Active Emails
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Monitoring {emails.length} active ephemeral {emails.length === 1 ? 'session' : 'sessions'}.
          </p>
        </div>
        <button className="hidden sm:flex items-center gap-2 text-sm text-primary hover:text-primary-container transition-colors whitespace-nowrap">
          View All Activity
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      <div className="space-y-3" role="list">
        {emails.map((email) => (
          <div key={email.id}>
            {/* Email Card */}
            <div
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
              aria-expanded={activeEmailId === email.id}
              className={`
                bg-surface-container-low rounded-sm p-3 sm:p-4 transition-all cursor-pointer
                hover:bg-surface-container touch-manipulation
                ${activeEmailId === email.id ? 'ring-1 ring-primary/40' : ''}
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                {/* Left side: Email info */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Unread indicator dot */}
                  {email.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim shadow-glow flex-shrink-0"></span>
                  )}
                  
                  {/* Email address and expiry */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs sm:text-sm text-on-surface truncate mb-1 break-all">
                      {email.email}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant flex-wrap">
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="whitespace-nowrap">Expires in</span>
                      <CountdownTimer
                        expiresAt={email.expiresAt}
                        onExpire={() => handleExpire(email.id)}
                      />
                    </div>
                  </div>
                </div>

                {/* Right side: Message count and actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* Message count and status */}
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-on-surface mb-0.5">
                      {email.unreadCount || 0} Message{email.unreadCount !== 1 ? 's' : ''}
                    </p>
                    {email.unreadCount > 0 && (
                      <p className="text-xs text-secondary-fixed uppercase tracking-wide font-medium">
                        New
                      </p>
                    )}
                    {email.unreadCount === 0 && (
                      <p className="text-xs text-on-surface-variant uppercase tracking-wide">
                        Awaiting
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    {confirmDeleteId === email.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleConfirmDelete(email.id, e)}
                          disabled={deletingEmailId === email.id}
                          className="px-3 py-2 text-xs font-medium text-on-surface bg-surface-bright hover:bg-surface-variant rounded transition-colors min-h-[44px] touch-manipulation"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          disabled={deletingEmailId === email.id}
                          className="px-3 py-2 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors min-h-[44px] touch-manipulation"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEmailSelect(email.id);
                          }}
                          className="p-2.5 text-on-surface-variant hover:text-primary transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
                          aria-label="View inbox"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(email.id, e)}
                          disabled={deletingEmailId === email.id}
                          className="p-2.5 text-on-surface-variant hover:text-on-surface transition-colors min-w-[44px] min-h-[44px] touch-manipulation"
                          aria-label="Delete email"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inbox Viewer - Shows directly below with slide-down animation */}
            <div
              className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${activeEmailId === email.id ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}
              `}
            >
              {activeEmailId === email.id && activeEmail && (
                <InboxViewer
                  email={activeEmail}
                  messages={currentMessages}
                  onMessageSelect={onMessageSelect}
                  isRefreshing={isRefreshing}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(EmailList);

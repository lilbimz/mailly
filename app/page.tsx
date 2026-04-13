'use client';

import { useState } from 'react';
import { useEmailManager } from '@/lib/useEmailManager';
import { useAutoRefresh } from '@/lib/useAutoRefresh';
import EmailCreator from '@/components/EmailCreator';
import InboxViewer from '@/components/InboxViewer';
import { MessageViewer } from '@/components/MessageViewer';
import CountdownTimer from '@/components/CountdownTimer';
import { CopyButton } from '@/components/CopyButton';
import { TemporaryEmail, Message, Duration } from '@/types';

export default function Home() {
  const {
    emails,
    activeEmail,
    createEmail,
    deleteEmail,
    selectEmail,
    refreshEmails,
  } = useEmailManager();

  const { messages, isRefreshing } = useAutoRefresh(
    activeEmail?.id || null,
    15000
  );

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isCreatingEmail, setIsCreatingEmail] = useState(false);

  const handleCreateEmail = async (duration: Duration, domain?: string) => {
    setIsCreatingEmail(true);
    try {
      await createEmail(duration, domain);
      console.log('Email created successfully');
    } catch (error) {
      console.error('Failed to create email:', error);
      throw error; // Re-throw so EmailCreator can handle it
    } finally {
      setIsCreatingEmail(false);
    }
  };

  const handleEmailSelect = (emailId: string) => {
    selectEmail(emailId);
    setSelectedMessage(null); // Clear selected message when switching emails
  };

  const handleEmailDelete = async (emailId: string) => {
    if (confirm('Are you sure you want to delete this email?')) {
      try {
        await deleteEmail(emailId);
      } catch (error) {
        console.error('Failed to delete email:', error);
      }
    }
  };

  const handleMessageSelect = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setSelectedMessage(message);
    }
  };

  const handleMessageClose = () => {
    setSelectedMessage(null);
  };

  const handleEmailExpire = () => {
    // Refresh emails to remove expired ones
    refreshEmails();
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            TempMail Pro
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create temporary disposable email addresses
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Creator Section */}
        <div className="mb-8">
          <EmailCreator onCreateEmail={handleCreateEmail} disabled={isCreatingEmail} />
        </div>

        {/* Active Emails List (Simplified for Sprint 1) */}
        {emails.length > 0 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Active Emails ({emails.length})
              </h2>
              <div className="space-y-3">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all cursor-pointer
                      ${
                        activeEmail?.id === email.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                    onClick={() => handleEmailSelect(email.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-mono text-sm text-gray-900 dark:text-white truncate">
                            {email.email}
                          </p>
                          <CopyButton text={email.email} label="Copy" />
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <CountdownTimer
                            expiresAt={email.expiresAt}
                            onExpire={handleEmailExpire}
                          />
                          {email.unreadCount > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {email.unreadCount} unread
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmailDelete(email.id);
                        }}
                        className="flex-shrink-0 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inbox Viewer Section */}
        {activeEmail && (
          <div className="mb-8">
            <InboxViewer
              email={activeEmail}
              messages={messages}
              onMessageSelect={handleMessageSelect}
              isRefreshing={isRefreshing}
            />
          </div>
        )}

        {/* Empty State */}
        {emails.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No temporary emails yet
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your first temporary email address to get started
            </p>
          </div>
        )}
      </div>

      {/* Message Viewer Modal */}
      {selectedMessage && (
        <MessageViewer message={selectedMessage} onClose={handleMessageClose} />
      )}
    </main>
  );
}

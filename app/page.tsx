'use client';

import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useEmailManager } from '@/lib/useEmailManager';
import { useAutoRefresh } from '@/lib/useAutoRefresh';
import { markMessageAsRead } from '@/lib/localStorage';
import EmailCreator from '@/components/EmailCreator';
import EmailList from '@/components/EmailList';
import InboxViewer from '@/components/InboxViewer';
import { Message, Duration } from '@/types';

// Lazy load MessageViewer component for code splitting
const MessageViewer = lazy(() => import('@/components/MessageViewer').then(module => ({ default: module.default })));

export default function Home() {
  const {
    emails,
    activeEmail,
    createEmail,
    deleteEmail,
    selectEmail,
    updateUnreadCount,
  } = useEmailManager();

  // Store messages per email ID to maintain separate state
  const [messagesByEmail, setMessagesByEmail] = useState<Record<string, Message[]>>({});
  
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Callback for when notification is clicked - show the message
  const handleNotificationClick = useCallback((message: Message) => {
    setSelectedMessage(message);
  }, []);

  const { messages, isRefreshing } = useAutoRefresh(
    activeEmail?.id || null,
    15000,
    handleNotificationClick
  );

  const [isCreatingEmail, setIsCreatingEmail] = useState(false);

  // Store messages for the active email whenever they change
  useEffect(() => {
    if (activeEmail && messages.length >= 0) {
      setMessagesByEmail(prev => ({
        ...prev,
        [activeEmail.id]: messages
      }));
      updateUnreadCount(activeEmail.id, messages);
    }
  }, [activeEmail, messages, updateUnreadCount]);

  // Memoize current messages to avoid recalculating on every render
  const currentMessages = useMemo(() => {
    return activeEmail ? (messagesByEmail[activeEmail.id] || []) : [];
  }, [activeEmail, messagesByEmail]);

  const handleCreateEmail = useCallback(async (duration: Duration, domain?: string) => {
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
  }, [createEmail]);

  const handleEmailSelect = useCallback((emailId: string) => {
    selectEmail(emailId);
    setSelectedMessage(null); // Clear selected message when switching emails
  }, [selectEmail]);

  const handleEmailDelete = useCallback(async (emailId: string) => {
    try {
      await deleteEmail(emailId);
      // Clear messages for deleted email
      setMessagesByEmail(prev => {
        const updated = { ...prev };
        delete updated[emailId];
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete email:', error);
      throw error; // Re-throw so EmailList can handle it
    }
  }, [deleteEmail]);

  const handleMessageSelect = useCallback((messageId: string) => {
    const message = currentMessages.find((m) => m.id === messageId);
    if (message) {
      // Mark message as read in localStorage
      markMessageAsRead(messageId);
      
      // Update the message object to reflect read status
      const updatedMessage = { ...message, isRead: true };
      setSelectedMessage(updatedMessage);
      
      // Trigger unread count update
      if (activeEmail) {
        const updatedMessages = currentMessages.map(m => 
          m.id === messageId ? updatedMessage : m
        );
        // Update the messages in state
        setMessagesByEmail(prev => ({
          ...prev,
          [activeEmail.id]: updatedMessages
        }));
        updateUnreadCount(activeEmail.id, updatedMessages);
      }
    }
  }, [currentMessages, activeEmail, updateUnreadCount]);

  const handleMessageClose = useCallback(() => {
    setSelectedMessage(null);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Mailly
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Create temporary disposable email addresses
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Email Creator Section */}
        <div className="mb-6 sm:mb-8">
          <EmailCreator onCreateEmail={handleCreateEmail} disabled={isCreatingEmail} />
        </div>

        {/* Email List Section */}
        <div className="mb-6 sm:mb-8">
          <EmailList
            emails={emails}
            activeEmailId={activeEmail?.id || null}
            onEmailSelect={handleEmailSelect}
            onEmailDelete={handleEmailDelete}
          />
        </div>

        {/* Inbox Viewer Section */}
        {activeEmail && (
          <div className="mb-6 sm:mb-8">
            <InboxViewer
              email={activeEmail}
              messages={currentMessages}
              onMessageSelect={handleMessageSelect}
              isRefreshing={isRefreshing}
            />
          </div>
        )}

        {/* Empty State */}
        {emails.length === 0 && (
          <section className="text-center py-8 sm:py-12">
            <svg
              className="mx-auto h-12 sm:h-16 w-12 sm:w-16 text-gray-400 dark:text-gray-600"
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
            <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900 dark:text-white">
              No temporary emails yet
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Create your first temporary email address to get started
            </p>
          </section>
        )}
      </div>

      {/* Message Viewer Modal */}
      {selectedMessage && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-8 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading message...</p>
              </div>
            </div>
          </div>
        }>
          <MessageViewer message={selectedMessage} onClose={handleMessageClose} />
        </Suspense>
      )}
    </main>
  );
}

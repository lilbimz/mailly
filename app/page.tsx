'use client';

import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useEmailManager } from '@/lib/useEmailManager';
import { useAutoRefresh } from '@/lib/useAutoRefresh';
import { markMessageAsRead } from '@/lib/localStorage';
import EmailCreator from '@/components/EmailCreator';
import EmailList from '@/components/EmailList';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Header from '@/components/Header';
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
      setMessagesByEmail(prev => {
        const prevMessages = prev[activeEmail.id] || [];
        // Only update if messages actually changed to prevent infinite loop
        if (JSON.stringify(prevMessages) !== JSON.stringify(messages)) {
          return {
            ...prev,
            [activeEmail.id]: messages
          };
        }
        return prev;
      });
      updateUnreadCount(activeEmail.id, messages);
    }
  }, [activeEmail?.id, messages, updateUnreadCount]);

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
    // Only clear selected message if we're switching to a different email or deselecting
    if (activeEmail?.id !== emailId) {
      setSelectedMessage(null);
    }
  }, [selectEmail, activeEmail]);

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
    <main className="min-h-screen bg-midnight">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Email Creator Section */}
      <div className="max-w-lg mx-auto px-3 sm:px-4 lg:px-8 -mt-2 sm:-mt-4">
        <EmailCreator onCreateEmail={handleCreateEmail} disabled={isCreatingEmail} />
      </div>

      {/* Email List Section with Integrated Inbox */}
      {emails.length > 0 && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 mt-12 sm:mt-16">
          <EmailList
            emails={emails}
            activeEmailId={activeEmail?.id || null}
            onEmailSelect={handleEmailSelect}
            onEmailDelete={handleEmailDelete}
            activeEmail={activeEmail}
            currentMessages={currentMessages}
            onMessageSelect={handleMessageSelect}
            isRefreshing={isRefreshing}
          />
        </div>
      )}

      {/* Features Section */}
      <Features />

      {/* Footer */}
      <footer className="bg-surface-container-lowest py-8 sm:py-12 mt-16 sm:mt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-display text-sm sm:text-base text-on-surface mb-1 sm:mb-2">Mailly</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant">© 2026 Mailly Sanctuary. Built for the ephemeral.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-on-surface-variant">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Status</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Message Viewer Modal */}
      {selectedMessage && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="glass rounded-xl shadow-ambient max-w-3xl w-full p-8 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-on-surface-variant">Loading message...</p>
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

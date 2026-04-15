'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitStatus('success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitStatus('idle'), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <main className="min-h-screen bg-midnight relative pt-[72px]">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute -top-48 left-1/4 w-[500px] h-[500px] bg-[#36ffc4]/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-[#2ee0ad]/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#36ffc4]/10 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '8s', animationDelay: '2s' }} />
      </div>

      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-[#36ffc4] via-[#2ee0ad] to-[#36ffc4] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Contact Us
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up" 
             style={{ animationDelay: '0.1s' }}>
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 animate-fade-in-up" 
               style={{ animationDelay: '0.2s' }}>
            <h2 className="font-display text-xl text-on-surface mb-6">Send us a message</h2>
            
            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-[#36ffc4]/20 border border-[#36ffc4]/50 rounded-lg text-[#36ffc4]">
                Thank you! Your message has been sent successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-on-surface mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline focus:border-[#36ffc4] focus:outline-none text-on-surface transition-colors"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline focus:border-[#36ffc4] focus:outline-none text-on-surface transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-on-surface mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline focus:border-[#36ffc4] focus:outline-none text-on-surface transition-colors"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-on-surface mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline focus:border-[#36ffc4] focus:outline-none text-on-surface resize-none transition-colors"
                  placeholder="Tell us more..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 sm:py-3 px-6 rounded-lg font-display font-semibold text-sm sm:text-base bg-gradient-to-r from-[#36ffc4] to-[#2ee0ad] text-midnight hover:from-[#2ee0ad] hover:to-[#36ffc4] transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#36ffc4]/50 min-h-[48px] sm:min-h-[44px] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="glass rounded-lg p-6 border border-[#36ffc4]/10 animate-fade-in-up" 
                 style={{ animationDelay: '0.3s' }}>
              <h3 className="font-display text-lg text-on-surface mb-4">Other ways to reach us</h3>
              <div className="space-y-4 text-on-surface-variant">
                <div>
                  <h4 className="text-on-surface font-medium mb-1">Email</h4>
                  <a href="mailto:naranta.labs@gmail.com" className="text-[#36ffc4] hover:text-[#2ee0ad] transition-colors">
                    naranta.labs@gmail.com
                  </a>
                </div>
                <div>
                  <h4 className="text-on-surface font-medium mb-1">Response Time</h4>
                  <p>We typically respond within 24-48 hours</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-lg p-6 border border-[#36ffc4]/10 animate-fade-in-up" 
                 style={{ animationDelay: '0.4s' }}>
              <h3 className="font-display text-lg text-on-surface mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="text-on-surface font-medium mb-1">How long do emails last?</h4>
                  <p className="text-on-surface-variant">
                    You can choose between 10 minutes to 24 hours when creating an email.
                  </p>
                </div>
                <div>
                  <h4 className="text-on-surface font-medium mb-1">Is my data secure?</h4>
                  <p className="text-on-surface-variant">
                    Yes, all emails are automatically deleted after expiration. See our{' '}
                    <Link href="/privacy" className="text-[#36ffc4] hover:text-[#2ee0ad] transition-colors">Privacy Policy</Link>.
                  </p>
                </div>
                <div>
                  <h4 className="text-on-surface font-medium mb-1">Can I recover deleted emails?</h4>
                  <p className="text-on-surface-variant">
                    No, once an email expires or is deleted, it cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass rounded-lg p-6 border border-[#36ffc4]/10 animate-fade-in-up" 
                 style={{ animationDelay: '0.5s' }}>
              <h3 className="font-display text-lg text-on-surface mb-4">Check System Status</h3>
              <p className="text-on-surface-variant mb-4">
                Having technical issues? Check our status page for any ongoing incidents.
              </p>
              <Link 
                href="/status" 
                className="inline-block bg-surface-container hover:bg-surface-container-high text-on-surface font-medium py-2 px-4 rounded-lg transition-colors"
              >
                View Status Page
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <Link 
            href="/" 
            className="text-[#36ffc4] hover:text-[#2ee0ad] inline-flex items-center gap-2 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

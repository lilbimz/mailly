import Header from '@/components/Header';
import Link from 'next/link';
import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Mailly Temporary Email',
  description: 'Find answers to common questions about Mailly temporary email service. Learn about email duration, security, privacy, and more.',
  openGraph: {
    title: 'FAQ - Mailly',
    description: 'Frequently asked questions about Mailly temporary email service.',
  },
};

const faqs = [
  {
    question: 'What is a temporary email address?',
    answer: 'A temporary email address is a disposable email that expires after a set time period. It allows you to receive emails without using your personal email address, protecting your privacy and reducing spam.',
  },
  {
    question: 'How long do temporary emails last?',
    answer: 'You can choose the duration when creating an email: 10 minutes, 1 hour, or 24 hours. After this time, the email address and all received messages are automatically deleted.',
  },
  {
    question: 'Is Mailly free to use?',
    answer: 'Yes, Mailly is completely free. You can create unlimited temporary email addresses without any registration or payment required.',
  },
  {
    question: 'Do I need to register to use Mailly?',
    answer: 'No registration is required. Simply visit the website and create a temporary email address instantly. Your email addresses are stored locally in your browser.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. All emails are transmitted using TLS encryption. Emails are automatically deleted after expiration, and we don&apos;t track your activity or collect personal information.',
  },
  {
    question: 'Can I recover deleted emails?',
    answer: 'No. Once an email expires or is manually deleted, it cannot be recovered. This is by design to ensure your privacy.',
  },
  {
    question: 'How many emails can I create?',
    answer: 'You can create multiple temporary email addresses. However, we implement rate limiting to prevent abuse and ensure fair usage for all users.',
  },
  {
    question: 'Can I send emails from temporary addresses?',
    answer: 'Currently, Mailly only supports receiving emails. You cannot send emails from temporary addresses.',
  },
  {
    question: 'What happens if I close my browser?',
    answer: 'Your email addresses are stored in your browser&apos;s localStorage. If you clear your browser data, you&apos;ll lose access to your email list, but the emails will still expire at their scheduled time.',
  },
  {
    question: 'Can I use Mailly for account verification?',
    answer: 'Yes, temporary emails work great for one-time verifications, newsletter signups, and testing services. However, don&apos;t use them for important accounts you need long-term access to.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
};

export default function FAQ() {
  return (
    <main className="min-h-screen bg-midnight relative pt-[72px]">
      {/* FAQ Schema for Rich Snippets */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Animated Background Gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute -top-48 left-1/4 w-[500px] h-[500px] bg-[#36ffc4]/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-[#2ee0ad]/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-[#36ffc4] via-[#2ee0ad] to-[#36ffc4] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              Frequently Asked Questions
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about Mailly temporary email service
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details 
              key={index}
              className="glass rounded-lg border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <summary className="cursor-pointer p-6 font-display text-lg text-on-surface hover:text-[#36ffc4] transition-colors list-none flex items-center justify-between">
                <span>{faq.question}</span>
                <svg 
                  className="w-5 h-5 text-[#36ffc4] transition-transform group-open:rotate-180" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-on-surface-variant leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 text-center">
          <h2 className="font-display text-xl text-on-surface mb-4">Still have questions?</h2>
          <p className="text-on-surface-variant mb-6">
            Can&apos;t find the answer you&apos;re looking for? Feel free to reach out to our support team.
          </p>
          <Link 
            href="/contact"
            className="inline-block py-3 px-6 rounded-lg font-display font-semibold bg-gradient-to-r from-[#36ffc4] to-[#2ee0ad] text-midnight hover:from-[#2ee0ad] hover:to-[#36ffc4] transition-all duration-300 hover:scale-105"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-8 animate-fade-in">
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

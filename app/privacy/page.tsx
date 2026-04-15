import Header from '@/components/Header';
import Link from 'next/link';

export default function PrivacyPolicy() {
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
              Privacy Policy
            </span>
          </h1>
        </div>
        
        <div className="glass rounded-lg p-6 sm:p-8 space-y-6 text-on-surface-variant border border-[#36ffc4]/10 animate-fade-in-up" 
             style={{ animationDelay: '0.1s' }}>
          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to Mailly. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we handle your information when you use our temporary email service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">2. Data We Collect</h2>
            <p className="leading-relaxed mb-3">
              Mailly is designed with privacy in mind. We collect minimal data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Temporary email addresses you create (stored locally in your browser)</li>
              <li>Email messages received (automatically deleted after expiration)</li>
              <li>Basic usage analytics (anonymized)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">3. How We Use Your Data</h2>
            <p className="leading-relaxed">
              Your data is used solely to provide the temporary email service. We do not sell, share, 
              or use your data for marketing purposes. All emails are automatically deleted after their 
              expiration time.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">4. Data Storage</h2>
            <p className="leading-relaxed">
              Email addresses and preferences are stored locally in your browser using localStorage. 
              Received emails are temporarily stored on our servers and automatically deleted after 
              the specified duration (10 minutes to 24 hours).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">5. Your Rights</h2>
            <p className="leading-relaxed">
              You have the right to delete your temporary email addresses at any time. Simply click 
              the delete button in the email list. All associated messages will be permanently removed.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">6. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this privacy policy, please{' '}
              <Link href="/contact" className="text-[#36ffc4] hover:text-[#2ee0ad] transition-colors">contact us</Link>.
            </p>
          </section>

          <p className="text-sm text-on-surface-variant pt-4 border-t border-outline-variant">
            Last updated: April 15, 2026
          </p>
        </div>

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
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

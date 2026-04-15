import Header from '@/components/Header';
import Link from 'next/link';

export default function TermsOfService() {
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
              Terms of Service
            </span>
          </h1>
        </div>
        
        <div className="glass rounded-lg p-6 sm:p-8 space-y-6 text-on-surface-variant border border-[#36ffc4]/10 animate-fade-in-up" 
             style={{ animationDelay: '0.1s' }}>
          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Mailly, you accept and agree to be bound by the terms and provisions 
              of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">2. Service Description</h2>
            <p className="leading-relaxed">
              Mailly provides temporary, disposable email addresses for short-term use. All email addresses 
              and their contents are automatically deleted after the specified expiration time (10 minutes to 24 hours).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">3. Acceptable Use</h2>
            <p className="leading-relaxed mb-3">
              You agree not to use Mailly for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Illegal activities or purposes</li>
              <li>Spam, phishing, or fraudulent activities</li>
              <li>Harassment or abuse of others</li>
              <li>Circumventing security measures of other services</li>
              <li>Any activity that violates applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">4. Service Limitations</h2>
            <p className="leading-relaxed mb-3">
              Please note:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Emails are temporary and will be automatically deleted</li>
              <li>We do not guarantee delivery of all emails</li>
              <li>The service is provided "as is" without warranties</li>
              <li>We reserve the right to modify or discontinue the service at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">5. Privacy and Data</h2>
            <p className="leading-relaxed">
              Your use of Mailly is also governed by our{' '}
              <Link href="/privacy" className="text-[#36ffc4] hover:text-[#2ee0ad] transition-colors">Privacy Policy</Link>. 
              Please review it to understand how we handle your data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">6. Limitation of Liability</h2>
            <p className="leading-relaxed">
              Mailly and its operators shall not be liable for any damages arising from the use or inability 
              to use the service, including but not limited to loss of data, business interruption, or any 
              other commercial damages or losses.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">7. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after 
              changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl sm:text-2xl text-on-surface mb-4">8. Contact</h2>
            <p className="leading-relaxed">
              For questions about these terms, please{' '}
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

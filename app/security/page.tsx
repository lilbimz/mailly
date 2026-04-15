import Header from '@/components/Header';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security & Privacy - Mailly Secure Temporary Email',
  description: 'Mailly uses end-to-end encryption, automatic deletion, and no tracking to protect your privacy. Learn about our security measures.',
  openGraph: {
    title: 'Security & Privacy - Mailly',
    description: 'Learn how Mailly keeps your temporary emails secure with encryption and automatic deletion.',
  },
};

export default function Security() {
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
              Security & Privacy
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up" 
             style={{ animationDelay: '0.1s' }}>
            Your privacy and security are our top priorities. Learn how we protect your data.
          </p>
        </div>

        <div className="space-y-6">
          {/* Encryption */}
          <div className="glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up" 
               style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#36ffc4]/20 to-[#36ffc4]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#36ffc4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl text-on-surface mb-3">End-to-End Encryption</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  All emails are transmitted using industry-standard TLS encryption. Your messages are 
                  protected during transit and at rest on our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Auto-Delete */}
          <div className="glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up" 
               style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2ee0ad]/20 to-[#2ee0ad]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#2ee0ad]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl text-on-surface mb-3">Automatic Deletion</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  All temporary email addresses and their contents are automatically deleted after the 
                  specified expiration time. No data is retained beyond the chosen duration.
                </p>
              </div>
            </div>
          </div>

          {/* No Tracking */}
          <div className="glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up" 
               style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#36ffc4]/20 to-[#36ffc4]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#36ffc4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl text-on-surface mb-3">No Tracking or Analytics</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  We don&apos;t track your activity, collect personal information, or use invasive analytics. 
                  Your email usage remains completely private.
                </p>
              </div>
            </div>
          </div>

          {/* Local Storage */}
          <div className="glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up" 
               style={{ animationDelay: '0.5s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2ee0ad]/20 to-[#2ee0ad]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#2ee0ad]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl text-on-surface mb-3">Browser-Based Storage</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Your email addresses are stored locally in your browser using localStorage. We never 
                  store your email list on our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Open Source */}
          <div className="glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up" 
               style={{ animationDelay: '0.6s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#36ffc4]/20 to-[#36ffc4]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#36ffc4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl text-on-surface mb-3">Transparent & Auditable</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  Our security practices are transparent. You can review our{' '}
                  <Link href="/privacy" className="text-[#36ffc4] hover:text-[#2ee0ad] transition-colors">Privacy Policy</Link>
                  {' '}to understand exactly how we handle your data.
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up" 
               style={{ animationDelay: '0.7s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#2ee0ad]/20 to-[#2ee0ad]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#2ee0ad]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-xl text-on-surface mb-3">Abuse Prevention</h2>
                <p className="text-on-surface-variant leading-relaxed">
                  We implement rate limiting and abuse prevention measures to protect our service and 
                  ensure fair usage for all users.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.8s' }}>
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

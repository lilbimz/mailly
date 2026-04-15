import Header from '@/components/Header';
import Link from 'next/link';

export default function ApiDocs() {
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
          {/* Coming Soon Badge with Glow */}
          <div className="inline-block relative mb-6">
            <div className="absolute inset-0 bg-[#36ffc4]/30 rounded-full blur-xl animate-pulse" />
            <div className="relative px-6 py-2 bg-gradient-to-r from-[#36ffc4]/30 to-[#2ee0ad]/30 rounded-full border border-[#36ffc4]/50">
              <span className="text-[#36ffc4] font-medium text-sm tracking-wider uppercase flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Coming Soon
              </span>
            </div>
          </div>

          {/* Title with Gradient */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 animate-fade-in-up" 
              style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-[#36ffc4] via-[#2ee0ad] to-[#36ffc4] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              API Documentation
            </span>
          </h1>
          
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up" 
             style={{ animationDelay: '0.2s' }}>
            We&apos;re working on a comprehensive API that will allow developers to integrate Mailly&apos;s 
            temporary email service into their applications.
          </p>

          {/* Decorative Code Snippet Preview */}
          <div className="mt-8 max-w-md mx-auto glass rounded-lg p-4 text-left animate-fade-in-up" 
               style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <code className="text-sm text-[#36ffc4] font-mono block">
              <span className="text-[#2ee0ad]">POST</span> /api/email/create
            </code>
            <code className="text-xs text-on-surface-variant font-mono block mt-2">
              {'{ "duration": "1h" }'}
            </code>
          </div>
        </div>

        {/* Planned Features */}
        <div className="glass rounded-lg p-6 sm:p-8 mb-8 border border-[#36ffc4]/10 animate-fade-in-up" 
             style={{ animationDelay: '0.4s' }}>
          <h2 className="font-display text-2xl text-on-surface mb-8 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#36ffc4] to-[#2ee0ad] flex items-center justify-center">
              <svg className="w-5 h-5 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            Planned API Features
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="group glass rounded-lg p-4 hover:border-[#36ffc4]/30 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#36ffc4]/20 to-[#36ffc4]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[#36ffc4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-on-surface font-semibold mb-2">Create Temporary Emails</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Programmatically generate temporary email addresses with custom durations
              </p>
            </div>

            <div className="group glass rounded-lg p-4 hover:border-[#36ffc4]/30 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2ee0ad]/20 to-[#2ee0ad]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[#2ee0ad]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-on-surface font-semibold mb-2">Retrieve Messages</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Fetch incoming messages for your temporary email addresses
              </p>
            </div>

            <div className="group glass rounded-lg p-4 hover:border-[#36ffc4]/30 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#36ffc4]/20 to-[#36ffc4]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[#36ffc4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-on-surface font-semibold mb-2">Webhook Support</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Get real-time notifications when new messages arrive
              </p>
            </div>

            <div className="group glass rounded-lg p-4 hover:border-[#36ffc4]/30 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2ee0ad]/20 to-[#2ee0ad]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[#2ee0ad]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-on-surface font-semibold mb-2">RESTful API</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Simple, intuitive REST API with JSON responses
              </p>
            </div>

            <div className="group glass rounded-lg p-4 hover:border-[#36ffc4]/30 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#36ffc4]/20 to-[#36ffc4]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[#36ffc4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-on-surface font-semibold mb-2">Rate Limiting</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Fair usage policies with generous rate limits
              </p>
            </div>

            <div className="group glass rounded-lg p-4 hover:border-[#36ffc4]/30 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2ee0ad]/20 to-[#2ee0ad]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-[#2ee0ad]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-on-surface font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Secure API key authentication for all requests
              </p>
            </div>
          </div>
        </div>

        {/* Get Notified */}
        <div className="relative glass rounded-lg p-8 text-center border border-[#36ffc4]/20 animate-fade-in-up overflow-hidden" 
             style={{ animationDelay: '0.5s' }}>
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#36ffc4]/5 via-[#2ee0ad]/5 to-[#36ffc4]/5 animate-gradient bg-[length:200%_auto]" />
          
          <div className="relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#36ffc4] to-[#2ee0ad] flex items-center justify-center">
              <svg className="w-8 h-8 text-midnight" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="font-display text-2xl text-on-surface mb-3">Get Notified</h2>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
              Want to be notified when the API launches? Get in touch with us and be the first to know.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#36ffc4] to-[#2ee0ad] hover:from-[#2ee0ad] hover:to-[#36ffc4] text-midnight font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#36ffc4]/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Us
            </Link>
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

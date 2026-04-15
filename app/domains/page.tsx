import Header from '@/components/Header';
import Link from 'next/link';

export default function Domains() {
  const domains = [
    { 
      name: 'nondon.store', 
      status: 'active',
      reliability: 'High',
      description: 'Our most reliable domain with excellent deliverability'
    },
    { 
      name: 'norion.shop', 
      status: 'active',
      reliability: 'High',
      description: 'Stable domain with consistent performance'
    },
    { 
      name: 'noniton.store', 
      status: 'active',
      reliability: 'Medium',
      description: 'Good alternative domain for general use'
    },
  ];

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
              Available Domains
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up" 
             style={{ animationDelay: '0.1s' }}>
            Choose from our curated list of reliable domains for your temporary email addresses.
          </p>
        </div>

        {/* Domain List */}
        <div className="space-y-4 mb-12">
          {domains.map((domain, index) => (
            <div key={domain.name} className="glass rounded-lg p-6 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up" 
                 style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-display text-xl text-[#36ffc4] font-mono">
                      @{domain.name}
                    </h2>
                    <span className="px-2 py-1 text-xs rounded-full bg-[#36ffc4]/20 text-[#36ffc4]">
                      {domain.status}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-2">
                    {domain.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">Reliability:</span>
                    <span className={`text-xs font-medium ${
                      domain.reliability === 'High' ? 'text-[#36ffc4]' : 'text-[#2ee0ad]'
                    }`}>
                      {domain.reliability}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Domain Information */}
        <div className="glass rounded-lg p-6 sm:p-8 mb-8 border border-[#36ffc4]/10 animate-fade-in-up" 
             style={{ animationDelay: '0.5s' }}>
          <h2 className="font-display text-xl text-on-surface mb-4">About Our Domains</h2>
          <div className="space-y-4 text-on-surface-variant">
            <div>
              <h3 className="text-on-surface font-medium mb-2">Domain Selection</h3>
              <p className="text-sm leading-relaxed">
                We carefully select and maintain domains that offer the best deliverability and reliability. 
                Each domain is monitored for performance and spam reputation.
              </p>
            </div>
            <div>
              <h3 className="text-on-surface font-medium mb-2">Random Domain Option</h3>
              <p className="text-sm leading-relaxed">
                When creating an email, you can choose "Random Domain" to let our system automatically 
                select the best available domain based on current performance metrics.
              </p>
            </div>
            <div>
              <h3 className="text-on-surface font-medium mb-2">Domain Rotation</h3>
              <p className="text-sm leading-relaxed">
                We periodically rotate and update our domain pool to maintain optimal service quality 
                and avoid spam filters.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="glass rounded-lg p-6 sm:p-8 border border-[#36ffc4]/10 animate-fade-in-up" 
             style={{ animationDelay: '0.6s' }}>
          <h2 className="font-display text-xl text-on-surface mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-on-surface font-medium mb-2">Can I use my own domain?</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Currently, we only support our curated list of domains to ensure reliability and security. 
                Custom domain support may be added in the future.
              </p>
            </div>
            <div>
              <h3 className="text-on-surface font-medium mb-2">Which domain should I choose?</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                We recommend using nondon.store for the best reliability. However, all our domains are 
                regularly tested and maintained for optimal performance.
              </p>
            </div>
            <div>
              <h3 className="text-on-surface font-medium mb-2">What if a domain stops working?</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                If you experience issues with a specific domain, try creating a new email with a different 
                domain or use the "Random Domain" option. Check our{' '}
                <Link href="/status" className="text-[#36ffc4] hover:text-[#2ee0ad] transition-colors">Status Page</Link>
                {' '}for real-time domain health information.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.7s' }}>
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

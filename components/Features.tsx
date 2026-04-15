'use client';

import { memo } from 'react';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant',
    description: 'One click is all it takes to vanish.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure',
    description: 'Advanced AES-256 encryption on all temporary buffers.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Protected',
    description: 'Multi-layer security protocols protect your data.',
  },
];

const detailFeatures = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Advanced Encryption',
    description: 'Advanced AES-256 encryption on all temporary buffers ensuring your real identity never hits the open web.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: 'Custom Domains',
    description: 'Use premium domains for enterprise testing.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    title: 'Auto-Purge',
    description: 'Complete forensic destruction of all data post-expiry.',
  },
];

function Features() {
  return (
    <section className="py-12 sm:py-16 px-3 sm:px-4" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Hero Feature Section */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-3 sm:mb-4 font-medium">
            Engineered for Speed
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-on-surface mb-6 sm:mb-8 font-bold px-2">
            One click is all it takes to vanish.
          </h2>
          
          {/* Icon Row */}
          <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 flex-wrap px-2">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center min-w-[80px]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-midnight mb-2 sm:mb-3">
                  {feature.icon}
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant font-medium">{feature.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {detailFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-surface-container-low rounded-sm p-5 sm:p-6 hover:bg-surface-container transition-all"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary-fixed/10 flex items-center justify-center text-secondary-fixed mb-3 sm:mb-4">
                {feature.icon}
              </div>
              <h3 className="font-display text-sm sm:text-base text-on-surface mb-2 font-semibold">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Privacy Section */}
        <div className="bg-surface-container-low rounded-sm p-8 sm:p-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-on-surface mb-3 sm:mb-4 font-bold px-2">
            Unmatched Privacy Layers
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed px-4">
            Our infrastructure sits on a zero-knowledge mesh, meaning even we can&apos;t see who you are communicating with.
          </p>
        </div>
      </div>
    </section>
  );
}

export default memo(Features);

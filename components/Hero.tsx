'use client';

import { memo } from 'react';

function Hero() {
  return (
    <section className="relative py-8 sm:py-12 md:py-16 px-3 sm:px-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-secondary-fixed/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-2 sm:mb-3 leading-tight tracking-tight px-2">
          The Digital Sanctuary
        </h1>
        <p className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-on-surface mb-4 sm:mb-6 leading-tight tracking-tight px-2">
          for your privacy.
        </p>
        
        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed px-4">
          Redefining temporary communication. Experience ephemeral email with the elegance of a premium tool. Built for the swift and the secure.
        </p>
      </div>
    </section>
  );
}

export default memo(Hero);

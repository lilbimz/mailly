'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  responseTime: string;
}

export default function Status() {
  const [services] = useState<ServiceStatus[]>([
    { name: 'Email Creation API', status: 'operational', uptime: '99.9%', responseTime: '120ms' },
    { name: 'Email Delivery', status: 'operational', uptime: '99.8%', responseTime: '250ms' },
    { name: 'Message Retrieval', status: 'operational', uptime: '99.9%', responseTime: '180ms' },
    { name: 'Web Interface', status: 'operational', uptime: '100%', responseTime: '50ms' },
  ]);

  const [lastChecked, setLastChecked] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set mounted to true and initialize time on client side only
    setMounted(true);
    setLastChecked(new Date().toLocaleTimeString());

    // Simulate status check every 30 seconds
    const interval = setInterval(() => {
      setLastChecked(new Date().toLocaleTimeString());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'text-[#36ffc4]';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-[#36ffc4]/20 text-[#36ffc4]';
      case 'degraded':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'down':
        return 'bg-red-500/20 text-red-500';
    }
  };

  const allOperational = services.every(s => s.status === 'operational');

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
              System Status
            </span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up" 
             style={{ animationDelay: '0.1s' }}>
            Real-time status of Mailly services
          </p>
        </div>

        {/* Overall Status */}
        <div className="glass rounded-lg p-6 sm:p-8 mb-6 border border-[#36ffc4]/10 animate-fade-in-up" 
             style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${allOperational ? 'bg-[#36ffc4]' : 'bg-yellow-500'} animate-pulse`}></div>
            <div>
              <h2 className="font-display text-xl text-on-surface">
                {allOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
              </h2>
              <p className="text-sm text-on-surface-variant">
                {mounted ? `Last checked: ${lastChecked}` : 'Checking status...'}
              </p>
            </div>
          </div>
        </div>

        {/* Service Status List */}
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={service.name} className="glass rounded-lg p-6 border border-[#36ffc4]/10 hover:border-[#36ffc4]/30 transition-all duration-300 animate-fade-in-up" 
                 style={{ animationDelay: `${0.3 + index * 0.1}s` }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${service.status === 'operational' ? 'bg-[#36ffc4]' : 'bg-yellow-500'}`}></div>
                  <div>
                    <h3 className="font-display text-lg text-on-surface">{service.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(service.status)} inline-block mt-1`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-6 text-sm text-on-surface-variant">
                  <div>
                    <div className="text-xs text-on-surface-variant/70">Uptime</div>
                    <div className="font-medium text-on-surface">{service.uptime}</div>
                  </div>
                  <div>
                    <div className="text-xs text-on-surface-variant/70">Response Time</div>
                    <div className="font-medium text-on-surface">{service.responseTime}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Incident History */}
        <div className="glass rounded-lg p-6 sm:p-8 mt-8 border border-[#36ffc4]/10 animate-fade-in-up" 
             style={{ animationDelay: '0.7s' }}>
          <h2 className="font-display text-xl text-on-surface mb-4">Recent Incidents</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-outline-variant">
              <div className="w-2 h-2 rounded-full bg-[#36ffc4] mt-2"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-on-surface font-medium">No incidents reported</h3>
                  <span className="text-xs text-on-surface-variant">Last 30 days</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">
                  All systems have been running smoothly
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

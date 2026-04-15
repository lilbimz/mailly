/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable production optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimize bundle size with tree-shaking
  experimental: {
    optimizePackageImports: ['dompurify'],
  },
  
  // Enable SWC minification for better tree-shaking
  swcMinify: true,
  
  // SEO: Generate trailing slashes for better URL structure
  trailingSlash: false,
  
  // SEO: Compress responses
  compress: true,
  
  // SEO: Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};

export default nextConfig;

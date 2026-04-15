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
};

export default nextConfig;

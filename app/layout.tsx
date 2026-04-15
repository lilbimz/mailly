import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { baseMetadata } from "./metadata";
import Script from "next/script";

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {/* JSON-LD Structured Data */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Mailly',
              description: 'Free temporary disposable email service for privacy protection',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://mailly.app',
              applicationCategory: 'UtilityApplication',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              creator: {
                '@type': 'Organization',
                name: 'Naranta Labs',
              },
              featureList: [
                'Create temporary email addresses',
                'Auto-refresh inbox',
                'Dark mode support',
                'Browser notifications',
                'No registration required',
              ],
            }),
          }}
        />
        
        <ErrorBoundary>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}

import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mailly.app';

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Mailly - Temporary Disposable Email Addresses | Free Temp Mail',
    template: '%s | Mailly',
  },
  description: 'Create free temporary disposable email addresses instantly. Protect your privacy with Mailly - secure, anonymous temp mail service. No registration required.',
  keywords: [
    'temporary email',
    'disposable email',
    'temp mail',
    'fake email',
    'anonymous email',
    'email privacy',
    'temporary inbox',
    'disposable inbox',
    'free temp mail',
    'email generator',
    'privacy protection',
    'spam protection',
  ],
  authors: [{ name: 'Naranta Labs' }],
  creator: 'Naranta Labs',
  publisher: 'Mailly',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Mailly',
    title: 'Mailly - Free Temporary Disposable Email Addresses',
    description: 'Create temporary email addresses instantly. Protect your privacy with secure, anonymous temp mail service. No registration required.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Mailly - Temporary Email Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mailly - Free Temporary Disposable Email',
    description: 'Create temporary email addresses instantly. Protect your privacy with secure temp mail.',
    images: ['/twitter-image.png'],
    creator: '@mailly',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon-mailly.png',
    shortcut: '/favicon-mailly.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    other: {
      bing: 'your-bing-verification-code',
    },
  },
};

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
    icon: [
      { url: '/favicon-mailly.png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon-mailly.png',
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        url: '/favicon-mailly.png',
      },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '3bWNwCcMIBlbu8NEIG4ObvU_Az5xZGNfCUS-K0EpSws',
    yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || 'A24F016A70AA0EDD2F8BE51D25466531',
    },
  },
};

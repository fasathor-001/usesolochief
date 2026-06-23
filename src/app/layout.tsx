import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F8F9FA' },
    { media: '(prefers-color-scheme: dark)',  color: '#111827' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const DESCRIPTION = 'Your personal Chief of Staff for commitments, focus, and follow-ups.'

export const metadata: Metadata = {
  metadataBase: new URL('https://solochief.app'),
  title: 'SoloChief AI',
  description: DESCRIPTION,
  applicationName: 'SoloChief AI',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SoloChief',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'SoloChief AI',
    description: DESCRIPTION,
    url: 'https://solochief.app',
    siteName: 'SoloChief AI',
    images: [
      { url: '/og/solochief-og.png', width: 1200, height: 630, alt: 'SoloChief AI' },
    ],
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoloChief AI',
    description: DESCRIPTION,
    images: ['/og/solochief-twitter.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full">
        {children}
        <Toaster richColors closeButton position="bottom-right" />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}

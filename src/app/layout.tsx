import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Winter Arc 90 — Personal Operating System',
    template: '%s | Winter Arc 90',
  },
  description:
    'Your private 90-day operating system for discipline, career growth, health, and purpose. Day 1 to Day 90.',
  keywords: ['habit tracker', 'goal tracker', 'discipline', 'career', 'Winter Arc', 'productivity'],
  authors: [{ name: 'Winter Arc' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Winter Arc',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: 'Winter Arc 90',
    description: 'Your private 90-day personal operating system.',
    siteName: 'Winter Arc 90',
  },
  robots: {
    index: false, // Private app
    follow: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#3b5bdb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

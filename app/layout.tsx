import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ReactQueryProvider } from '@/lib/providers/ReactQueryProvider'
import { ToastProvider } from '@/lib/providers/ToastProvider'
import { PWARegistration } from '@/components/layout/PWARegistration'

export const metadata: Metadata = {
  title: {
    default: 'DAITJI - 다있지',
    template: '%s | DAITJI',
  },
  description: '집안 물건의 위치와 수명을 관리하는 하이브리드 앱',
  manifest: '/manifest.webmanifest',
  keywords: ['물건 관리', '위치 추적', '수명 관리', '가정용품', '정리정돈'],
  authors: [{ name: 'DAITJI Team' }],
  creator: 'DAITJI',
  publisher: 'DAITJI',
  applicationName: 'DAITJI',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DAITJI',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-maskable.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    title: 'DAITJI - 다있지',
    description: '집안 물건의 위치와 수명을 관리하는 하이브리드 앱',
    siteName: 'DAITJI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DAITJI - 다있지',
    description: '집안 물건의 위치와 수명을 관리하는 하이브리드 앱',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0b1112',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ReactQueryProvider>
          <ToastProvider>
            <PWARegistration />
            {children}
            {modal}
          </ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}

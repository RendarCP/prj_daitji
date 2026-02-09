import type { Metadata } from 'next'
import './globals.css'
import { ReactQueryProvider } from '@/lib/providers/ReactQueryProvider'

export const metadata: Metadata = {
  title: {
    default: 'DAITJI - 다있지',
    template: '%s | DAITJI',
  },
  description: '집안 물건의 위치와 수명을 관리하는 하이브리드 앱',
  keywords: ['물건 관리', '위치 추적', '수명 관리', '가정용품', '정리정돈'],
  authors: [{ name: 'DAITJI Team' }],
  creator: 'DAITJI',
  publisher: 'DAITJI',
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
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
          {children}
          {modal}
        </ReactQueryProvider>
      </body>
    </html>
  )
}

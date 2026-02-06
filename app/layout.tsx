import type { Metadata } from 'next'
import './globals.css'

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
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen">
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b border-secondary-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container mx-auto flex h-16 items-center px-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary-600">DAITJI</span>
                <span className="text-sm text-secondary-500">다있지</span>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t border-secondary-200 bg-white">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm text-secondary-500">
                © {new Date().getFullYear()} DAITJI. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

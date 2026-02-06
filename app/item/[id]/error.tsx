'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export default function ItemDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Item detail error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <main className="pb-24 pt-16">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Card>
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                오류가 발생했습니다
              </h2>
              <p className="text-secondary-600 mb-6">
                물품 정보를 불러오는 중 문제가 발생했습니다.
              </p>

              <Alert variant="danger" className="mb-6 text-left">
                <div className="text-sm">
                  <strong>오류 메시지:</strong>
                  <p className="mt-1 font-mono text-xs">{error.message}</p>
                </div>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="primary"
                  leftIcon={<RefreshCcw className="w-4 h-4" />}
                  onClick={reset}
                >
                  다시 시도
                </Button>
                <Link href="/dashboard">
                  <Button
                    variant="secondary"
                    leftIcon={<Home className="w-4 h-4" />}
                  >
                    대시보드로
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

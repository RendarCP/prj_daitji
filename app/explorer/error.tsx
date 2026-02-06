'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function ExplorerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Explorer error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-danger-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-danger-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            오류가 발생했습니다
          </h1>
          
          <p className="text-secondary-600 mb-6">
            페이지를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.
          </p>

          {error.message && (
            <div className="mb-6 p-3 bg-secondary-100 rounded-lg text-sm text-secondary-700 text-left w-full">
              <p className="font-mono break-words">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={reset}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              다시 시도
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

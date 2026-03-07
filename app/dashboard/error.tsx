'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Card } from '@/components/ui/Card'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error Boundary for Dashboard Page
 * Handles errors that occur during rendering or data fetching
 */
export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-secondary/10 pb-20 md:pb-6">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-lg w-full">
            <div className="flex flex-col items-center text-center gap-6">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>

              {/* Error Message */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  오류가 발생했습니다
                </h2>
                <p className="text-muted-foreground mb-4">
                  대시보드를 불러오는 중 문제가 발생했습니다.
                </p>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <Alert variant="danger" className="w-full text-left">
                  <div className="text-sm">
                    <p className="font-semibold mb-1">개발 모드 에러 정보:</p>
                    <p className="text-xs break-all">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Digest: {error.digest}
                      </p>
                    )}
                  </div>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={reset}
                >
                  다시 시도
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<Home className="w-4 h-4" />}
                  onClick={() => (window.location.href = '/')}
                >
                  홈으로 이동
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-sm text-muted-foreground">
                문제가 계속되면 관리자에게 문의해주세요.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

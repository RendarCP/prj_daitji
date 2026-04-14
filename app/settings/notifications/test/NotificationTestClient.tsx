'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bug, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToastError } from '@/lib/hooks/useToastError'

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    message?: string
    details?: {
      message?: string
    }
  }
}

type TestNotificationEvent = {
  id: string
  event_type: 'EXPIRY_SOON' | 'LOW_STOCK'
  channel: string
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled'
  title: string
  body: string
  attempt_count: number
  last_error: string | null
  scheduled_at: string
  sent_at: string | null
  created_at: string
}

export default function NotificationTestClient() {
  const router = useRouter()
  const hasLoadedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [testEvents, setTestEvents] = useState<TestNotificationEvent[]>([])

  useToastError(errorMessage, {
    title: '알림 테스트를 처리할 수 없습니다.',
  })

  const loadTestEvents = useCallback(async () => {
    setIsRefreshing(true)
    setErrorMessage(null)

    const response = await fetch('/api/settings/notifications/test', {
      method: 'GET',
      cache: 'no-store',
    })

    if (response.status === 401) {
      setIsRefreshing(false)
      router.replace('/login?next=/settings/notifications/test')
      return
    }

    const result = (await response.json()) as ApiResponse<TestNotificationEvent[]>
    setIsRefreshing(false)

    if (!response.ok || !result.success || !result.data) {
      const message =
        result.error?.details?.message ||
        result.error?.message ||
        '테스트 알림 목록을 불러오지 못했습니다.'
      setErrorMessage(message)
      return
    }

    setTestEvents(result.data)
  }, [router])

  useEffect(() => {
    if (hasLoadedRef.current) {
      return
    }

    hasLoadedRef.current = true

    const initialize = async () => {
      setIsLoading(true)
      await loadTestEvents()
      setIsLoading(false)
    }

    initialize()
  }, [loadTestEvents])

  const handleCreateTestEvent = async (type: TestNotificationEvent['event_type']) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsCreating(true)

    const response = await fetch('/api/settings/notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    })

    if (response.status === 401) {
      setIsCreating(false)
      router.replace('/login?next=/settings/notifications/test')
      return
    }

    const result = (await response.json()) as ApiResponse<TestNotificationEvent>
    setIsCreating(false)

    if (!response.ok || !result.success || !result.data) {
      const message =
        result.error?.details?.message ||
        result.error?.message ||
        '테스트 알림 이벤트 생성에 실패했습니다.'
      setErrorMessage(message)
      return
    }

    setSuccessMessage('테스트 알림 이벤트를 큐에 등록했습니다.')
    await loadTestEvents()
  }

  if (isLoading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-muted-foreground">테스트 알림을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="card space-y-5 p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Bug className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">알림 테스트</h2>
      </div>

      <p className="text-sm text-muted-foreground">
        테스트 이벤트를 직접 큐에 넣고 최근 상태를 확인할 수 있습니다. 워커가 연결되어 있지 않으면 이벤트는
        `pending` 상태로 남습니다.
      </p>

      {successMessage && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {successMessage}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => handleCreateTestEvent('EXPIRY_SOON')}
          isLoading={isCreating}
          loadingText="생성 중..."
          fullWidth
        >
          만료 테스트 생성
        </Button>
        <Button
          variant="outline"
          onClick={() => handleCreateTestEvent('LOW_STOCK')}
          isLoading={isCreating}
          loadingText="생성 중..."
          fullWidth
        >
          재고 테스트 생성
        </Button>
        <Button
          variant="ghost"
          onClick={loadTestEvents}
          isLoading={isRefreshing}
          loadingText="불러오는 중..."
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          새로고침
        </Button>
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground">최근 테스트 이벤트</p>
          <span className="text-xs text-muted-foreground">최대 10개</span>
        </div>

        {testEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground">
            생성된 테스트 알림이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {testEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-border/70 bg-card/60 px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{event.title}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {event.event_type}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                    {event.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{event.body}</p>
                <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>생성: {new Date(event.created_at).toLocaleString()}</p>
                  <p>예약: {new Date(event.scheduled_at).toLocaleString()}</p>
                  <p>시도 횟수: {event.attempt_count}</p>
                  {event.sent_at && <p>발송: {new Date(event.sent_at).toLocaleString()}</p>}
                  {event.last_error && <p className="text-destructive">오류: {event.last_error}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

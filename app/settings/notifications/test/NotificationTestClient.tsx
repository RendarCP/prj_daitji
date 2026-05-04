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

type TestDeliveryResult = {
  sent: number
  failed: number
  skipped: number
  statusCode?: number
  error?: string
}

type CreateTestNotificationResult = {
  event: TestNotificationEvent
  delivery: TestDeliveryResult
}

type PushReceipt = {
  received: boolean
  title?: string
  body?: string
  deliveredAt?: string
}

function waitForPushReceipt(timeoutMs = 12000): Promise<PushReceipt> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve({ received: false })
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
      resolve({ received: false })
    }, timeoutMs)

    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== 'PUSH_RECEIVED') {
        return
      }

      clearTimeout(timeout)
      navigator.serviceWorker.removeEventListener('message', handleMessage)
      resolve({
        received: true,
        title: typeof event.data.title === 'string' ? event.data.title : undefined,
        body: typeof event.data.body === 'string' ? event.data.body : undefined,
        deliveredAt: typeof event.data.deliveredAt === 'string' ? event.data.deliveredAt : undefined,
      })
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
  })
}

export default function NotificationTestClient() {
  const router = useRouter()
  const hasLoadedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [pushReceipt, setPushReceipt] = useState<PushReceipt | null>(null)
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
    setPushReceipt(null)
    setIsCreating(true)
    const receiptPromise = waitForPushReceipt()

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

    const result = (await response.json()) as ApiResponse<CreateTestNotificationResult>
    setIsCreating(false)

    if (!response.ok || !result.success || !result.data) {
      const message =
        result.error?.details?.message ||
        result.error?.message ||
        '테스트 알림 이벤트 생성에 실패했습니다.'
      setErrorMessage(message)
      return
    }

    if (result.data.delivery.sent > 0) {
      setSuccessMessage(`테스트 알림을 즉시 발송했습니다. Web Push 응답: ${result.data.delivery.statusCode ?? '확인됨'}`)
    } else if (result.data.delivery.skipped > 0) {
      setErrorMessage(result.data.delivery.error || '활성화된 Web Push 구독이 없어 발송을 건너뛰었습니다.')
    } else {
      setErrorMessage(result.data.delivery.error || '테스트 알림 발송에 실패했습니다.')
    }

    await loadTestEvents()
    setPushReceipt(await receiptPromise)
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
        테스트 이벤트를 만들고 현재 등록된 브라우저로 Web Push를 즉시 발송합니다.
      </p>

      {successMessage && (
        <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          {successMessage}
        </p>
      )}

      {pushReceipt && (
        <div
          className={
            pushReceipt.received
              ? 'rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success'
              : 'rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning'
          }
        >
          {pushReceipt.received ? (
            <div className="space-y-1">
              <p className="font-medium">브라우저 서비스워커 수신 확인</p>
              <p>{pushReceipt.title}</p>
              {pushReceipt.deliveredAt ? (
                <p className="text-xs opacity-80">수신: {new Date(pushReceipt.deliveredAt).toLocaleString()}</p>
              ) : null}
            </div>
          ) : (
            <p>서버 발송 후 12초 안에 브라우저 수신 확인 메시지를 받지 못했습니다.</p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => handleCreateTestEvent('EXPIRY_SOON')}
          isLoading={isCreating}
          loadingText="발송 중..."
          fullWidth
        >
          만료 푸시 테스트
        </Button>
        <Button
          variant="outline"
          onClick={() => handleCreateTestEvent('LOW_STOCK')}
          isLoading={isCreating}
          loadingText="발송 중..."
          fullWidth
        >
          재고 푸시 테스트
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

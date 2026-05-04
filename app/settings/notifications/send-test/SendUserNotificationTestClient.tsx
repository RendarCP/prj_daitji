'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Send, UsersRound } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastError } from '@/lib/hooks/useToastError'
import { cn } from '@/lib/utils/cn'

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

type PushUser = {
  userId: string
  email: string | null
  tokenCount: number
  latestDeviceLabel: string | null
  lastSeenAt: string
}

type SendResult = {
  eventId: string
  sent: number
  failed: number
  skipped: number
  message?: string
  deliveries: Array<{
    tokenId: string
    deviceLabel: string | null
    status: 'success' | 'failed'
    statusCode?: number | null
    error?: string
  }>
}

type PushReceipt = {
  received: boolean
  title?: string
  deliveredAt?: string
}

function getApiError<T>(result: ApiResponse<T>, fallback: string) {
  return result.error?.details?.message || result.error?.message || fallback
}

function waitForPushReceipt(timeoutMs = 12000): Promise<PushReceipt> {
  if (!('serviceWorker' in navigator)) {
    return Promise.resolve({ received: false })
  }

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      navigator.serviceWorker.removeEventListener('message', handleMessage)
      resolve({ received: false })
    }, timeoutMs)

    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== 'PUSH_RECEIVED') {
        return
      }

      window.clearTimeout(timeout)
      navigator.serviceWorker.removeEventListener('message', handleMessage)
      resolve({
        received: true,
        title: typeof event.data.title === 'string' ? event.data.title : undefined,
        deliveredAt: typeof event.data.deliveredAt === 'string' ? event.data.deliveredAt : undefined,
      })
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
  })
}

export default function SendUserNotificationTestClient() {
  const router = useRouter()
  const hasLoadedRef = useRef(false)
  const [users, setUsers] = useState<PushUser[]>([])
  const [userId, setUserId] = useState('')
  const [title, setTitle] = useState('DAITJI 테스트 알림')
  const [body, setBody] = useState('특정 유저에게 보내는 Web Push 테스트입니다.')
  const [url, setUrl] = useState('/settings/notifications')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<SendResult | null>(null)
  const [pushReceipt, setPushReceipt] = useState<PushReceipt | null>(null)

  useToastError(errorMessage, {
    title: '유저 푸시 테스트를 처리할 수 없습니다.',
  })

  const loadUsers = useCallback(async () => {
    setErrorMessage(null)
    const response = await fetch('/api/settings/notifications/send-test', {
      method: 'GET',
      cache: 'no-store',
    })

    if (response.status === 401) {
      router.replace('/login?next=/settings/notifications/send-test')
      return
    }

    const result = (await response.json()) as ApiResponse<{ users: PushUser[] }>

    if (!response.ok || !result.success || !result.data) {
      setErrorMessage(getApiError(result, '활성 푸시 유저 목록을 불러오지 못했습니다.'))
      return
    }

    setUsers(result.data.users)
    setUserId((current) => current || result.data?.users[0]?.userId || '')
  }, [router])

  useEffect(() => {
    if (hasLoadedRef.current) {
      return
    }

    hasLoadedRef.current = true

    const initialize = async () => {
      setIsLoading(true)
      await loadUsers()
      setIsLoading(false)
    }

    initialize()
  }, [loadUsers])

  const handleSend = async () => {
    setErrorMessage(null)
    setSendResult(null)
    setPushReceipt(null)

    if (!userId.trim() || !title.trim() || !body.trim()) {
      setErrorMessage('유저 ID, 제목, 메시지를 모두 입력해 주세요.')
      return
    }

    setIsSending(true)
    const receiptPromise = waitForPushReceipt()

    const response = await fetch('/api/settings/notifications/send-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId.trim(),
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || '/',
      }),
    })

    if (response.status === 401) {
      setIsSending(false)
      router.replace('/login?next=/settings/notifications/send-test')
      return
    }

    const result = (await response.json()) as ApiResponse<SendResult>
    setIsSending(false)

    if (!response.ok || !result.success || !result.data) {
      setErrorMessage(getApiError(result, '특정 유저 푸시 발송에 실패했습니다.'))
      return
    }

    setSendResult(result.data)
    setPushReceipt(await receiptPromise)
    await loadUsers()
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Send className="h-3.5 w-3.5" />
              Manual Web Push
            </div>
            <h2 className="text-xl font-semibold text-foreground">특정 유저 푸시 발송</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              활성 Web Push 구독이 있는 유저 ID를 대상으로 제목과 메시지를 직접 발송합니다.
            </p>
          </div>
          <Badge variant="warning" size="md">
            테스트 전용
          </Badge>
        </div>

        <div className="space-y-4">
          <Input
            label="대상 유저 ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="auth.users.id UUID"
          />
          <Input
            label="제목"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={80}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">메시지</label>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={240}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-500 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="사용자에게 보낼 메시지"
            />
            <p className="text-xs text-muted-foreground">{body.length}/240</p>
          </div>
          <Input
            label="클릭 시 이동 URL"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            helperText="앱 내부 경로만 허용합니다. 예: /settings/notifications"
          />
          <Button
            onClick={handleSend}
            isLoading={isSending}
            loadingText="발송 중..."
            leftIcon={<Send className="h-4 w-4" />}
            fullWidth
          >
            이 유저에게 푸시 발송
          </Button>
        </div>
      </section>

      {sendResult ? (
        <section
          className={cn(
            'rounded-2xl border px-4 py-4 text-sm',
            sendResult.sent > 0
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-warning/30 bg-warning/10 text-warning'
          )}
        >
          <p className="font-semibold">
            발송 결과: 성공 {sendResult.sent}, 실패 {sendResult.failed}, 건너뜀 {sendResult.skipped}
          </p>
          <p className="mt-1 text-xs opacity-80">eventId: {sendResult.eventId}</p>
          {sendResult.message ? <p className="mt-2">{sendResult.message}</p> : null}
          {pushReceipt ? (
            <p className="mt-2">
              현재 브라우저 수신 확인:{' '}
              {pushReceipt.received
                ? `${pushReceipt.title ?? '알림'} / ${
                    pushReceipt.deliveredAt
                      ? new Date(pushReceipt.deliveredAt).toLocaleString()
                      : '수신됨'
                  }`
                : '12초 안에 현재 브라우저에서는 수신 확인 없음'}
            </p>
          ) : null}
          {sendResult.deliveries.length > 0 ? (
            <div className="mt-3 space-y-1 text-xs">
              {sendResult.deliveries.map((delivery) => (
                <p key={delivery.tokenId}>
                  {delivery.status} / HTTP {delivery.statusCode ?? '-'} / {delivery.deviceLabel ?? 'Unknown device'}
                  {delivery.error ? ` / ${delivery.error}` : ''}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-3xl border border-border/60 bg-secondary/10 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">활성 푸시 유저</h2>
          </div>
          <Button
            variant="ghost"
            onClick={loadUsers}
            isLoading={isLoading}
            loadingText="불러오는 중..."
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            새로고침
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">유저 목록을 불러오는 중...</p>
        ) : users.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-background px-4 py-6 text-sm text-muted-foreground">
            활성 Web Push 구독이 있는 유저가 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.userId}
                type="button"
                onClick={() => setUserId(user.userId)}
                className={cn(
                  'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                  userId === user.userId
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-border/70 bg-background/70 hover:border-border'
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{user.email ?? 'Email unavailable'}</span>
                  <Badge variant="secondary" size="sm">
                    tokens {user.tokenCount}
                  </Badge>
                </div>
                <p className="mt-1 break-all text-xs text-muted-foreground">{user.userId}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  최근 활성: {new Date(user.lastSeenAt).toLocaleString()}
                  {user.latestDeviceLabel ? ` / ${user.latestDeviceLabel}` : ''}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Save, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'

type NotificationSettings = {
  id: string
  user_id: string
  enabled: boolean
  push_enabled: boolean
  in_app_enabled: boolean
  expiry_enabled: boolean
  expiry_days_before: number[]
  low_stock_enabled: boolean
  low_stock_threshold: number
  timezone: string
}

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

interface ToggleRowProps {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}

function ToggleRow({ label, checked, onChange, disabled = false }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/60 px-4 py-3">
      <span className="text-base font-semibold text-foreground">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full p-0.5 transition-all duration-200 ${
          checked
            ? 'bg-primary shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'
            : 'bg-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)]'
        } ${disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer active:scale-[0.98]'}`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.22)] transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function parseNumberList(value: string) {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((token) => Number(token.trim()))
        .filter((num) => Number.isFinite(num) && num >= 0)
    )
  ).sort((a, b) => b - a)
}

interface NotificationsSettingsClientProps {
  showTitle?: boolean
}

export default function NotificationsSettingsClient({
  showTitle = true,
}: NotificationsSettingsClientProps) {
  const router = useRouter()
  const hasLoadedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [enabled, setEnabled] = useState(true)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [inAppEnabled, setInAppEnabled] = useState(true)
  const [expiryEnabled, setExpiryEnabled] = useState(true)
  const [expiryDaysBeforeInput, setExpiryDaysBeforeInput] = useState('7,3,1')
  const [lowStockEnabled, setLowStockEnabled] = useState(true)
  const [lowStockThreshold, setLowStockThreshold] = useState('1')
  const [timezone, setTimezone] = useState('Asia/Seoul')

  const parsedExpiryDays = useMemo(
    () => parseNumberList(expiryDaysBeforeInput),
    [expiryDaysBeforeInput]
  )

  useEffect(() => {
    if (hasLoadedRef.current) {
      return
    }
    hasLoadedRef.current = true

    const loadSettings = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      const settingsResponse = await fetch('/api/settings/notifications', {
        method: 'GET',
        cache: 'no-store',
      })

      if (settingsResponse.status === 401) {
        setIsLoading(false)
        router.replace('/login?next=/settings/notifications')
        return
      }

      const result = (await settingsResponse.json()) as ApiResponse<NotificationSettings>

      if (!settingsResponse.ok || !result.success || !result.data) {
        const message = result.error?.details?.message || result.error?.message || '알림 설정을 불러오지 못했습니다.'
        setErrorMessage(message)
        setIsLoading(false)
        return
      }

      const settings = result.data
      setEnabled(settings.enabled)
      setPushEnabled(settings.push_enabled)
      setInAppEnabled(settings.in_app_enabled)
      setExpiryEnabled(settings.expiry_enabled)
      setExpiryDaysBeforeInput((settings.expiry_days_before || [7, 3, 1]).join(','))
      setLowStockEnabled(settings.low_stock_enabled)
      setLowStockThreshold(String(settings.low_stock_threshold ?? 1))
      setTimezone(settings.timezone || 'Asia/Seoul')
      setIsLoading(false)
    }

    loadSettings()
  }, [router])

  const handleSave = async () => {
    setErrorMessage(null)
    setSuccessMessage(null)

    if (parsedExpiryDays.length === 0) {
      setErrorMessage('만료 알림 기준일을 최소 1개 이상 입력해 주세요. 예: 7,3,1')
      return
    }

    const threshold = Number(lowStockThreshold)
    if (!Number.isFinite(threshold) || threshold < 0) {
      setErrorMessage('재고 부족 기준은 0 이상의 숫자여야 합니다.')
      return
    }

    setIsSaving(true)

    const response = await fetch('/api/settings/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled,
        push_enabled: pushEnabled,
        in_app_enabled: inAppEnabled,
        expiry_enabled: expiryEnabled,
        expiry_days_before: parsedExpiryDays,
        low_stock_enabled: lowStockEnabled,
        low_stock_threshold: threshold,
        timezone,
      }),
    })

    if (response.status === 401) {
      setIsSaving(false)
      router.replace('/login?next=/settings/notifications')
      return
    }

    const result = (await response.json()) as ApiResponse<NotificationSettings>
    setIsSaving(false)

    if (!response.ok || !result.success) {
      const message = result.error?.details?.message || result.error?.message || '알림 설정 저장에 실패했습니다.'
      setErrorMessage(message)
      return
    }

    setSuccessMessage('알림 설정이 저장되었습니다.')
  }

  if (isLoading) {
    return (
      <div className="card p-6">
        <p className="text-sm text-muted-foreground">알림 설정을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-6 p-5 sm:p-6">
        {showTitle && (
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">알림 설정</h2>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            {successMessage}
          </p>
        )}

        <div className="space-y-3">
          <ToggleRow label="전체 알림 사용" checked={enabled} onChange={setEnabled} />
          <ToggleRow
            label="푸시 알림"
            checked={pushEnabled}
            onChange={setPushEnabled}
            disabled={!enabled}
          />
          <ToggleRow
            label="인앱 알림"
            checked={inAppEnabled}
            onChange={setInAppEnabled}
            disabled={!enabled}
          />
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <ToggleRow
            label="만료 임박 알림"
            checked={expiryEnabled}
            onChange={setExpiryEnabled}
            disabled={!enabled}
          />

          <div>
            <p className="mb-1 text-sm font-medium text-foreground">만료 알림 기준일</p>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={expiryDaysBeforeInput}
              onChange={(event) => setExpiryDaysBeforeInput(event.target.value)}
              placeholder="예: 7,3,1"
              disabled={!enabled || !expiryEnabled}
            />
            <p className="mt-1 text-xs text-muted-foreground">콤마(,)로 구분해 입력하세요. 예: 14,7,3,1</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <ToggleRow
            label="재고 부족 알림"
            checked={lowStockEnabled}
            onChange={setLowStockEnabled}
            disabled={!enabled}
          />

          <div>
            <p className="mb-1 text-sm font-medium text-foreground">재고 부족 기준 수량</p>
            <input
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              type="number"
              min={0}
              value={lowStockThreshold}
              onChange={(event) => setLowStockThreshold(event.target.value)}
              disabled={!enabled || !lowStockEnabled}
            />
          </div>
        </div>

        <div className="space-y-2 border-t border-border pt-5">
          <p className="text-sm font-medium text-foreground">Timezone</p>
          <input
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            placeholder="Asia/Seoul"
          />
        </div>

        <Button onClick={handleSave} isLoading={isSaving} loadingText="저장 중..." leftIcon={<Save className="h-4 w-4" />}>
          저장
        </Button>
        <Button variant="outline" onClick={() => router.push('/settings/notifications/test')}>
          알림 테스트 페이지
        </Button>
      </div>
    </div>
  )
}

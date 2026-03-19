'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  ChevronDown,
  Clock3,
  Globe2,
  Package2,
  Smartphone,
  SquareStack,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils/cn'

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

type NotificationSettingsForm = {
  enabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  expiryEnabled: boolean
  expiryDaysBeforeInput: string
  lowStockEnabled: boolean
  lowStockThreshold: string
  timezone: string
}

type NotificationSettingsPayload = {
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

type SaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

const DEFAULT_FORM: NotificationSettingsForm = {
  enabled: true,
  pushEnabled: true,
  inAppEnabled: true,
  expiryEnabled: true,
  expiryDaysBeforeInput: '7,3,1',
  lowStockEnabled: true,
  lowStockThreshold: '1',
  timezone: 'Asia/Seoul',
}

const FALLBACK_TIMEZONES = [
  'Asia/Seoul',
  'Asia/Tokyo',
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
]

interface ToggleCardProps {
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
  icon: LucideIcon
  disabled?: boolean
}

function ToggleCard({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
  disabled = false,
}: ToggleCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 bg-secondary/10 p-5 transition-colors hover:border-border/70',
        disabled && 'opacity-45'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-background/60">
              <Icon className="h-5 w-5 text-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-foreground">{label}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={label}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative mt-1 h-7 w-12 shrink-0 rounded-full p-0.5 transition-all duration-200',
            checked
              ? 'bg-primary shadow-[0_0_0_1px_rgba(0,0,0,0.05)]'
              : 'bg-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.35)]',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
          )}
        >
          <span
            className={cn(
              'block h-6 w-6 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.22)] transition-transform duration-200',
              checked ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </button>
      </div>
    </div>
  )
}

interface InputCardProps {
  label: string
  description: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number'
  min?: number
  disabled?: boolean
  helperText?: string
}

function InputCard({
  label,
  description,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  disabled = false,
  helperText,
}: InputCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/50 bg-secondary/10 p-5 transition-colors hover:border-border/70',
        disabled && 'opacity-45'
      )}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">{label}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <input
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        min={min}
        disabled={disabled}
      />

      {helperText ? <p className="mt-3 text-xs text-muted-foreground">{helperText}</p> : null}
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

function isValidTimeZone(value: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value })
    return true
  } catch {
    return false
  }
}

function getDetectedTimeZone() {
  if (typeof Intl === 'undefined') {
    return null
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return timeZone && isValidTimeZone(timeZone) ? timeZone : null
}

function getTimeZoneValues(currentTimezone?: string | null, deviceTimezone?: string | null) {
  const intlWithSupportedValues = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[]
  }

  const supported =
    typeof intlWithSupportedValues.supportedValuesOf === 'function'
      ? intlWithSupportedValues.supportedValuesOf('timeZone')
      : FALLBACK_TIMEZONES

  return Array.from(new Set([currentTimezone, deviceTimezone, ...supported].filter(Boolean) as string[]))
}

function buildFormFromSettings(settings: NotificationSettings): NotificationSettingsForm {
  const isEnabled = settings.enabled

  return {
    enabled: isEnabled,
    pushEnabled: isEnabled ? settings.push_enabled : false,
    inAppEnabled: isEnabled ? settings.in_app_enabled : false,
    expiryEnabled: isEnabled ? settings.expiry_enabled : false,
    expiryDaysBeforeInput: (settings.expiry_days_before || [7, 3, 1]).join(','),
    lowStockEnabled: isEnabled ? settings.low_stock_enabled : false,
    lowStockThreshold: String(settings.low_stock_threshold ?? 1),
    timezone: settings.timezone || 'Asia/Seoul',
  }
}

function buildPayload(
  form: NotificationSettingsForm
): { payload: NotificationSettingsPayload | null; validationError: string | null } {
  const expiryDaysBefore = parseNumberList(form.expiryDaysBeforeInput)

  if (expiryDaysBefore.length === 0) {
    return {
      payload: null,
      validationError: '만료 알림 기준일을 최소 1개 이상 입력해 주세요. 예: 7,3,1',
    }
  }

  if (form.lowStockThreshold.trim() === '') {
    return {
      payload: null,
      validationError: '재고 부족 기준은 0 이상의 숫자여야 합니다.',
    }
  }

  const threshold = Number(form.lowStockThreshold)
  if (!Number.isFinite(threshold) || threshold < 0) {
    return {
      payload: null,
      validationError: '재고 부족 기준은 0 이상의 숫자여야 합니다.',
    }
  }

  if (form.timezone.trim() === '') {
    return {
      payload: null,
      validationError: 'Timezone을 입력해 주세요.',
    }
  }

  if (!isValidTimeZone(form.timezone.trim())) {
    return {
      payload: null,
      validationError: '유효한 시간대를 선택해 주세요.',
    }
  }

  return {
    payload: {
      enabled: form.enabled,
      push_enabled: form.enabled ? form.pushEnabled : false,
      in_app_enabled: form.enabled ? form.inAppEnabled : false,
      expiry_enabled: form.enabled ? form.expiryEnabled : false,
      expiry_days_before: expiryDaysBefore,
      low_stock_enabled: form.enabled ? form.lowStockEnabled : false,
      low_stock_threshold: threshold,
      timezone: form.timezone.trim(),
    },
    validationError: null,
  }
}

function serializePayload(payload: NotificationSettingsPayload) {
  return JSON.stringify(payload)
}

function getSaveBadge(saveState: SaveState) {
  switch (saveState) {
    case 'pending':
      return { variant: 'warning' as const, text: '변경 내용 대기 중' }
    case 'saving':
      return { variant: 'primary' as const, text: '자동 저장 중' }
    case 'saved':
      return { variant: 'success' as const, text: '자동 저장됨' }
    case 'error':
      return { variant: 'danger' as const, text: '저장 실패' }
    case 'idle':
    default:
      return { variant: 'secondary' as const, text: '설정 페이지' }
  }
}

export default function NotificationsSettingsClient() {
  const router = useRouter()
  const hasLoadedRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const formRef = useRef(DEFAULT_FORM)
  const lastSavedSnapshotRef = useRef<string | null>(null)

  const [form, setForm] = useState<NotificationSettingsForm>(DEFAULT_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [requestError, setRequestError] = useState<string | null>(null)
  const [deviceTimezone] = useState<string | null>(() => getDetectedTimeZone())

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (hasLoadedRef.current) {
      return
    }
    hasLoadedRef.current = true

    const loadSettings = async () => {
      setIsLoading(true)
      setRequestError(null)

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
        setRequestError(message)
        setIsLoading(false)
        return
      }

      const nextForm = buildFormFromSettings(result.data)
      const nextPayload = buildPayload(nextForm).payload

      formRef.current = nextForm
      setForm(nextForm)
      lastSavedSnapshotRef.current = nextPayload ? serializePayload(nextPayload) : null
      setSaveState('saved')
      setIsLoading(false)
    }

    loadSettings()
  }, [router])

  const scheduleSave = (nextForm: NotificationSettingsForm) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    const { payload } = buildPayload(nextForm)

    if (!payload) {
      setSaveState('idle')
      return
    }

    const snapshot = serializePayload(payload)

    if (snapshot === lastSavedSnapshotRef.current) {
      setSaveState('saved')
      return
    }

    setSaveState('pending')
    saveTimerRef.current = setTimeout(async () => {
      setSaveState('saving')

      const response = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        router.replace('/login?next=/settings/notifications')
        return
      }

      const result = (await response.json()) as ApiResponse<NotificationSettings>

      if (!response.ok || !result.success) {
        const message = result.error?.details?.message || result.error?.message || '알림 설정 저장에 실패했습니다.'
        setRequestError(message)
        setSaveState('error')
        return
      }

      lastSavedSnapshotRef.current = snapshot
      setRequestError(null)
      setSaveState('saved')
    }, 700)
  }

  const updateForm = (
    updates:
      | Partial<NotificationSettingsForm>
      | ((current: NotificationSettingsForm) => NotificationSettingsForm)
  ) => {
    const nextForm =
      typeof updates === 'function'
        ? updates(formRef.current)
        : { ...formRef.current, ...updates }

    formRef.current = nextForm
    setForm(nextForm)
    setRequestError(null)
    scheduleSave(nextForm)
  }

  const handleEnabledChange = (next: boolean) => {
    updateForm((current) => ({
      ...current,
      enabled: next,
      pushEnabled: next,
      inAppEnabled: next,
      expiryEnabled: next,
      lowStockEnabled: next,
    }))
  }

  const handlePushEnabledChange = (next: boolean) => {
    updateForm((current) => ({
      ...current,
      enabled: next ? true : current.enabled,
      pushEnabled: next,
    }))
  }

  const handleInAppEnabledChange = (next: boolean) => {
    updateForm((current) => ({
      ...current,
      enabled: next ? true : current.enabled,
      inAppEnabled: next,
    }))
  }

  const handleExpiryEnabledChange = (next: boolean) => {
    updateForm((current) => ({
      ...current,
      enabled: next ? true : current.enabled,
      expiryEnabled: next,
    }))
  }

  const handleLowStockEnabledChange = (next: boolean) => {
    updateForm((current) => ({
      ...current,
      enabled: next ? true : current.enabled,
      lowStockEnabled: next,
    }))
  }

  const { validationError } = useMemo(() => buildPayload(form), [form])
  const errorMessage = requestError ?? validationError
  const saveBadge = getSaveBadge(saveState)
  const timezoneOptions = useMemo(
    () =>
      getTimeZoneValues(form.timezone, deviceTimezone).map((timezone) => ({
        value: timezone,
        label: timezone,
      })),
    [deviceTimezone, form.timezone]
  )

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border/50 bg-secondary/10 p-6 text-sm text-muted-foreground">
        알림 설정을 불러오는 중...
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={saveBadge.variant} size="md">
          {saveBadge.text}
        </Badge>
        <Badge variant="default" size="md" className="bg-secondary/20">
          변경 사항은 자동 저장됩니다
        </Badge>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      ) : null}

      <section className="space-y-3">
        <label className="pl-1 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          알림 설정
        </label>
        <div className="space-y-4">
          <ToggleCard
            label="전체 알림 사용"
            description="모든 알림 기능을 한 번에 켜거나 끌 수 있습니다."
            checked={form.enabled}
            onChange={handleEnabledChange}
            icon={Bell}
          />
          <ToggleCard
            label="푸시 알림"
            description="기기에서 바로 알림을 받아봅니다."
            checked={form.pushEnabled}
            onChange={handlePushEnabledChange}
            icon={Smartphone}
          />
          <ToggleCard
            label="인앱 알림"
            description="앱 안에서 상태 변화를 바로 확인합니다."
            checked={form.inAppEnabled}
            onChange={handleInAppEnabledChange}
            icon={SquareStack}
          />
        </div>
      </section>

      <section className="space-y-3">
        <label className="pl-1 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          만료 알림
        </label>
        <div className="space-y-4">
          <ToggleCard
            label="만료 임박 알림"
            description="유통기한이 가까운 아이템을 미리 알려줍니다."
            checked={form.expiryEnabled}
            onChange={handleExpiryEnabledChange}
            icon={Clock3}
          />
          <InputCard
            label="만료 알림 기준일"
            description="언제부터 알림을 시작할지 일 수를 콤마로 구분해서 입력해 주세요."
            value={form.expiryDaysBeforeInput}
            onChange={(value) => updateForm({ expiryDaysBeforeInput: value })}
            placeholder="예: 14,7,3,1"
            disabled={!form.expiryEnabled}
            helperText="예: 14,7,3,1 형태로 입력하면 14일, 7일, 3일, 1일 전에 알려드려요."
          />
        </div>
      </section>

      <section className="space-y-3">
        <label className="pl-1 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          재고 알림
        </label>
        <div className="space-y-4">
          <ToggleCard
            label="재고 부족 알림"
            description="수량이 기준 이하로 내려가면 바로 확인할 수 있습니다."
            checked={form.lowStockEnabled}
            onChange={handleLowStockEnabledChange}
            icon={Package2}
          />
          <InputCard
            label="재고 부족 기준 수량"
            description="몇 개 이하일 때 재고 부족으로 볼지 설정합니다."
            value={form.lowStockThreshold}
            onChange={(value) => updateForm({ lowStockThreshold: value })}
            type="number"
            min={0}
            disabled={!form.lowStockEnabled}
          />
        </div>
      </section>

      <section className="space-y-3">
        <label className="pl-1 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          Timezone
        </label>
        <div className="rounded-2xl border border-border/50 bg-secondary/10 p-5 transition-colors hover:border-border/70">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-background/60">
                  <Globe2 className="h-5 w-5 text-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-foreground">시간대</h3>
                  <p className="text-sm text-muted-foreground">
                    직접 입력 대신 목록에서 선택하고, 필요하면 현재 기기 시간대로 바로 맞출 수 있어요.
                  </p>
                </div>
              </div>
            </div>

            {deviceTimezone && form.timezone !== deviceTimezone ? (
              <button
                type="button"
                onClick={() => updateForm({ timezone: deviceTimezone })}
                className="shrink-0 rounded-xl border border-border bg-background/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                현재 기기 시간대
              </button>
            ) : null}
          </div>

          <div className="relative">
            <select
              value={form.timezone}
              onChange={(event) => updateForm({ timezone: event.target.value })}
              className="w-full appearance-none rounded-2xl border border-border bg-background px-4 py-3 pr-11 text-base text-foreground outline-none transition-colors focus:border-primary"
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            현재 기기 시간대: <strong>{deviceTimezone ?? '확인 불가'}</strong>
            <br />
            로그인 이력이나 IP 위치가 아니라, 이 기기의 시간대 설정을 기준으로 가져옵니다.
          </p>
        </div>
      </section>
    </div>
  )
}

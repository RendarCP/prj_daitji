import { NextRequest } from 'next/server'
import { CORS_HEADERS, errorResponse, handleError, successResponse } from '@/lib/api/utils'
import { buildNotificationPayload, configureWebPush, webpush } from '@/lib/notifications/web-push'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type NotificationEvent = {
  id: string
  user_id: string
  event_type: string
  entity_type: string
  entity_id: string
  title: string
  body: string
  payload: Record<string, unknown> | null
}

type PushToken = {
  id: string
  push_token: string
  provider_subscription: webpush.PushSubscription | null
}

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production'
  }

  const authorization = request.headers.get('authorization')
  const headerSecret = request.headers.get('x-cron-secret')

  return authorization === `Bearer ${cronSecret}` || headerSecret === cronSecret
}

function toReferenceDate() {
  return new Date().toISOString().slice(0, 10)
}

async function markEventSent(admin: ReturnType<typeof createAdminClient>, eventId: string) {
  await (admin as any).rpc('mark_notification_event_sent', { p_event_id: eventId })
}

async function markEventFailed(
  admin: ReturnType<typeof createAdminClient>,
  eventId: string,
  errorMessage: string
) {
  await (admin as any).rpc('mark_notification_event_failed', {
    p_event_id: eventId,
    p_error_message: errorMessage,
  })
}

async function insertDelivery(
  admin: ReturnType<typeof createAdminClient>,
  values: {
    event_id: string
    token_id: string
    status: 'success' | 'failed'
    error_message?: string
    response_body?: Record<string, unknown>
  }
) {
  await (admin as any).from('notification_deliveries').insert({
    event_id: values.event_id,
    token_id: values.token_id,
    provider: 'webpush',
    status: values.status,
    error_message: values.error_message ?? null,
    response_body: values.response_body ?? {},
  })
}

async function deactivateToken(admin: ReturnType<typeof createAdminClient>, tokenId: string) {
  await (admin as any)
    .from('notification_push_tokens')
    .update({ is_active: false })
    .eq('id', tokenId)
}

async function processEvent(admin: ReturnType<typeof createAdminClient>, event: NotificationEvent) {
  const { data: settings } = await (admin as any)
    .from('notification_settings')
    .select('enabled, push_enabled')
    .eq('user_id', event.user_id)
    .maybeSingle()

  if (settings && (!settings.enabled || !settings.push_enabled)) {
    await markEventSent(admin, event.id)
    return { sent: 0, failed: 0, skipped: 1 }
  }

  const { data: tokens, error: tokenError } = await (admin as any)
    .from('notification_push_tokens')
    .select('id, push_token, provider_subscription')
    .eq('user_id', event.user_id)
    .eq('provider', 'webpush')
    .eq('is_active', true)
    .order('last_seen_at', { ascending: false })
    .limit(1)

  if (tokenError) {
    await markEventFailed(admin, event.id, tokenError.message)
    return { sent: 0, failed: 1, skipped: 0 }
  }

  const activeTokens = (tokens ?? []) as PushToken[]

  if (activeTokens.length === 0) {
    await markEventSent(admin, event.id)
    return { sent: 0, failed: 0, skipped: 1 }
  }

  const payload = JSON.stringify(buildNotificationPayload(event))
  let successCount = 0
  let failureCount = 0
  const errors: string[] = []

  for (const token of activeTokens) {
    const subscription = token.provider_subscription

    if (!subscription?.endpoint) {
      failureCount += 1
      errors.push('Stored subscription is missing endpoint')
      await insertDelivery(admin, {
        event_id: event.id,
        token_id: token.id,
        status: 'failed',
        error_message: 'Stored subscription is missing endpoint',
      })
      continue
    }

    try {
      const response = await webpush.sendNotification(subscription, payload)
      successCount += 1
      await insertDelivery(admin, {
        event_id: event.id,
        token_id: token.id,
        status: 'success',
        response_body: {
          statusCode: response.statusCode,
          headers: response.headers,
        },
      })
    } catch (error) {
      const pushError = error as Error & { statusCode?: number; body?: string }
      const message = pushError.message || 'Web Push delivery failed'
      failureCount += 1
      errors.push(message)

      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        await deactivateToken(admin, token.id)
      }

      await insertDelivery(admin, {
        event_id: event.id,
        token_id: token.id,
        status: 'failed',
        error_message: message,
        response_body: {
          statusCode: pushError.statusCode ?? null,
          body: pushError.body ?? null,
        },
      })
    }
  }

  if (successCount > 0) {
    await markEventSent(admin, event.id)
  } else {
    await markEventFailed(admin, event.id, errors.join('; ') || 'Web Push delivery failed')
  }

  return { sent: successCount, failed: failureCount, skipped: 0 }
}

async function handleNotificationWorker(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return errorResponse('UNAUTHORIZED', { message: '알림 워커 인증이 필요합니다.' }, 401)
    }

    try {
      configureWebPush()
    } catch (error) {
      return errorResponse(
        'INTERNAL_ERROR',
        { message: error instanceof Error ? error.message : 'Web Push 설정이 필요합니다.' },
        500
      )
    }

    const admin = createAdminClient()
    const url = new URL(request.url)
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50) || 50, 100)
    const referenceDate = toReferenceDate()

    const [expiryResult, lowStockResult] = await Promise.all([
      (admin as any).rpc('queue_expiry_notification_events', {
        p_reference_date: referenceDate,
      }),
      (admin as any).rpc('queue_low_stock_notification_events', {
        p_reference_date: referenceDate,
      }),
    ])

    if (expiryResult.error || lowStockResult.error) {
      return errorResponse(
        'DATABASE_ERROR',
        { message: expiryResult.error?.message || lowStockResult.error?.message },
        500
      )
    }

    const { data: events, error } = await (admin as any).rpc('claim_notification_events', {
      p_limit: limit,
    })

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    const totals = {
      queuedExpiry: expiryResult.data ?? 0,
      queuedLowStock: lowStockResult.data ?? 0,
      claimed: (events ?? []).length,
      sent: 0,
      failed: 0,
      skipped: 0,
    }

    for (const event of (events ?? []) as NotificationEvent[]) {
      const result = await processEvent(admin, event)
      totals.sent += result.sent
      totals.failed += result.failed
      totals.skipped += result.skipped
    }

    return successResponse(totals)
  } catch (error) {
    return handleError(error)
  }
}

export async function GET(request: NextRequest) {
  return handleNotificationWorker(request)
}

export async function POST(request: NextRequest) {
  return handleNotificationWorker(request)
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

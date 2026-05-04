import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, handleError, CORS_HEADERS } from '@/lib/api/utils'
import { buildNotificationPayload, configureWebPush, webpush } from '@/lib/notifications/web-push'

const CreateTestNotificationSchema = z.object({
  type: z.enum(['EXPIRY_SOON', 'LOW_STOCK']).default('EXPIRY_SOON'),
})

type TestNotificationEvent = {
  id: string
  user_id: string
  event_type: 'EXPIRY_SOON' | 'LOW_STOCK'
  entity_type: string
  entity_id: string
  title: string
  body: string
  payload: Record<string, unknown>
  status: string
  scheduled_at: string
  created_at: string
}

type PushToken = {
  id: string
  provider_subscription: webpush.PushSubscription | null
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { supabase, user: null as null }
  }

  return { supabase, user }
}

function buildTestNotification(type: 'EXPIRY_SOON' | 'LOW_STOCK', userId: string) {
  const entityId = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  if (type === 'LOW_STOCK') {
    return {
      user_id: userId,
      event_type: 'LOW_STOCK',
      channel: 'PUSH',
      entity_type: 'item',
      entity_id: entityId,
      title: '테스트 재고 부족 알림',
      body: '설정 화면에서 생성한 재고 부족 테스트 알림입니다.',
      payload: {
        source: 'manual_test',
        created_at: createdAt,
        item_name: '테스트 샘플',
        quantity: 0,
        threshold: 1,
      },
      scheduled_at: createdAt,
      dedupe_key: `MANUAL_TEST:LOW_STOCK:${userId}:${entityId}`,
    }
  }

  return {
    user_id: userId,
    event_type: 'EXPIRY_SOON',
    channel: 'PUSH',
    entity_type: 'item',
    entity_id: entityId,
    title: '테스트 만료 알림',
    body: '설정 화면에서 생성한 만료 임박 테스트 알림입니다.',
    payload: {
      source: 'manual_test',
      created_at: createdAt,
      item_name: '테스트 샘플',
      days_before: 3,
    },
    scheduled_at: createdAt,
    dedupe_key: `MANUAL_TEST:EXPIRY_SOON:${userId}:${entityId}`,
  }
}

async function sendTestNotificationNow(admin: ReturnType<typeof createAdminClient>, event: TestNotificationEvent) {
  const { data: tokens, error: tokenError } = await (admin as any)
    .from('notification_push_tokens')
    .select('id, provider_subscription')
    .eq('user_id', event.user_id)
    .eq('provider', 'webpush')
    .eq('is_active', true)
    .order('last_seen_at', { ascending: false })

  if (tokenError) {
    await (admin as any).rpc('mark_notification_event_failed', {
      p_event_id: event.id,
      p_error_message: tokenError.message,
    })
    return { sent: 0, failed: 1, skipped: 0, error: tokenError.message }
  }

  const activeTokens = (tokens ?? []) as PushToken[]

  if (activeTokens.length === 0) {
    await (admin as any).rpc('mark_notification_event_failed', {
      p_event_id: event.id,
      p_error_message: 'No active Web Push subscription',
    })
    return { sent: 0, failed: 0, skipped: 1, error: 'No active Web Push subscription' }
  }

  try {
    configureWebPush()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Web Push 설정이 필요합니다.'
    await (admin as any).rpc('mark_notification_event_failed', {
      p_event_id: event.id,
      p_error_message: message,
    })
    return { sent: 0, failed: 1, skipped: 0, error: message }
  }

  const latestToken = activeTokens[0]
  const subscription = latestToken.provider_subscription

  if (!subscription?.endpoint) {
    await (admin as any).rpc('mark_notification_event_failed', {
      p_event_id: event.id,
      p_error_message: 'Stored subscription is missing endpoint',
    })
    return { sent: 0, failed: 1, skipped: 0, error: 'Stored subscription is missing endpoint' }
  }

  try {
    const response = await webpush.sendNotification(
      subscription,
      JSON.stringify(buildNotificationPayload(event))
    )

    await (admin as any).from('notification_deliveries').insert({
      event_id: event.id,
      token_id: latestToken.id,
      provider: 'webpush',
      status: 'success',
      response_body: {
        statusCode: response.statusCode,
        headers: response.headers,
      },
    })
    await (admin as any).rpc('mark_notification_event_sent', { p_event_id: event.id })

    return { sent: 1, failed: 0, skipped: 0, statusCode: response.statusCode }
  } catch (error) {
    const pushError = error as Error & { statusCode?: number; body?: string }
    const message = pushError.message || 'Web Push delivery failed'

    if (pushError.statusCode === 404 || pushError.statusCode === 410) {
      await (admin as any)
        .from('notification_push_tokens')
        .update({ is_active: false })
        .eq('id', latestToken.id)
    }

    await (admin as any).from('notification_deliveries').insert({
      event_id: event.id,
      token_id: latestToken.id,
      provider: 'webpush',
      status: 'failed',
      error_message: message,
      response_body: {
        statusCode: pushError.statusCode ?? null,
        body: pushError.body ?? null,
      },
    })
    await (admin as any).rpc('mark_notification_event_failed', {
      p_event_id: event.id,
      p_error_message: message,
    })

    return { sent: 0, failed: 1, skipped: 0, error: message }
  }
}

export async function GET(_request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    if (!user) {
      return errorResponse('INTERNAL_ERROR', { message: '로그인이 필요합니다.' }, 401)
    }

    const { data, error } = await (supabase as any)
      .from('notification_events')
      .select('id, event_type, channel, status, title, body, attempt_count, last_error, scheduled_at, sent_at, created_at')
      .eq('user_id', user.id)
      .like('dedupe_key', 'MANUAL_TEST:%')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse(data ?? [])
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser()

    if (!user) {
      return errorResponse('INTERNAL_ERROR', { message: '로그인이 필요합니다.' }, 401)
    }

    let body: unknown = {}

    try {
      body = await request.json()
    } catch {
      body = {}
    }

    const { type } = CreateTestNotificationSchema.parse(body)
    let admin

    try {
      admin = createAdminClient()
    } catch {
      return errorResponse(
        'INTERNAL_ERROR',
        { message: '테스트 알림을 생성하려면 SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.' },
        500
      )
    }

    const payload = buildTestNotification(type, user.id)

    const { data, error } = await (admin as any)
      .from('notification_events')
      .insert(payload)
      .select('id, user_id, event_type, entity_type, entity_id, title, body, payload, status, scheduled_at, created_at')
      .single()

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    const delivery = await sendTestNotificationNow(admin, data as TestNotificationEvent)
    const { data: updatedEvent } = await (admin as any)
      .from('notification_events')
      .select('id, event_type, channel, status, title, body, attempt_count, last_error, scheduled_at, sent_at, created_at')
      .eq('id', data.id)
      .single()

    return successResponse({ event: updatedEvent ?? data, delivery }, undefined, 201)
  } catch (error) {
    return handleError(error)
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

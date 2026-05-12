import { NextRequest } from 'next/server'
import { z } from 'zod'
import { CORS_HEADERS, errorResponse, handleError, successResponse } from '@/lib/api/utils'
import { buildNotificationPayload, configureWebPush, webpush } from '@/lib/notifications/web-push'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const SendUserTestNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(240),
  url: z.string().trim().max(500).optional().default('/'),
})

type PushToken = {
  id: string
  user_id: string
  device_label: string | null
  last_seen_at: string
  provider_subscription: webpush.PushSubscription | null
}

type NotificationEvent = {
  id: string
  user_id: string
  event_type: string
  entity_type: string
  entity_id: string
  title: string
  body: string
  payload: Record<string, unknown>
}

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

function isManualSendEnabled() {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_NOTIFICATION_TEST_SEND === 'true'
}

function normalizeTargetUrl(url: string) {
  return url.startsWith('/') ? url : '/'
}

async function getActivePushUsers(admin: ReturnType<typeof createAdminClient>) {
  const { data, error } = await (admin as any)
    .from('notification_push_tokens')
    .select('id, user_id, device_label, last_seen_at, created_at')
    .eq('provider', 'webpush')
    .eq('is_active', true)
    .order('last_seen_at', { ascending: false })

  if (error) {
    throw error
  }

  const tokens = (data ?? []) as Array<{
    id: string
    user_id: string
    device_label: string | null
    last_seen_at: string
    created_at: string
  }>

  const usersById = new Map<
    string,
    {
      userId: string
      email: string | null
      tokenCount: number
      latestDeviceLabel: string | null
      lastSeenAt: string
    }
  >()

  tokens.forEach((token) => {
    const existing = usersById.get(token.user_id)

    if (!existing) {
      usersById.set(token.user_id, {
        userId: token.user_id,
        email: null,
        tokenCount: 1,
        latestDeviceLabel: token.device_label,
        lastSeenAt: token.last_seen_at,
      })
      return
    }

    existing.tokenCount += 1
  })

  try {
    const { data: authData } = await (admin.auth.admin as any).listUsers({
      page: 1,
      perPage: 1000,
    })

    const authUsers = (authData?.users ?? []) as Array<{ id: string; email?: string }>
    authUsers.forEach((authUser) => {
      const user = usersById.get(authUser.id)

      if (user) {
        user.email = authUser.email ?? null
      }
    })
  } catch {
    // Email labels are optional. User IDs are enough for delivery.
  }

  return Array.from(usersById.values())
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', { message: '로그인이 필요합니다.' }, 401)
    }

    if (!isManualSendEnabled()) {
      return errorResponse('UNAUTHORIZED', { message: '테스트 발송 API가 비활성화되어 있습니다.' }, 403)
    }

    let admin

    try {
      admin = createAdminClient()
    } catch {
      return errorResponse(
        'INTERNAL_ERROR',
        { message: 'SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.' },
        500
      )
    }

    return successResponse({ users: await getActivePushUsers(admin) })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', { message: '로그인이 필요합니다.' }, 401)
    }

    if (!isManualSendEnabled()) {
      return errorResponse('UNAUTHORIZED', { message: '테스트 발송 API가 비활성화되어 있습니다.' }, 403)
    }

    let admin

    try {
      admin = createAdminClient()
    } catch {
      return errorResponse(
        'INTERNAL_ERROR',
        { message: 'SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.' },
        500
      )
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

    const parsed = SendUserTestNotificationSchema.parse(await request.json())
    const targetUrl = normalizeTargetUrl(parsed.url)
    const entityId = crypto.randomUUID()
    const now = new Date().toISOString()

    const { data: event, error: eventError } = await (admin as any)
      .from('notification_events')
      .insert({
        user_id: parsed.userId,
        event_type: 'EXPIRY_SOON',
        channel: 'PUSH',
        entity_type: 'manual_test',
        entity_id: entityId,
        title: parsed.title,
        body: parsed.body,
        payload: {
          source: 'manual_user_push_test',
          requested_by: user.id,
          url: targetUrl,
          created_at: now,
        },
        scheduled_at: now,
        dedupe_key: `MANUAL_USER_TEST:${parsed.userId}:${entityId}`,
      })
      .select('id, user_id, event_type, entity_type, entity_id, title, body, payload')
      .single()

    if (eventError) {
      return errorResponse('DATABASE_ERROR', { message: eventError.message }, 500)
    }

    const { data: tokens, error: tokenError } = await (admin as any)
      .from('notification_push_tokens')
      .select('id, user_id, device_label, last_seen_at, provider_subscription')
      .eq('user_id', parsed.userId)
      .eq('provider', 'webpush')
      .eq('is_active', true)
      .order('last_seen_at', { ascending: false })

    if (tokenError) {
      await (admin as any).rpc('mark_notification_event_failed', {
        p_event_id: event.id,
        p_error_message: tokenError.message,
      })
      return errorResponse('DATABASE_ERROR', { message: tokenError.message }, 500)
    }

    const activeTokens = ((tokens ?? []) as PushToken[]).filter(
      (token) => Boolean(token.provider_subscription?.endpoint)
    )

    if (activeTokens.length === 0) {
      await (admin as any).rpc('mark_notification_event_failed', {
        p_event_id: event.id,
        p_error_message: '활성화된 Web Push 구독이 없습니다.',
      })
      return successResponse({
        eventId: event.id,
        sent: 0,
        failed: 0,
        skipped: 1,
        deliveries: [],
        message: '활성화된 Web Push 구독이 없습니다.',
      })
    }

    const payload = JSON.stringify(buildNotificationPayload(event as NotificationEvent))
    const deliveries = []
    let sent = 0
    let failed = 0

    for (const token of activeTokens) {
      try {
        const response = await webpush.sendNotification(token.provider_subscription!, payload)
        sent += 1

        await (admin as any).from('notification_deliveries').insert({
          event_id: event.id,
          token_id: token.id,
          provider: 'webpush',
          status: 'success',
          response_body: {
            statusCode: response.statusCode,
            headers: response.headers,
          },
        })

        deliveries.push({
          tokenId: token.id,
          deviceLabel: token.device_label,
          status: 'success',
          statusCode: response.statusCode,
        })
      } catch (error) {
        failed += 1
        const pushError = error as Error & { statusCode?: number; body?: string }
        const message = pushError.message || 'Web Push delivery failed'

        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
          await (admin as any)
            .from('notification_push_tokens')
            .update({ is_active: false })
            .eq('id', token.id)
        }

        await (admin as any).from('notification_deliveries').insert({
          event_id: event.id,
          token_id: token.id,
          provider: 'webpush',
          status: 'failed',
          error_message: message,
          response_body: {
            statusCode: pushError.statusCode ?? null,
            body: pushError.body ?? null,
          },
        })

        deliveries.push({
          tokenId: token.id,
          deviceLabel: token.device_label,
          status: 'failed',
          statusCode: pushError.statusCode ?? null,
          error: message,
          body: pushError.body ?? null,
        })
      }
    }

    if (sent > 0) {
      await (admin as any).rpc('mark_notification_event_sent', { p_event_id: event.id })
    } else {
      const firstFailure = deliveries.find((delivery) => delivery.status === 'failed')
      await (admin as any).rpc('mark_notification_event_failed', {
        p_event_id: event.id,
        p_error_message:
          [firstFailure?.error, firstFailure?.body].filter(Boolean).join(': ') ||
          'Web Push delivery failed',
      })
    }

    return successResponse({
      eventId: event.id,
      sent,
      failed,
      skipped: 0,
      deliveries,
    })
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

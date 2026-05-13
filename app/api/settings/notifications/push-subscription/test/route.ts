import { NextRequest } from 'next/server'
import { z } from 'zod'
import { CORS_HEADERS, errorResponse, handleError, successResponse } from '@/lib/api/utils'
import { buildNotificationPayload, configureWebPush, webpush } from '@/lib/notifications/web-push'
import { createClient } from '@/lib/supabase/server'

const WebPushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

const TestSubscriptionSchema = z.object({
  subscription: WebPushSubscriptionSchema,
})

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

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', { message: '로그인이 필요합니다.' }, 401)
    }

    const parsed = TestSubscriptionSchema.parse(await request.json())
    const { data: tokenId, error } = await (supabase as any).rpc('upsert_web_push_subscription', {
      p_subscription: parsed.subscription,
      p_device_label: 'Direct push test',
    })

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
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

    try {
      const response = await webpush.sendNotification(
        parsed.subscription as webpush.PushSubscription,
        JSON.stringify(
          buildNotificationPayload({
            id: crypto.randomUUID(),
            entity_id: crypto.randomUUID(),
            entity_type: 'item',
            event_type: 'EXPIRY_SOON',
            title: 'DAITJI 푸시 수신 테스트',
            body: '이 알림이 보이면 Web Push 수신이 정상입니다.',
            payload: {
              source: 'direct_subscription_test',
            },
          })
        )
      )

      return successResponse({
        statusCode: response.statusCode,
        endpointPrefix: parsed.subscription.endpoint.slice(0, 80),
        tokenId,
      })
    } catch (error) {
      const pushError = error as Error & { statusCode?: number; body?: string }

      return successResponse({
        statusCode: pushError.statusCode ?? null,
        endpointPrefix: parsed.subscription.endpoint.slice(0, 80),
        tokenId,
        error: pushError.message || 'Web Push delivery failed',
        body: pushError.body ?? null,
      })
    }
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

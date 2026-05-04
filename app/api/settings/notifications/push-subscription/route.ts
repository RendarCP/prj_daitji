import { NextRequest } from 'next/server'
import { z } from 'zod'
import { CORS_HEADERS, errorResponse, handleError, successResponse } from '@/lib/api/utils'
import { createClient } from '@/lib/supabase/server'

const WebPushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

const RegisterSubscriptionSchema = z.object({
  subscription: WebPushSubscriptionSchema,
  device_label: z.string().max(120).optional(),
})

const DeleteSubscriptionSchema = z.object({
  endpoint: z.string().url(),
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

    const parsed = RegisterSubscriptionSchema.parse(await request.json())
    const { data, error } = await (supabase as any).rpc('upsert_web_push_subscription', {
      p_subscription: parsed.subscription,
      p_device_label: parsed.device_label ?? null,
    })

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse({ tokenId: data })
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', { message: '로그인이 필요합니다.' }, 401)
    }

    const parsed = DeleteSubscriptionSchema.parse(await request.json())
    const { error } = await (supabase as any)
      .from('notification_push_tokens')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('provider', 'webpush')
      .eq('push_token', parsed.endpoint)

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse({ deactivated: true })
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

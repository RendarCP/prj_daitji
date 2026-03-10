import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { successResponse, errorResponse, handleError, CORS_HEADERS } from '@/lib/api/utils'

const CreateTestNotificationSchema = z.object({
  type: z.enum(['EXPIRY_SOON', 'LOW_STOCK']).default('EXPIRY_SOON'),
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
      .select('id, event_type, status, title, body, scheduled_at, created_at')
      .single()

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse(data, undefined, 201)
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

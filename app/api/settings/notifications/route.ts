import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse, handleError, CORS_HEADERS } from '@/lib/api/utils'

const NotificationSettingsUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  in_app_enabled: z.boolean().optional(),
  expiry_enabled: z.boolean().optional(),
  expiry_days_before: z.array(z.coerce.number().int().min(0).max(365)).max(10).optional(),
  low_stock_enabled: z.boolean().optional(),
  low_stock_threshold: z.coerce.number().int().min(0).max(9999).optional(),
  quiet_hours_start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable().optional(),
  quiet_hours_end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).nullable().optional(),
  timezone: z.string().min(1).max(100).optional(),
})

function normalizeExpiryDays(days?: number[]) {
  if (!days) {
    return undefined
  }

  return Array.from(new Set(days)).sort((a, b) => b - a)
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

export async function GET(_request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    if (!user) {
      return errorResponse('INTERNAL_ERROR', { message: '로그인이 필요합니다.' }, 401)
    }

    const { data, error } = await (supabase as any)
      .from('notification_settings')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      .select('*')
      .single()

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse(data)
  } catch (error) {
    return handleError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    if (!user) {
      return errorResponse('INTERNAL_ERROR', { message: '로그인이 필요합니다.' }, 401)
    }

    const body = await request.json()
    const parsed = NotificationSettingsUpdateSchema.parse(body)

    const updates = {
      ...parsed,
      expiry_days_before: normalizeExpiryDays(parsed.expiry_days_before),
    }

    const { data, error } = await (supabase as any)
      .from('notification_settings')
      .upsert(
        {
          user_id: user.id,
          ...updates,
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single()

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse(data)
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

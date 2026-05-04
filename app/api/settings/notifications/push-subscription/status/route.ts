import { NextRequest } from 'next/server'
import { CORS_HEADERS, errorResponse, handleError, successResponse } from '@/lib/api/utils'
import { createClient } from '@/lib/supabase/server'

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
      return errorResponse('UNAUTHORIZED', { message: '로그인이 필요합니다.' }, 401)
    }

    const { data, error } = await (supabase as any)
      .from('notification_push_tokens')
      .select('id, push_token, is_active, last_seen_at, created_at')
      .eq('user_id', user.id)
      .eq('provider', 'webpush')
      .order('last_seen_at', { ascending: false })
      .limit(5)

    if (error) {
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse(
      (data ?? []).map((token: any) => ({
        id: token.id,
        endpointPrefix: String(token.push_token ?? '').slice(0, 120),
        isActive: Boolean(token.is_active),
        lastSeenAt: token.last_seen_at,
        createdAt: token.created_at,
      }))
    )
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

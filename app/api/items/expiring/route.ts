import { NextRequest } from 'next/server'
import { ExpiringItemsQuerySchema } from '@/lib/validations/schemas'
import {
  successResponse,
  errorResponse,
  handleError,
  parseQueryParams,
  CORS_HEADERS,
} from '@/lib/api/utils'
import { getAuthenticatedClient } from '@/lib/api/auth'
import { mapItemRowToExpiringItem } from '@/lib/server/item-data'

/**
 * GET /api/items/expiring
 * Fetch items expiring within specified days
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rawParams = parseQueryParams(searchParams)

    // Validate query parameters
    const params = ExpiringItemsQuerySchema.parse(rawParams)

    const { supabase, user } = await getAuthenticatedClient()

    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401)
    }

    const { data, error } = await (supabase as any)
      .from('items')
      .select('id, name, type, image_url, metadata, location:locations(name)')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return errorResponse('QUERY_ERROR', { message: error.message }, 500)
    }

    const result = Array.isArray(data)
      ? data
          .map((row) => mapItemRowToExpiringItem(row as any))
          .filter(
            (item) =>
              item.days_until_expiry !== null &&
              Number.isFinite(item.days_until_expiry) &&
              item.days_until_expiry >= 0 &&
              item.days_until_expiry <= params.days
          )
          .sort((a, b) => (a.days_until_expiry ?? 0) - (b.days_until_expiry ?? 0))
      : []

    return successResponse(result)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

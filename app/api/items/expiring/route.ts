import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ExpiringItemsQuerySchema } from '@/lib/validations/schemas'
import {
  successResponse,
  errorResponse,
  handleError,
  parseQueryParams,
  CORS_HEADERS,
} from '@/lib/api/utils'

/**
 * GET /api/items/expiring
 * Fetch items expiring within specified days
 * 
 * Query Parameters:
 * - days: Number of days threshold (default: 7)
 * 
 * Uses the get_expiring_items() database function which returns:
 * - item_id
 * - item_name
 * - item_type
 * - expiry_date
 * - days_until_expiry
 * - location_name
 * - location_path
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rawParams = parseQueryParams(searchParams)
    
    // Validate query parameters
    const params = ExpiringItemsQuerySchema.parse(rawParams)
    
    const supabase = await createClient()
    
    // Call the database function
    const { data, error } = await supabase
      .rpc('get_expiring_items', {
        days_threshold: params.days
      })
    
    if (error) {
      console.error('Database error:', error)
      return errorResponse('QUERY_ERROR', { message: error.message }, 500)
    }
    
    return successResponse(data || [])
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

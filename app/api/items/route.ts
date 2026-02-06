import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ItemFormDataSchema, ItemsQuerySchema } from '@/lib/validations/schemas'
import {
  successResponse,
  errorResponse,
  handleError,
  parseQueryParams,
  applyFilters,
  applySorting,
  applyPagination,
  getPaginationMeta,
  CORS_HEADERS,
} from '@/lib/api/utils'

/**
 * GET /api/items
 * Fetch items with filtering, sorting, and pagination
 * 
 * Query Parameters:
 * - type: Filter by item type (comma-separated)
 * - status: Filter by item status (comma-separated)
 * - location_id: Filter by location UUID
 * - search: Search by item name (case-insensitive)
 * - expiring_within_days: Filter items expiring within N days
 * - page: Page number (default: 1)
 * - per_page: Items per page (default: 20, max: 100)
 * - sort_by: Sort field (default: created_at)
 * - sort_dir: Sort direction (asc/desc, default: desc)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rawParams = parseQueryParams(searchParams)
    
    // Validate query parameters
    const params = ItemsQuerySchema.parse(rawParams)
    
    const supabase = await createClient()
    
    // Use view for better performance with location data
    let query = supabase
      .from('v_active_items_with_location')
      .select('*', { count: 'exact' })
    
    // Apply filters
    query = applyFilters(query, params)
    
    // Apply expiry filter if provided
    if (params.expiring_within_days !== undefined) {
      query = query
        .not('days_until_expiry', 'is', null)
        .lte('days_until_expiry', params.expiring_within_days)
        .gte('days_until_expiry', 0)
    }
    
    // Apply sorting
    query = applySorting(query, params.sort_by, params.sort_dir)
    
    // Apply pagination
    query = applyPagination(query, params.page, params.per_page)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Database error:', error)
      return errorResponse('QUERY_ERROR', { message: error.message }, 500)
    }
    
    // Calculate pagination metadata
    const meta = getPaginationMeta(count || 0, params.page, params.per_page)
    
    return successResponse(data || [], meta)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/items
 * Create a new item
 * 
 * Request Body:
 * {
 *   name: string (required)
 *   type: 'FOOD' | 'COSMETIC' | 'MEDICINE' | 'GENERAL' (required)
 *   location_id: string (required, UUID)
 *   quantity: number (default: 1)
 *   barcode?: string
 *   image_url?: string
 *   tags?: string[]
 *   metadata?: object
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = ItemFormDataSchema.parse(body)
    
    const supabase = await createClient()
    
    // Verify location exists
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('id', validatedData.location_id)
      .single()
    
    if (locationError || !location) {
      return errorResponse('LOCATION_NOT_FOUND', undefined, 404)
    }
    
    // Insert item
    const { data, error } = await supabase
      .from('items')
      .insert({
        name: validatedData.name,
        type: validatedData.type,
        location_id: validatedData.location_id,
        quantity: validatedData.quantity,
        barcode: validatedData.barcode || null,
        image_url: validatedData.image_url || null,
        tags: validatedData.tags,
        metadata: validatedData.metadata,
      })
      .select(`
        *,
        location:locations(*)
      `)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }
    
    return successResponse(data, undefined, 201)
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

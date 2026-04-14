import { NextRequest } from 'next/server'
import { LocationFormDataSchema, LocationsQuerySchema } from '@/lib/validations/schemas'
import {
  successResponse,
  errorResponse,
  handleError,
  parseQueryParams,
  applyFilters,
  CORS_HEADERS,
} from '@/lib/api/utils'
import { Location } from '@/lib/types'
import { getAuthenticatedClient } from '@/lib/api/auth'
import {
  buildLocationTree,
  getActiveItemCountByLocation,
  mapLocationRowsWithCounts,
} from '@/lib/server/location-data'

/**
 * GET /api/locations
 * Fetch locations with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rawParams = parseQueryParams(searchParams)

    // Validate query parameters
    const params = LocationsQuerySchema.parse(rawParams)

    const { supabase, user } = await getAuthenticatedClient()
    const db = supabase as any

    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401)
    }

    let query = db
      .from('locations')
      .select('id, name, level, parent_id, icon, color, description, sort_order')
      .eq('user_id', user.id)
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true })

    query = applyFilters(query, params)

    const { data: rawData, error } = await query

    if (error) {
      console.error('Database error:', error)
      return errorResponse('QUERY_ERROR', { message: error.message }, 500)
    }

    const locationRows = Array.isArray(rawData)
      ? (rawData as Array<Record<string, any>>)
      : []

    const locationIds = locationRows.map((row) => String(row.id))
    const activeItemCountByLocation = await getActiveItemCountByLocation(
      db,
      user.id,
      locationIds
    )

    const data: Location[] = mapLocationRowsWithCounts(
      locationRows,
      activeItemCountByLocation
    )

    // Return as tree or flat list based on query param
    const result = params.tree ? buildLocationTree(data || []) : data || []

    return successResponse(result)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * POST /api/locations
 * Create a new location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = LocationFormDataSchema.parse(body)

    const { supabase, user } = await getAuthenticatedClient()
    const db = supabase as any

    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401)
    }

    // If parent_id is provided, verify it exists, belongs to user, and level is correct
    if (validatedData.parent_id) {
      const { data: parent, error: parentError } = await db
        .from('locations')
        .select('id, level')
        .eq('id', validatedData.parent_id)
        .eq('user_id', user.id)
        .single()

      if (parentError || !parent) {
        return errorResponse('INVALID_PARENT', { message: '부모 위치를 찾을 수 없습니다' }, 404)
      }

      // Validate level hierarchy
      if (validatedData.level !== parent.level + 1) {
        return errorResponse(
          'VALIDATION_ERROR',
          { message: `이 부모 위치의 레벨은 ${parent.level + 1}이어야 합니다` },
          400
        )
      }
    } else {
      // Root locations must be level 1
      if (validatedData.level !== 1) {
        return errorResponse(
          'VALIDATION_ERROR',
          { message: '루트 위치의 레벨은 1이어야 합니다' },
          400
        )
      }
    }

    // Insert location
    const { data, error } = await db
      .from('locations')
      .insert({
        name: validatedData.name,
        level: validatedData.level,
        parent_id: validatedData.parent_id || null,
        icon: validatedData.icon || null,
        color: validatedData.color || null,
        description: validatedData.description || null,
        sort_order: validatedData.sort_order || 0,
        user_id: user.id,
      })
      .select()
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

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

/**
 * Build tree structure from flat location list
 */
function buildLocationTree(locations: Location[]): Location[] {
  const locationMap = new Map<string, any>()
  const roots: any[] = []

  // First pass: create map of all locations
  locations.forEach((location) => {
    locationMap.set(location.id, { ...location, children: [] })
  })

  // Second pass: build tree structure
  locations.forEach((location) => {
    const node = locationMap.get(location.id)
    if (location.parent_id && locationMap.has(location.parent_id)) {
      const parent = locationMap.get(location.parent_id)
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // Sort by sort_order
  const sortChildren = (nodes: any[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order)
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortChildren(node.children)
      }
    })
  }

  sortChildren(roots)
  return roots
}

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
      .select('id, name, level, parent_id, icon, color, sort_order')
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
    const activeItemCountByLocation = new Map<string, number>()

    if (locationIds.length > 0) {
      const { data: activeItems, error: countError } = await db
        .from('items')
        .select('location_id')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .in('location_id', locationIds)

      if (countError) {
        console.error('Count error:', countError)
      } else if (Array.isArray(activeItems)) {
        for (const item of activeItems) {
          const locationId = item.location_id as string
          activeItemCountByLocation.set(
            locationId,
            (activeItemCountByLocation.get(locationId) ?? 0) + 1
          )
        }
      }
    }

    const data: Location[] = locationRows.map((row) => ({
      id: String(row.id),
      name: String(row.name ?? ''),
      level: Number(row.level ?? 1),
      parent_id: (row.parent_id as string | null | undefined) ?? null,
      icon: (row.icon as string | null | undefined) ?? null,
      color: (row.color as string | null | undefined) ?? null,
      item_count: activeItemCountByLocation.get(String(row.id)) ?? 0,
      itemCount: activeItemCountByLocation.get(String(row.id)) ?? 0,
      sort_order: Number(row.sort_order ?? 0),
    }))

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

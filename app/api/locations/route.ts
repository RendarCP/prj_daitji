import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

/**
 * Build tree structure from flat location list
 */
function buildLocationTree(locations: Location[]): Location[] {
  const locationMap = new Map<string, any>()
  const roots: any[] = []
  
  // First pass: create map of all locations
  locations.forEach(location => {
    locationMap.set(location.id, { ...location, children: [] })
  })
  
  // Second pass: build tree structure
  locations.forEach(location => {
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
    nodes.forEach(node => {
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
 * 
 * Query Parameters:
 * - level: Filter by location level (1-10)
 * - parent_id: Filter by parent location UUID (null for root locations)
 * - search: Search by location name (case-insensitive)
 * - tree: Return as tree structure (true/false, default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const rawParams = parseQueryParams(searchParams)
    
    // Validate query parameters
    const params = LocationsQuerySchema.parse(rawParams)
    
    const supabase = await createClient()
    
    let query = supabase
      .from('locations')
      .select('*')
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true })
    
    // Apply filters
    query = applyFilters(query, params)
    
    const { data, error } = await query
    
    if (error) {
      console.error('Database error:', error)
      return errorResponse('QUERY_ERROR', { message: error.message }, 500)
    }
    
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
 * 
 * Request Body:
 * {
 *   name: string (required)
 *   level: number (required, 1-10)
 *   parent_id?: string (UUID, optional)
 *   icon?: string
 *   color?: string (hex color)
 *   sort_order?: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = LocationFormDataSchema.parse(body)
    
    const supabase = await createClient()
    
    // If parent_id is provided, verify it exists and level is correct
    if (validatedData.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from('locations')
        .select('id, level')
        .eq('id', validatedData.parent_id)
        .single()
      
      if (parentError || !parent) {
        return errorResponse('INVALID_PARENT', { message: 'Parent location not found' }, 404)
      }
      
      // Validate level hierarchy
      if (validatedData.level !== parent.level + 1) {
        return errorResponse(
          'VALIDATION_ERROR',
          { message: `Level must be ${parent.level + 1} for this parent location` },
          400
        )
      }
    } else {
      // Root locations must be level 1
      if (validatedData.level !== 1) {
        return errorResponse(
          'VALIDATION_ERROR',
          { message: 'Root locations must have level 1' },
          400
        )
      }
    }
    
    // Insert location
    const { data, error } = await supabase
      .from('locations')
      .insert({
        name: validatedData.name,
        level: validatedData.level,
        parent_id: validatedData.parent_id || null,
        icon: validatedData.icon || null,
        color: validatedData.color || null,
        sort_order: validatedData.sort_order || 0,
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

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  successResponse,
  errorResponse,
  handleError,
  CORS_HEADERS,
} from '@/lib/api/utils'

/**
 * GET /api/locations/[id]/path
 * Get the hierarchical path for a location
 * 
 * @param id - Location UUID
 * 
 * Returns an array of location objects from root to the specified location
 * Example: [{ id: "...", name: "주방", icon: "🍳" }, { id: "...", name: "냉장고", icon: "🧊" }]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return errorResponse('INVALID_ID', undefined, 400)
    }
    
    const supabase = await createClient()
    
    // First, verify the location exists
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('id', id)
      .single()
    
    if (locationError || !location) {
      return errorResponse('LOCATION_NOT_FOUND', undefined, 404)
    }
    
    // Build the path by traversing up the hierarchy
    type PathLocation = { id: string; name: string; icon: string | null; parent_id: string | null }
    const path: Array<{ id: string; name: string; icon?: string | null }> = []
    let currentId: string | null = id
    
    while (currentId) {
      const result = await supabase
        .from('locations')
        .select('id, name, icon, parent_id')
        .eq('id', currentId)
        .single()
      
      const locData = result.data as PathLocation | null
      
      if (result.error || !locData) {
        break
      }
      
      // Prepend to build path from root to target
      path.unshift({
        id: locData.id,
        name: locData.name,
        icon: locData.icon,
      })
      
      currentId = locData.parent_id
    }
    
    return successResponse({ path })
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

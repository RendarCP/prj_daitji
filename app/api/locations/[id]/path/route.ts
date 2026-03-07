import { NextRequest } from 'next/server'
import {
  successResponse,
  errorResponse,
  handleError,
  CORS_HEADERS,
} from '@/lib/api/utils'
import { getAuthenticatedClient } from '@/lib/api/auth'

/**
 * GET /api/locations/[id]/path
 * Get the hierarchical path for a location
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

    const { supabase, user } = await getAuthenticatedClient()

    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401)
    }

    // First, verify the location exists and belongs to user
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (locationError || !location) {
      return errorResponse('LOCATION_NOT_FOUND', undefined, 404)
    }

    // Build the path by traversing up the hierarchy within the same user
    type PathLocation = { id: string; name: string; icon: string | null; parent_id: string | null }
    const path: Array<{ id: string; name: string; icon?: string | null }> = []
    let currentId: string | null = id

    while (currentId) {
      const result = await supabase
        .from('locations')
        .select('id, name, icon, parent_id')
        .eq('id', currentId)
        .eq('user_id', user.id)
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

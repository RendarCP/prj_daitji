import { NextRequest } from 'next/server'
import { LocationUpdateSchema } from '@/lib/validations/schemas'
import {
  successResponse,
  errorResponse,
  handleError,
  CORS_HEADERS,
} from '@/lib/api/utils'
import { getAuthenticatedClient } from '@/lib/api/auth'

/**
 * GET /api/locations/[id]
 * Fetch a single location by ID with children and item counts
 *
 * @param id - Location UUID
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
    const db = supabase as any

    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401)
    }

    // Fetch location (same user only)
    const { data: location, error: locationError } = await db
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (locationError) {
      if (locationError.code === 'PGRST116') {
        return errorResponse('LOCATION_NOT_FOUND', undefined, 404)
      }
      console.error('Database error:', locationError)
      return errorResponse('QUERY_ERROR', { message: locationError.message }, 500)
    }

    const { data: children, error: childrenError } = await db
      .from('locations')
      .select('*')
      .eq('parent_id', id)
      .eq('user_id', user.id)

    if (childrenError) {
      console.error('Database error:', childrenError)
      return errorResponse('QUERY_ERROR', { message: childrenError.message }, 500)
    }

    // Count items in this location for current user
    const { count: itemCount, error: countError } = await db
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', id)
      .eq('user_id', user.id)

    if (countError) {
      console.error('Count error:', countError)
    }

    // Add item count to response
    const result = {
      ...(location || {}),
      children: children || [],
      item_count: itemCount || 0,
    }

    return successResponse(result)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * PATCH /api/locations/[id]
 * Update an existing location
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return errorResponse('INVALID_ID', undefined, 400)
    }

    const body = await request.json()

    // Validate request body (partial update)
    const validatedData = LocationUpdateSchema.parse(body)

    // Check if update data is empty
    if (Object.keys(validatedData).length === 0) {
      return errorResponse('VALIDATION_ERROR', { message: '업데이트할 필드가 없습니다' }, 400)
    }

    const { supabase, user } = await getAuthenticatedClient()
    const db = supabase as any

    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401)
    }

    // Fetch current location
    const { data: currentLocation, error: fetchError } = await db
      .from('locations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('LOCATION_NOT_FOUND', undefined, 404)
      }
      return errorResponse('QUERY_ERROR', { message: fetchError.message }, 500)
    }

    // Validate parent_id and level if being updated
    if (validatedData.parent_id !== undefined) {
      if (validatedData.parent_id === id) {
        return errorResponse(
          'VALIDATION_ERROR',
          { message: '위치는 자기 자신을 부모로 지정할 수 없습니다' },
          400
        )
      }

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

        // If level is also being updated, validate it
        const newLevel = validatedData.level !== undefined ? validatedData.level : currentLocation.level
        if (newLevel !== parent.level + 1) {
          return errorResponse(
            'VALIDATION_ERROR',
            { message: `이 부모 위치의 레벨은 ${parent.level + 1}이어야 합니다` },
            400
          )
        }
      } else {
        // Setting parent to null means root level
        const newLevel = validatedData.level !== undefined ? validatedData.level : currentLocation.level
        if (newLevel !== 1) {
          return errorResponse(
            'VALIDATION_ERROR',
            { message: '루트 위치의 레벨은 1이어야 합니다' },
            400
          )
        }
      }
    }

    // Update location
    const { data, error } = await db
      .from('locations')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse(data)
  } catch (error) {
    return handleError(error)
  }
}

/**
 * DELETE /api/locations/[id]
 * Delete a location by ID
 *
 * @param id - Location UUID
 *
 * Note: Cannot delete location if it has child locations or items
 * (enforced by ON DELETE RESTRICT in database)
 */
export async function DELETE(
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
    const db = supabase as any

    if (!user) {
      return errorResponse('UNAUTHORIZED', undefined, 401)
    }

    // Check if location has children (same user only)
    const { data: children, error: childrenError } = await db
      .from('locations')
      .select('id')
      .eq('parent_id', id)
      .eq('user_id', user.id)
      .limit(1)

    if (childrenError) {
      console.error('Database error:', childrenError)
      return errorResponse('QUERY_ERROR', { message: childrenError.message }, 500)
    }

    if (children && children.length > 0) {
      return errorResponse('LOCATION_HAS_CHILDREN', undefined, 409)
    }

    // Check if location has items for current user
    const { count: itemCount, error: countError } = await db
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', id)
      .eq('user_id', user.id)

    if (countError) {
      console.error('Count error:', countError)
      return errorResponse('QUERY_ERROR', { message: countError.message }, 500)
    }

    if (itemCount && itemCount > 0) {
      return errorResponse('LOCATION_HAS_ITEMS', undefined, 409)
    }

    // Delete location
    const { error } = await db
      .from('locations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('LOCATION_NOT_FOUND', undefined, 404)
      }
      console.error('Database error:', error)
      return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
    }

    return successResponse({ message: '위치를 성공적으로 삭제했습니다' }, undefined, 200)
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

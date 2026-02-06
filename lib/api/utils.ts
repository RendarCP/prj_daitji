import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiResponse } from '@/lib/types'
import { API_ERRORS, ApiErrorCode } from './errors'

/**
 * API utility functions for consistent response handling
 */

// CORS headers configuration
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * Create a successful API response
 */
export function successResponse<T>(
  data: T,
  meta?: ApiResponse<T>['meta'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    {
      status,
      headers: CORS_HEADERS,
    }
  )
}

/**
 * Create an error API response
 */
export function errorResponse(
  errorKey: ApiErrorCode,
  details?: any,
  status: number = 400
): NextResponse<ApiResponse> {
  const error = API_ERRORS[errorKey]
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(details && { details }),
      },
    },
    {
      status,
      headers: CORS_HEADERS,
    }
  )
}

/**
 * Handle Zod validation errors
 */
export function handleValidationError(error: ZodError): NextResponse<ApiResponse> {
  const details = error.issues.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
  }))

  return errorResponse('VALIDATION_ERROR', details, 400)
}

/**
 * Handle database errors
 */
export function handleDatabaseError(error: any): NextResponse<ApiResponse> {
  console.error('Database error:', error)

  // Check for specific error codes
  if (error.code === '23503') {
    // Foreign key violation
    return errorResponse('INVALID_PARENT', { dbError: error.message }, 400)
  }

  if (error.code === '23505') {
    // Unique violation
    return errorResponse('DATABASE_ERROR', { message: 'Resource already exists' }, 409)
  }

  return errorResponse('DATABASE_ERROR', { message: error.message }, 500)
}

/**
 * Handle general errors
 */
export function handleError(error: unknown): NextResponse<ApiResponse> {
  console.error('API error:', error)

  if (error instanceof ZodError) {
    return handleValidationError(error)
  }

  if (error && typeof error === 'object' && 'code' in error) {
    return handleDatabaseError(error)
  }

  return errorResponse('INTERNAL_ERROR', undefined, 500)
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams(searchParams: URLSearchParams): Record<string, any> {
  const params: Record<string, any> = {}
  
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

/**
 * Build Supabase query with filters
 */
export function applyFilters(query: any, filters: Record<string, any>) {
  let filteredQuery = query

  // Apply search filter
  if (filters.search) {
    filteredQuery = filteredQuery.ilike('name', `%${filters.search}%`)
  }

  // Apply type filter
  if (filters.type) {
    const types = filters.type.split(',')
    filteredQuery = filteredQuery.in('type', types)
  }

  // Apply status filter
  if (filters.status) {
    const statuses = filters.status.split(',')
    filteredQuery = filteredQuery.in('status', statuses)
  }

  // Apply location filter
  if (filters.location_id) {
    filteredQuery = filteredQuery.eq('location_id', filters.location_id)
  }

  // Apply level filter
  if (filters.level !== undefined) {
    filteredQuery = filteredQuery.eq('level', filters.level)
  }

  // Apply parent_id filter
  if ('parent_id' in filters) {
    if (filters.parent_id === null || filters.parent_id === 'null') {
      filteredQuery = filteredQuery.is('parent_id', null)
    } else {
      filteredQuery = filteredQuery.eq('parent_id', filters.parent_id)
    }
  }

  return filteredQuery
}

/**
 * Apply sorting to query
 */
export function applySorting(query: any, sortBy: string, sortDir: 'asc' | 'desc') {
  return query.order(sortBy, { ascending: sortDir === 'asc' })
}

/**
 * Apply pagination to query
 */
export function applyPagination(query: any, page: number, perPage: number) {
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  return query.range(from, to)
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMeta(total: number, page: number, perPage: number) {
  return {
    page,
    per_page: perPage,
    total,
    total_pages: Math.ceil(total / perPage),
  }
}

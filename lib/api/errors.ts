/**
 * API Error codes and messages
 */

export const API_ERRORS = {
  // Validation errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid request data',
  },
  INVALID_ID: {
    code: 'INVALID_ID',
    message: 'Invalid ID format',
  },

  // Resource errors
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Resource not found',
  },
  ITEM_NOT_FOUND: {
    code: 'ITEM_NOT_FOUND',
    message: 'Item not found',
  },
  LOCATION_NOT_FOUND: {
    code: 'LOCATION_NOT_FOUND',
    message: 'Location not found',
  },

  // Business logic errors
  LOCATION_HAS_ITEMS: {
    code: 'LOCATION_HAS_ITEMS',
    message: 'Cannot delete location with items',
  },
  LOCATION_HAS_CHILDREN: {
    code: 'LOCATION_HAS_CHILDREN',
    message: 'Cannot delete location with child locations',
  },
  INVALID_PARENT: {
    code: 'INVALID_PARENT',
    message: 'Invalid parent location',
  },

  // Database errors
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'Database operation failed',
  },
  QUERY_ERROR: {
    code: 'QUERY_ERROR',
    message: 'Failed to execute query',
  },

  // Server errors
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  },
} as const

export type ApiErrorCode = keyof typeof API_ERRORS

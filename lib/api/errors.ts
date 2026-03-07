/**
 * API Error codes and messages
 */

export const API_ERRORS = {
  // Validation errors
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: '요청 데이터가 올바르지 않습니다',
  },
  INVALID_ID: {
    code: 'INVALID_ID',
    message: 'ID 형식이 올바르지 않습니다',
  },

  // Resource errors
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: '요청한 리소스를 찾을 수 없습니다',
  },
  ITEM_NOT_FOUND: {
    code: 'ITEM_NOT_FOUND',
    message: '물품을 찾을 수 없습니다',
  },
  LOCATION_NOT_FOUND: {
    code: 'LOCATION_NOT_FOUND',
    message: '위치를 찾을 수 없습니다',
  },

  // Business logic errors
  LOCATION_HAS_ITEMS: {
    code: 'LOCATION_HAS_ITEMS',
    message: '물품이 있는 위치는 삭제할 수 없습니다',
  },
  LOCATION_HAS_CHILDREN: {
    code: 'LOCATION_HAS_CHILDREN',
    message: '하위 위치가 있는 위치는 삭제할 수 없습니다',
  },
  INVALID_PARENT: {
    code: 'INVALID_PARENT',
    message: '부모 위치가 올바르지 않습니다',
  },

  // Database errors
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: '데이터베이스 작업에 실패했습니다',
  },
  QUERY_ERROR: {
    code: 'QUERY_ERROR',
    message: '쿼리 실행에 실패했습니다',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: '로그인이 필요합니다',
  },

  // Server errors
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: '서버 내부 오류가 발생했습니다',
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: '예상치 못한 오류가 발생했습니다',
  },
} as const

export type ApiErrorCode = keyof typeof API_ERRORS

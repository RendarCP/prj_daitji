import { NextRequest } from 'next/server'
import { CORS_HEADERS, errorResponse, successResponse } from '@/lib/api/utils'
import { getWebPushPublicKey } from '@/lib/notifications/web-push'

export async function GET(_request: NextRequest) {
  const publicKey = getWebPushPublicKey()

  if (!publicKey) {
    return errorResponse(
      'INTERNAL_ERROR',
      { message: 'WEB_PUSH_PUBLIC_KEY 설정이 필요합니다.' },
      500
    )
  }

  return successResponse({ publicKey })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  })
}

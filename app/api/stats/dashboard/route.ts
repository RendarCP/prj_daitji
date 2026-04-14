import { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  handleError,
  CORS_HEADERS,
} from "@/lib/api/utils";
import { getAuthenticatedClient } from "@/lib/api/auth";
import { fetchDashboardOverview } from "@/lib/server/dashboard-overview";

/**
 * GET /api/stats/dashboard
 * Fetch dashboard statistics
 */
export async function GET(_request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedClient();

    if (!user) {
      return errorResponse("UNAUTHORIZED", undefined, 401);
    }

    const stats = await fetchDashboardOverview(supabase, user.id);
    return successResponse(stats);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

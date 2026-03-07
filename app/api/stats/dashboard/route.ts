import { NextRequest } from "next/server";
import { DashboardStats } from "@/lib/types";
import {
  successResponse,
  errorResponse,
  handleError,
  CORS_HEADERS,
} from "@/lib/api/utils";
import { getAuthenticatedClient } from "@/lib/api/auth";
import { computeItemExpiryDate, getDaysUntilExpiry } from "@/lib/utils/expiry";

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

    // Run all queries in parallel for better performance
    const [
      totalItemsResult,
      activeItemsResult,
      activeItemsForExpiryResult,
      locationsResult,
    ] = await Promise.all([
      // Total items count
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),

      // Active items count
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "ACTIVE"),

      // Expiry 계산 대상 active items
      supabase
        .from("items")
        .select("type, metadata")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE"),

      // Total locations count
      supabase
        .from("locations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    // Check for errors
    if (totalItemsResult.error) {
      console.error("Error counting total items:", totalItemsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: totalItemsResult.error.message },
        500,
      );
    }

    if (activeItemsResult.error) {
      console.error("Error counting active items:", activeItemsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: activeItemsResult.error.message },
        500,
      );
    }

    if (activeItemsForExpiryResult.error) {
      console.error("Error fetching items for expiry calc:", activeItemsForExpiryResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: activeItemsForExpiryResult.error.message },
        500,
      );
    }

    if (locationsResult.error) {
      console.error("Error counting locations:", locationsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: locationsResult.error.message },
        500,
      );
    }

    const expiryRows = Array.isArray(activeItemsForExpiryResult.data)
      ? (activeItemsForExpiryResult.data as Array<{
          type: "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";
          metadata: unknown;
        }>)
      : [];

    const expiryDays = expiryRows
      .map((item) => {
        const expiryDate = computeItemExpiryDate(item.type, item.metadata);
        return getDaysUntilExpiry(expiryDate);
      })
      .filter((days): days is number => days !== null);

    const expiringSoonCount = expiryDays.filter((days) => days >= 0 && days <= 7).length;
    const expiredCount = expiryDays.filter((days) => days < 0).length;

    // Build stats object
    const stats: DashboardStats = {
      total_items: totalItemsResult.count || 0,
      active_items: activeItemsResult.count || 0,
      expiring_soon: expiringSoonCount,
      expired: expiredCount,
      locations_count: locationsResult.count || 0,
    };

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

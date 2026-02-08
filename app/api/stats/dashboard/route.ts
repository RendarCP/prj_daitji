import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/lib/types";
import {
  successResponse,
  errorResponse,
  handleError,
  CORS_HEADERS,
} from "@/lib/api/utils";

/**
 * GET /api/stats/dashboard
 * Fetch dashboard statistics
 *
 * Returns:
 * {
 *   total_items: number - Total number of items
 *   active_items: number - Number of active items
 *   expiring_soon: number - Items expiring within 7 days
 *   expired: number - Already expired items
 *   locations_count: number - Total number of locations
 * }
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Run all queries in parallel for better performance
    const [
      totalItemsResult,
      activeItemsResult,
      expiringSoonResult,
      expiredResult,
      locationsResult,
    ] = await Promise.all([
      // Total items count
      supabase.from("items").select("*", { count: "exact", head: true }),

      // Active items count
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE"),

      // Expiring soon (within 7 days)
      supabase
        .from("v_active_items_with_location")
        .select("*", { count: "exact", head: true })
        .not("computed_expiry_date", "is", null)
        .gte("computed_expiry_date", new Date().toISOString().split("T")[0])
        .lte(
          "computed_expiry_date",
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        ),

      // Expired items
      supabase
        .from("v_active_items_with_location")
        .select("*", { count: "exact", head: true })
        .not("computed_expiry_date", "is", null)
        .lt("computed_expiry_date", new Date().toISOString().split("T")[0]),

      // Total locations count (using hierarchical stats view)
      supabase.from("v_location_stats").select("*", { count: "exact", head: true }),
    ]);

    // Check for errors
    if (totalItemsResult.error) {
      console.error("Error counting total items:", totalItemsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: totalItemsResult.error.message },
        500
      );
    }

    if (activeItemsResult.error) {
      console.error("Error counting active items:", activeItemsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: activeItemsResult.error.message },
        500
      );
    }

    if (expiringSoonResult.error) {
      console.error("Error counting expiring items:", expiringSoonResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: expiringSoonResult.error.message },
        500
      );
    }

    if (expiredResult.error) {
      console.error("Error counting expired items:", expiredResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: expiredResult.error.message },
        500
      );
    }

    if (locationsResult.error) {
      console.error("Error counting locations:", locationsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: locationsResult.error.message },
        500
      );
    }

    // Build stats object
    const stats: DashboardStats = {
      total_items: totalItemsResult.count || 0,
      active_items: activeItemsResult.count || 0,
      expiring_soon: expiringSoonResult.count || 0,
      expired: expiredResult.count || 0,
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

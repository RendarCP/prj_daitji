import { NextRequest } from "next/server";
import { format, startOfWeek, subWeeks } from "date-fns";
import {
  DashboardLocationHighlight,
  DashboardLocationStat,
  DashboardOverviewResponse,
  DashboardTypeStat,
} from "@/lib/types";
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

    const recentWindowStart = startOfWeek(subWeeks(new Date(), 7), {
      weekStartsOn: 1,
    }).toISOString();

    const [
      totalItemsResult,
      activeItemsResult,
      locationsResult,
      notificationSettingsResult,
      recentItemsResult,
    ] = await Promise.all([
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),

      supabase
        .from("items")
        .select("type, metadata, quantity, location_id, created_at, location:locations(id, name, level)")
        .eq("user_id", user.id)
        .eq("status", "ACTIVE"),

      supabase
        .from("locations")
        .select("id, name, level")
        .eq("user_id", user.id),

      (supabase as any)
        .from("notification_settings")
        .select("low_stock_threshold")
        .eq("user_id", user.id)
        .maybeSingle(),

      supabase
        .from("items")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", recentWindowStart),
    ]);

    if (totalItemsResult.error) {
      console.error("Error counting total items:", totalItemsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: totalItemsResult.error.message },
        500,
      );
    }

    if (activeItemsResult.error) {
      console.error("Error fetching active items:", activeItemsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: activeItemsResult.error.message },
        500,
      );
    }

    if (locationsResult.error) {
      console.error("Error fetching locations:", locationsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: locationsResult.error.message },
        500,
      );
    }

    if (notificationSettingsResult.error) {
      console.error(
        "Error fetching notification settings:",
        notificationSettingsResult.error,
      );
      return errorResponse(
        "QUERY_ERROR",
        { message: notificationSettingsResult.error.message },
        500,
      );
    }

    if (recentItemsResult.error) {
      console.error("Error fetching recent items:", recentItemsResult.error);
      return errorResponse(
        "QUERY_ERROR",
        { message: recentItemsResult.error.message },
        500,
      );
    }

    const activeItems = Array.isArray(activeItemsResult.data)
      ? (activeItemsResult.data as Array<{
          type: "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";
          metadata: unknown;
          quantity: number | null;
          location_id: string;
          created_at: string | null;
          location:
            | {
                id: string;
                name: string;
                level: number | null;
              }
            | {
                id: string;
                name: string;
                level: number | null;
              }[]
            | null;
        }>)
      : [];

    const locations = Array.isArray(locationsResult.data)
      ? (locationsResult.data as Array<{
          id: string;
          name: string;
          level: number | null;
        }>)
      : [];
    const recentItems = Array.isArray(recentItemsResult.data)
      ? (recentItemsResult.data as Array<{
          created_at: string | null;
        }>)
      : [];

    const defaultLowStockThreshold =
      typeof notificationSettingsResult.data?.low_stock_threshold === "number"
        ? notificationSettingsResult.data.low_stock_threshold
        : 1;

    const typeCounts = new Map<DashboardTypeStat["type"], number>([
      ["FOOD", 0],
      ["COSMETIC", 0],
      ["MEDICINE", 0],
      ["GENERAL", 0],
    ]);
    const locationStatsMap = new Map<string, DashboardLocationStat>();
    const expiryBuckets = {
      expired: 0,
      due_in_3_days: 0,
      due_in_7_days: 0,
      safe: 0,
    };
    let lowStockCount = 0;

    for (const location of locations) {
      locationStatsMap.set(String(location.id), {
        location_id: String(location.id),
        location_name: String(location.name),
        item_count: 0,
        expiring_soon_count: 0,
        level: Number(location.level ?? 0),
      });
    }

    for (const item of activeItems) {
      typeCounts.set(item.type, (typeCounts.get(item.type) ?? 0) + 1);

      const expiryDate = computeItemExpiryDate(item.type, item.metadata);
      const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

      if (daysUntilExpiry !== null && daysUntilExpiry < 0) {
        expiryBuckets.expired += 1;
      } else if (daysUntilExpiry !== null && daysUntilExpiry <= 3) {
        expiryBuckets.due_in_3_days += 1;
      } else if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
        expiryBuckets.due_in_7_days += 1;
      } else {
        expiryBuckets.safe += 1;
      }

      const metadata =
        item.metadata && typeof item.metadata === "object"
          ? (item.metadata as Record<string, unknown>)
          : {};
      const rawThreshold = metadata.low_stock_threshold;
      const parsedThreshold =
        typeof rawThreshold === "number"
          ? rawThreshold
          : typeof rawThreshold === "string" && /^\d+$/.test(rawThreshold)
            ? Number(rawThreshold)
            : defaultLowStockThreshold;

      if ((item.quantity ?? 0) <= parsedThreshold) {
        lowStockCount += 1;
      }

      const locationKey = String(item.location_id);
      const existingLocation = locationStatsMap.get(locationKey);
      const locationFromJoin = (
        Array.isArray(item.location) ? item.location[0] : item.location
      ) as
        | {
            id: string;
            name: string;
            level: number | null;
          }
        | null;

      if (existingLocation) {
        existingLocation.item_count += 1;
        if (daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7) {
          existingLocation.expiring_soon_count += 1;
        }
      } else if (locationFromJoin?.id && locationFromJoin.name) {
        locationStatsMap.set(locationKey, {
          location_id: String(locationFromJoin.id),
          location_name: String(locationFromJoin.name),
          item_count: 1,
          expiring_soon_count:
            daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7
              ? 1
              : 0,
          level: Number(locationFromJoin.level ?? 0),
        });
      }
    }

    const byType: DashboardTypeStat[] = [
      { type: "FOOD", count: typeCounts.get("FOOD") ?? 0 },
      { type: "COSMETIC", count: typeCounts.get("COSMETIC") ?? 0 },
      { type: "MEDICINE", count: typeCounts.get("MEDICINE") ?? 0 },
      { type: "GENERAL", count: typeCounts.get("GENERAL") ?? 0 },
    ];

    const byLocation = Array.from(locationStatsMap.values())
      .filter((location) => location.item_count > 0)
      .sort((a, b) => {
        if (b.item_count !== a.item_count) {
          return b.item_count - a.item_count;
        }
        return b.expiring_soon_count - a.expiring_soon_count;
      })
      .slice(0, 5);

    const busiestLocation: DashboardLocationHighlight | null =
      byLocation.length > 0
        ? {
            location_id: byLocation[0].location_id,
            location_name: byLocation[0].location_name,
            item_count: byLocation[0].item_count,
            expiring_soon_count: byLocation[0].expiring_soon_count,
          }
        : null;

    const highestRiskLocationRow =
      [...byLocation]
        .sort((a, b) => {
          if (b.expiring_soon_count !== a.expiring_soon_count) {
            return b.expiring_soon_count - a.expiring_soon_count;
          }
          return b.item_count - a.item_count;
        })
        .find((location) => location.expiring_soon_count > 0) ?? null;

    const highestRiskLocation: DashboardLocationHighlight | null =
      highestRiskLocationRow
        ? {
            location_id: highestRiskLocationRow.location_id,
            location_name: highestRiskLocationRow.location_name,
            item_count: highestRiskLocationRow.item_count,
            expiring_soon_count: highestRiskLocationRow.expiring_soon_count,
          }
        : null;

    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const recentAddedMap = new Map<string, number>();
    for (let offset = 7; offset >= 0; offset -= 1) {
      const weekStart = startOfWeek(subWeeks(currentWeekStart, offset), {
        weekStartsOn: 1,
      });
      recentAddedMap.set(format(weekStart, "yyyy-MM-dd"), 0);
    }

    for (const item of recentItems) {
      if (!item.created_at) {
        continue;
      }

      const weekStartKey = format(
        startOfWeek(new Date(item.created_at), { weekStartsOn: 1 }),
        "yyyy-MM-dd",
      );

      if (recentAddedMap.has(weekStartKey)) {
        recentAddedMap.set(
          weekStartKey,
          (recentAddedMap.get(weekStartKey) ?? 0) + 1,
        );
      }
    }

    const recentAddedByWeek = Array.from(recentAddedMap.entries()).map(
      ([week_start, count]) => ({
        week_start,
        count,
      }),
    );

    const expiringSoonCount =
      expiryBuckets.due_in_3_days + expiryBuckets.due_in_7_days;
    const expiredCount = expiryBuckets.expired;

    const stats: DashboardOverviewResponse = {
      total_items: totalItemsResult.count || 0,
      active_items: activeItems.length,
      expiring_soon: expiringSoonCount,
      expired: expiredCount,
      locations_count: locations.length,
      low_stock_count: lowStockCount,
      by_type: byType,
      by_location: byLocation,
      expiry_buckets: expiryBuckets,
      recent_added_by_week: recentAddedByWeek,
      highlights: {
        busiest_location: busiestLocation,
        highest_risk_location: highestRiskLocation,
      },
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

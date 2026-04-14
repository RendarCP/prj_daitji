import type {
  DashboardLocationHighlight,
  DashboardLocationStat,
  DashboardOverviewResponse,
  DashboardTypeStat,
} from "@/lib/types";
import { computeItemExpiryDate, getDaysUntilExpiry } from "@/lib/utils/expiry";
import {
  buildRecentAddedByMonthWeek,
  getRecentAddedWindowStart,
} from "@/lib/utils/dashboardRecentAdded";

type ItemType = "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";

type ActiveItemRow = {
  type: ItemType;
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
};

type LocationRow = {
  id: string;
  name: string;
  level: number | null;
};

function createTypeCountMap() {
  return new Map<DashboardTypeStat["type"], number>([
    ["FOOD", 0],
    ["COSMETIC", 0],
    ["MEDICINE", 0],
    ["GENERAL", 0],
  ]);
}

function createLocationStatsMap(locations: LocationRow[]) {
  const locationStatsMap = new Map<string, DashboardLocationStat>();

  for (const location of locations) {
    locationStatsMap.set(String(location.id), {
      location_id: String(location.id),
      location_name: String(location.name),
      item_count: 0,
      expiring_soon_count: 0,
      level: Number(location.level ?? 0),
    });
  }

  return locationStatsMap;
}

function toDashboardHighlights(byLocation: DashboardLocationStat[]) {
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

  return {
    busiest_location: busiestLocation,
    highest_risk_location: highestRiskLocation,
  };
}

export async function fetchDashboardOverview(
  supabase: any,
  userId: string,
): Promise<DashboardOverviewResponse> {
  const recentWindowStart = getRecentAddedWindowStart().toISOString();

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
      .eq("user_id", userId),

    supabase
      .from("items")
      .select("type, metadata, quantity, location_id, created_at, location:locations(id, name, level)")
      .eq("user_id", userId)
      .eq("status", "ACTIVE"),

    supabase.from("locations").select("id, name, level").eq("user_id", userId),

    supabase
      .from("notification_settings")
      .select("low_stock_threshold")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("items")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", recentWindowStart),
  ]);

  if (totalItemsResult.error) {
    throw new Error(totalItemsResult.error.message);
  }
  if (activeItemsResult.error) {
    throw new Error(activeItemsResult.error.message);
  }
  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }
  if (notificationSettingsResult.error) {
    throw new Error(notificationSettingsResult.error.message);
  }
  if (recentItemsResult.error) {
    throw new Error(recentItemsResult.error.message);
  }

  const activeItems = Array.isArray(activeItemsResult.data)
    ? (activeItemsResult.data as ActiveItemRow[])
    : [];
  const locations = Array.isArray(locationsResult.data)
    ? (locationsResult.data as LocationRow[])
    : [];
  const recentItems = Array.isArray(recentItemsResult.data)
    ? (recentItemsResult.data as Array<{ created_at: string | null }>)
    : [];

  const defaultLowStockThreshold =
    typeof notificationSettingsResult.data?.low_stock_threshold === "number"
      ? notificationSettingsResult.data.low_stock_threshold
      : 1;

  const typeCounts = createTypeCountMap();
  const locationStatsMap = createLocationStatsMap(locations);
  const expiryBuckets = {
    expired: 0,
    due_in_3_days: 0,
    due_in_7_days: 0,
    safe: 0,
  };
  let lowStockCount = 0;

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
    ) as LocationRow | null;

    if (existingLocation) {
      existingLocation.item_count += 1;
      if (daysUntilExpiry !== null && daysUntilExpiry >= 0 && daysUntilExpiry <= 7) {
        existingLocation.expiring_soon_count += 1;
      }
      continue;
    }

    if (locationFromJoin?.id && locationFromJoin.name) {
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

  return {
    total_items: totalItemsResult.count || 0,
    active_items: activeItems.length,
    expiring_soon: expiryBuckets.due_in_3_days + expiryBuckets.due_in_7_days,
    expired: expiryBuckets.expired,
    locations_count: locations.length,
    low_stock_count: lowStockCount,
    by_type: byType,
    by_location: byLocation,
    expiry_buckets: expiryBuckets,
    recent_added_by_week: buildRecentAddedByMonthWeek(recentItems),
    highlights: toDashboardHighlights(byLocation),
  };
}

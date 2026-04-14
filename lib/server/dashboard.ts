import type { DashboardOverviewResponse, Location } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardOverview } from "@/lib/server/dashboard-overview";
import {
  buildLocationTree,
  getActiveItemCountByLocation,
  mapLocationRowsWithCounts,
} from "@/lib/server/location-data";

export async function fetchDashboardStatsServer(): Promise<DashboardOverviewResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return fetchDashboardOverview(supabase, user.id);
}

export async function fetchLocationSummaryServer(): Promise<Location[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  const { data: rawData, error } = await supabase
    .from("locations")
    .select("id, name, level, parent_id, icon, color, description, sort_order")
    .eq("user_id", user.id)
    .order("level", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const locationRows = Array.isArray(rawData)
    ? (rawData as Array<Record<string, unknown>>)
    : [];
  const locationIds = locationRows.map((row) => String(row.id));
  const activeItemCountByLocation = await getActiveItemCountByLocation(
    supabase,
    user.id,
    locationIds,
  );

  return buildLocationTree(
    mapLocationRowsWithCounts(locationRows, activeItemCountByLocation),
  );
}

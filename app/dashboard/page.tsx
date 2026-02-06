import { Metadata } from "next";
import { DashboardClient } from "./DashboardClient";
import { createClient } from "@/lib/supabase/server";
import { DashboardStats } from "@/lib/types";

export const metadata: Metadata = {
  title: "대시보드",
  description: "물품 관리 현황을 한눈에 확인하세요",
};

/**
 * Server Component for Dashboard Page
 * Fetches initial data on the server for better performance and SEO
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch dashboard stats
  let stats: DashboardStats | null = null;
  let statsError: string | null = null;

  try {
    const [
      totalItemsResult,
      activeItemsResult,
      expiringSoonResult,
      expiredResult,
      locationsResult,
    ] = await Promise.all([
      supabase.from("items").select("*", { count: "exact", head: true }),
      supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE"),
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
      supabase
        .from("v_active_items_with_location")
        .select("*", { count: "exact", head: true })
        .not("computed_expiry_date", "is", null)
        .lt("computed_expiry_date", new Date().toISOString().split("T")[0]),
      supabase.from("locations").select("*", { count: "exact", head: true }),
    ]);

    if (totalItemsResult.error) throw totalItemsResult.error;
    if (activeItemsResult.error) throw activeItemsResult.error;
    if (expiringSoonResult.error) throw expiringSoonResult.error;
    if (expiredResult.error) throw expiredResult.error;
    if (locationsResult.error) throw locationsResult.error;

    stats = {
      total_items: totalItemsResult.count || 0,
      active_items: activeItemsResult.count || 0,
      expiring_soon: expiringSoonResult.count || 0,
      expired: expiredResult.count || 0,
      locations_count: locationsResult.count || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    statsError = "통계 데이터를 불러오는 중 오류가 발생했습니다.";
  }

  // Fetch expiring items
  let expiringItems: any[] = [];
  let expiringError: string | null = null;

  try {
    const { data, error } = await supabase.rpc("get_expiring_items", {
      days_threshold: 7,
    });

    if (error) throw error;
    expiringItems = data || [];
  } catch (error) {
    console.error("Error fetching expiring items:", error);
    expiringError = "만료 임박 물품을 불러오는 중 오류가 발생했습니다.";
  }

  // Fetch recent items
  let recentItems: any[] = [];
  let recentError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("v_active_items_with_location")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;
    recentItems = data || [];
  } catch (error) {
    console.error("Error fetching recent items:", error);
    recentError = "최근 물품을 불러오는 중 오류가 발생했습니다.";
  }

  // Fetch location summary (Level 1 locations with item counts)
  let locationSummary: any[] = [];
  let locationError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("locations")
      .select(
        `
        id,
        name,
        icon,
        color,
        items:items(count)
      `
      )
      .eq("level", 1)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Transform the data to include item count
    locationSummary = (data || []).map((loc: any) => ({
      id: loc.id,
      name: loc.name,
      icon: loc.icon,
      color: loc.color,
      item_count: loc.items[0]?.count || 0,
    }));
  } catch (error) {
    console.error("Error fetching location summary:", error);
    locationError = "위치별 요약을 불러오는 중 오류가 발생했습니다.";
  }

  return (
    <DashboardClient
      initialStats={stats}
      initialExpiringItems={expiringItems}
      initialRecentItems={recentItems}
      initialLocationSummary={locationSummary}
      statsError={statsError}
      expiringError={expiringError}
      recentError={recentError}
      locationError={locationError}
    />
  );
}

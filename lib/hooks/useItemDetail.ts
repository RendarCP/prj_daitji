"use client";

import { useQuery } from "@tanstack/react-query";
import type { DbItemForPanel } from "@/components/features/ItemDetailPanelFromData";
import type { LocationPathItem } from "@/components/features/ItemDetailPanelFromData";
import type { ItemLocationInfo } from "@/components/features/ItemDetailPanelFromData";
import { queryKeys } from "@/lib/queryKeys";

interface ItemDetailResponse {
  item: DbItemForPanel;
  location?: ItemLocationInfo | null;
  locationPath?: LocationPathItem[];
}

async function fetchItemDetail(id: string): Promise<ItemDetailResponse> {
  const res = await fetch(`/api/items/${id}/detail`);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message ?? "물품 상세 정보를 불러오지 못했습니다");
  }

  const data = json.data as ItemDetailResponse;
  return {
    ...data,
    locationPath: data.locationPath ?? [],
  };
}

export function useItemDetail(id: string | null) {
  return useQuery({
    queryKey: queryKeys.items.detail(id),
    queryFn: () => fetchItemDetail(id!),
    enabled: !!id,
  });
}

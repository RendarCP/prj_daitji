"use client";

import { useQuery } from "@tanstack/react-query";
import type { DbItemForPanel } from "@/components/features/ItemDetailPanelFromData";
import type { LocationPathItem } from "@/components/features/ItemDetailPanelFromData";

interface ItemDetailResponse {
  item: DbItemForPanel;
  locationPath: LocationPathItem[];
}

async function fetchItemDetail(id: string): Promise<ItemDetailResponse> {
  const res = await fetch(`/api/items/${id}/detail`);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message ?? "Failed to fetch item detail");
  }

  return json.data as ItemDetailResponse;
}

export function useItemDetail(id: string | null) {
  return useQuery({
    queryKey: ["item", "detail", id],
    queryFn: () => fetchItemDetail(id!),
    enabled: !!id,
  });
}

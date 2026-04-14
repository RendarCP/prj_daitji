"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/queryKeys";
import type {
  DbItemForPanel,
  ItemLocationInfo,
  LocationPathItem,
} from "@/lib/types";

interface ItemDetailResponse {
  item: DbItemForPanel;
  location?: ItemLocationInfo | null;
  locationPath?: LocationPathItem[];
}

async function fetchItemDetail(id: string): Promise<ItemDetailResponse> {
  const data = await apiGet<ItemDetailResponse>(
    `/api/items/${id}/detail`,
    undefined,
    "물품 상세 정보를 불러오지 못했습니다",
  );

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

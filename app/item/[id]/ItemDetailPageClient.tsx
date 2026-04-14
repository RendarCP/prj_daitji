"use client";

import {
  ItemDetailPanelFromData,
} from "@/components/features/ItemDetailPanelFromData";
import type {
  DbItemForPanel,
  ItemLocationInfo,
  LocationPathItem,
} from "@/lib/types";

interface ItemDetailPageClientProps {
  item: DbItemForPanel;
  location?: ItemLocationInfo | null;
  locationPath: LocationPathItem[];
}

export function ItemDetailPageClient({
  item,
  location,
  locationPath,
}: ItemDetailPageClientProps) {
  return (
    <ItemDetailPanelFromData
      item={item}
      location={location}
      locationPath={locationPath}
      mode="page"
    />
  );
}

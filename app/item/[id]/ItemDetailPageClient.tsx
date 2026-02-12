"use client";

import {
  ItemDetailPanelFromData,
  type DbItemForPanel,
  type ItemLocationInfo,
  type LocationPathItem,
} from "@/components/features/ItemDetailPanelFromData";

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

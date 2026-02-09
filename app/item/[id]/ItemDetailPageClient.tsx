"use client";

import { useRouter } from "next/navigation";
import {
  ItemDetailPanelFromData,
  type DbItemForPanel,
  type LocationPathItem,
} from "@/components/features/ItemDetailPanelFromData";

interface ItemDetailPageClientProps {
  item: DbItemForPanel;
  locationPath: LocationPathItem[];
}

export function ItemDetailPageClient({
  item,
  locationPath,
}: ItemDetailPageClientProps) {
  const router = useRouter();
  return (
    <ItemDetailPanelFromData
      item={item}
      locationPath={locationPath}
      onCloseRequested={() => router.back()}
    />
  );
}

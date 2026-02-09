"use client";

import { useRouter } from "next/navigation";
import {
  ItemDetailPanelFromData,
  type DbItemForPanel,
  type LocationPathItem,
} from "@/components/features/ItemDetailPanelFromData";

interface ItemDetailModalClientProps {
  item: DbItemForPanel;
  locationPath: LocationPathItem[];
}

export function ItemDetailModalClient({
  item,
  locationPath,
}: ItemDetailModalClientProps) {
  const router = useRouter();
  return (
    <ItemDetailPanelFromData
      item={item}
      locationPath={locationPath}
      onCloseRequested={() => router.back()}
    />
  );
}

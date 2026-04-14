import type { Location } from "@/lib/types";

export function getLocationItemCount(location: Pick<Location, "itemCount" | "item_count">) {
  return location.itemCount ?? location.item_count ?? 0;
}

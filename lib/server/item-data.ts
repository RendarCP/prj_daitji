import { computeItemExpiryDate, getDaysUntilExpiry } from "@/lib/utils/expiry";
import type { DbItemForPanel, ExpiringItem, Item, ItemLocationInfo } from "@/lib/types";

type ItemType = "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";

type ItemLikeRow = {
  id: string;
  name: string;
  type: ItemType;
  status?: string | null;
  quantity?: number | null;
  barcode?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
  location_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  location?: {
    id?: string;
    name?: string | null;
    icon?: string | null;
    parent_id?: string | null;
    level?: number | null;
  } | null;
};

export function mapItemRowToItem(row: ItemLikeRow): Item {
  const computedExpiryDate = computeItemExpiryDate(row.type, row.metadata);
  const daysUntilExpiry = getDaysUntilExpiry(computedExpiryDate);

  return {
    id: row.id,
    item_name: row.name,
    type: row.type,
    quantity: row.quantity ?? 0,
    image_url: row.image_url ?? null,
    location_id: row.location_id ?? "",
    location_name: row.location?.name ?? null,
    location_path: null,
    tags: row.tags ?? [],
    metadata: row.metadata ?? {},
    created_at: row.created_at ?? undefined,
    computed_expiry_date: computedExpiryDate ?? undefined,
    days_until_expiry: daysUntilExpiry ?? undefined,
  };
}

export function mapItemRowToListResponse(row: ItemLikeRow) {
  const item = mapItemRowToItem(row);

  return {
    ...item,
    status: row.status ?? null,
    barcode: row.barcode ?? null,
    location_level: row.location?.level ?? null,
    updated_at: row.updated_at ?? null,
  };
}

export function mapItemRowToExpiringItem(row: ItemLikeRow): ExpiringItem {
  const computedExpiryDate = computeItemExpiryDate(row.type, row.metadata);
  const daysUntilExpiry = getDaysUntilExpiry(computedExpiryDate);

  return {
    item_id: row.id,
    item_name: row.name,
    item_type: row.type,
    image_url: row.image_url ?? null,
    expiry_date: computedExpiryDate ?? undefined,
    computed_expiry_date: computedExpiryDate ?? undefined,
    days_until_expiry: daysUntilExpiry ?? Number.POSITIVE_INFINITY,
    location_name: row.location?.name ?? undefined,
    location_path: undefined,
  };
}

export function mapItemRowToDetailItem(row: ItemLikeRow): DbItemForPanel {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    image_url: row.image_url ?? null,
    location_id: row.location_id ?? "",
    quantity: row.quantity ?? null,
    tags: row.tags ?? null,
    created_at: row.created_at ?? null,
    metadata: row.metadata ?? null,
  };
}

export function mapItemLocationInfo(
  location: ItemLikeRow["location"],
): ItemLocationInfo | null {
  if (!location?.id) {
    return null;
  }

  return {
    id: String(location.id),
    name: location.name ?? null,
    icon: location.icon ?? null,
    parent_id: location.parent_id ?? null,
  };
}

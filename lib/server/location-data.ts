import type { Location } from "@/lib/types";

type LocationRow = Record<string, unknown>;

export function buildLocationTree(locations: Location[]): Location[] {
  const locationMap = new Map<string, Location & { children: Location[] }>();
  const roots: Array<Location & { children: Location[] }> = [];

  locations.forEach((location) => {
    locationMap.set(location.id, { ...location, children: [] });
  });

  locations.forEach((location) => {
    const node = locationMap.get(location.id);
    if (!node) {
      return;
    }

    if (location.parent_id && locationMap.has(location.parent_id)) {
      locationMap.get(location.parent_id)?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortChildren = (nodes: Array<Location & { children: Location[] }>) => {
    nodes.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        sortChildren(node.children as Array<Location & { children: Location[] }>);
      }
    });
  };

  sortChildren(roots);
  return roots;
}

export async function getActiveItemCountByLocation(
  db: any,
  userId: string,
  locationIds: string[],
) {
  const activeItemCountByLocation = new Map<string, number>();

  if (locationIds.length === 0) {
    return activeItemCountByLocation;
  }

  const { data: activeItems, error } = await db
    .from("items")
    .select("location_id")
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .in("location_id", locationIds);

  if (error) {
    throw new Error(error.message);
  }

  if (Array.isArray(activeItems)) {
    for (const item of activeItems as Array<{ location_id: string }>) {
      const locationId = String(item.location_id);
      activeItemCountByLocation.set(
        locationId,
        (activeItemCountByLocation.get(locationId) ?? 0) + 1,
      );
    }
  }

  return activeItemCountByLocation;
}

export function mapLocationRow(
  row: LocationRow,
  itemCount: number,
): Location {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    level: Number(row.level ?? 1),
    parent_id: (row.parent_id as string | null | undefined) ?? null,
    icon: (row.icon as string | null | undefined) ?? null,
    color: (row.color as string | null | undefined) ?? null,
    description: (row.description as string | null | undefined) ?? null,
    item_count: itemCount,
    itemCount: itemCount,
    sort_order: Number(row.sort_order ?? 0),
  };
}

export function mapLocationRowsWithCounts(
  rows: LocationRow[],
  activeItemCountByLocation: Map<string, number>,
) {
  return rows.map((row) =>
    mapLocationRow(row, activeItemCountByLocation.get(String(row.id)) ?? 0),
  );
}

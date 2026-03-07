import type { Location } from "@/lib/types";

export const ROOT_LOCATION_KEY = "__root__";

type LocationNode = Pick<Location, "id" | "name" | "parent_id" | "icon">;

export function buildLocationChildrenMap(
  locations: LocationNode[],
): Record<string, LocationNode[]> {
  return locations.reduce<Record<string, LocationNode[]>>((acc, location) => {
    const parentKey = location.parent_id || ROOT_LOCATION_KEY;

    if (!acc[parentKey]) {
      acc[parentKey] = [];
    }

    acc[parentKey].push(location);
    return acc;
  }, {});
}

export function createNextSelectionPath(
  currentPath: string[],
  levelIndex: number,
  selectedId: string,
): string[] {
  const nextPath = currentPath.slice(0, levelIndex);

  if (selectedId) {
    nextPath.push(selectedId);
  }

  return nextPath;
}

export function getSelectedParentId(selectionPath: string[]): string {
  if (selectionPath.length === 0) {
    return "";
  }

  return selectionPath[selectionPath.length - 1];
}

export function findLocationPath(
  locations: Pick<Location, "id" | "parent_id">[],
  targetId: string,
): string[] {
  const byId = new Map(locations.map((location) => [location.id, location]));
  const path: string[] = [];

  let currentId: string | null | undefined = targetId;
  let depth = 0;

  while (currentId && depth < 20) {
    const current = byId.get(currentId);

    if (!current) {
      break;
    }

    path.unshift(current.id);
    currentId = current.parent_id;
    depth += 1;
  }

  return path;
}

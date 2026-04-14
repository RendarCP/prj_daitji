import type { Item } from "@/lib/types";

export function filterItemsBySearch(items: Item[], searchQuery: string) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    if (item.item_name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    if (item.type.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    return (
      item.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ??
      false
    );
  });
}

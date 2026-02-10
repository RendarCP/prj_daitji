"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { QuickAddButton } from "@/components/features/QuickAddButton";
import { BottomNav } from "@/components/layout/BottomNav";
import { Badge } from "@/components/ui/Badge";
import {
  LocationCardSkeleton,
  ListItemSkeleton,
} from "@/components/ui/Skeleton";
import { useLocations, useLocationPath } from "@/lib/hooks/useLocations";
import { useItems } from "@/lib/hooks/useItems";
import { cn } from "@/lib/utils/cn";
import type { Location, Item } from "@/lib/types";

export default function ExplorerClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locationIdParam = searchParams.get("location_id");

  // State
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    locationIdParam,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // React Query hooks
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations({
    tree: true,
  });
  const { data: subLocations = [] } = useLocations({
    parent_id: selectedLocationId,
  });
  const { data: breadcrumbPath = [] } = useLocationPath(selectedLocationId);
  const { data: items = [], isLoading: isLoadingItems } = useItems({
    location_id: selectedLocationId,
  });

  console.log(items);

  // Create query string helper
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams],
  );

  // Handle location selection
  const handleLocationSelect = useCallback(
    (location: Location) => {
      const newLocationId = (location as any).id === null ? null : location.id;
      setSelectedLocationId(newLocationId);

      // Update URL
      const queryString = createQueryString("location_id", newLocationId || "");
      router.push(`${pathname}?${queryString}`);
    },
    [router, pathname, createQueryString],
  );

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.item_name.toLowerCase().includes(lowerQuery) ||
        item.type.toLowerCase().includes(lowerQuery) ||
        (item.tags &&
          item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))),
    );
  }, [items, searchQuery]);

  // Initialize from URL params
  useEffect(() => {
    if (locationIdParam) {
      setSelectedLocationId(locationIdParam);
    }
  }, [locationIdParam]);

  // Build breadcrumb items including root
  const breadcrumbItems: (
    | { id: string; name: string; isHome?: boolean }
    | Location
  )[] = [{ id: "root", name: "Home", isHome: true }, ...breadcrumbPath];

  const displayLocations = selectedLocationId
    ? subLocations
    : locations.filter((l) => l.level === 1);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Breadcrumb Navigation */}
      <div className="mt-4 px-4 py-2 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar mb-6">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isHome = (item as any).isHome;

          return (
            <div key={item.id} className="flex items-center shrink-0">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
              )}
              <button
                onClick={() => {
                  if (isHome) handleLocationSelect({ id: null } as any);
                  else if (!isLast) handleLocationSelect(item as any);
                }}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                  isLast
                    ? "bg-primary/20 text-primary-foreground border-primary/30"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary border-transparent",
                )}
                disabled={isLast}
              >
                {isHome && <Home className="w-3.5 h-3.5 mr-1" />}
                {item.name}
              </button>
            </div>
          );
        })}
      </div>

      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        {/* Sub-locations Section */}
        <div>
          {displayLocations.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {selectedLocationId ? "Sub-Locations" : "Locations"}
              </h2>
            </div>
          )}
          {isLoadingLocations ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <LocationCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            displayLocations.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {displayLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="card hover-lift p-4 transition-all duration-200 bg-card border border-border"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="text-4xl mb-3">
                        {location.icon || "📦"}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1 text-sm">
                        {location.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {location.itemCount || 0} items
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/50 border-none text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50 transition-all focus:bg-background focus:ring-primary"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Items Section */}
        {selectedLocationId && (
          <div className="pb-20">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Items in{" "}
                {breadcrumbPath.length > 0
                  ? breadcrumbPath[breadcrumbPath.length - 1].name
                  : "Current Location"}
              </h2>
              <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                Sort: Expiry <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
            </div>

            {isLoadingItems ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <div className="text-2xl">📦</div>
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  No items here yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item: Item) => {
                  const daysUntilExpiry = item.days_until_expiry;
                  const isExpired =
                    daysUntilExpiry !== null &&
                    daysUntilExpiry !== undefined &&
                    daysUntilExpiry < 0;
                  const isExpiring =
                    daysUntilExpiry !== null &&
                    daysUntilExpiry !== undefined &&
                    daysUntilExpiry <= 7 &&
                    daysUntilExpiry >= 0;

                  return (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="w-full card hover-lift group p-3 sm:p-4 bg-card border border-border block"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/30 flex items-center justify-center text-xl shrink-0">
                          {item.type === "FOOD"
                            ? "🍽️"
                            : item.type === "COSMETIC"
                              ? "💄"
                              : item.type === "MEDICINE"
                                ? "💊"
                                : "📦"}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-foreground truncate text-sm">
                              {item.item_name}
                            </h3>
                            {isExpired && (
                              <Badge
                                variant="danger"
                                size="sm"
                                className="h-5 px-1.5 text-[10px]"
                              >
                                Expired
                              </Badge>
                            )}
                            {isExpiring && (
                              <Badge
                                variant="warning"
                                size="sm"
                                className="h-5 px-1.5 text-[10px]"
                              >
                                Expiring
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex gap-1">
                                {item.tags.slice(0, 2).map((tag: string) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {item.tags.length > 2 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    +{item.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                            {(!item.tags || item.tags.length === 0) && (
                              <p className="text-xs text-muted-foreground truncate">
                                {item.type}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Button */}
      <QuickAddButton
        onAddItem={() => router.push("/items/add")}
        onAddLocation={() =>
          router.push(
            `/explorer/add${selectedLocationId ? `?parent_id=${selectedLocationId}` : ""}`,
          )
        }
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

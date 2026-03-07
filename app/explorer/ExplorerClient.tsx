"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Home,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { QuickAddButton } from "@/components/features/QuickAddButton";
import { BottomNav } from "@/components/layout/BottomNav";
import { ItemListRowCard } from "@/components/features/ItemListRowCard";
import {
  LocationCardSkeleton,
  ListItemSkeleton,
} from "@/components/ui/Skeleton";
import { useLocations, useLocationPath } from "@/lib/hooks/useLocations";
import { useItems } from "@/lib/hooks/useItems";
import { useItemDetail } from "@/lib/hooks/useItemDetail";
import { cn } from "@/lib/utils/cn";
import type { Location, Item } from "@/lib/types";
import { ItemDetailPanelFromData } from "@/components/features/ItemDetailPanelFromData";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ItemAddClient } from "@/app/items/add/ItemAddClient";

export default function ExplorerClient() {
  const SHEET_EXIT_MS = 300;
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
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const editSheetCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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
  const { data: activeItemDetail, isLoading: isActiveItemLoading } =
    useItemDetail(activeItemId);

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

  useEffect(() => {
    return () => {
      if (editSheetCloseTimerRef.current) {
        clearTimeout(editSheetCloseTimerRef.current);
      }
    };
  }, []);

  const openEditSheet = (itemId: string) => {
    setEditingItemId(itemId);
    setIsEditSheetOpen(true);
  };

  const closeEditSheetWithAnimation = () => {
    setIsEditSheetOpen(false);
    editSheetCloseTimerRef.current = setTimeout(() => {
      setEditingItemId(null);
    }, SHEET_EXIT_MS);
  };

  // Build breadcrumb items including root
  const breadcrumbItems: (
    | { id: string; name: string; isHome?: boolean }
    | Location
  )[] = [{ id: "root", name: "홈", isHome: true }, ...breadcrumbPath];

  const displayLocations = selectedLocationId
    ? subLocations
    : locations.filter((l) => l.level === 1);
  const hasVisibleItems =
    selectedLocationId !== null && filteredItems.length > 0;

  return (
    <div
      className={cn(
        "bg-background pb-20",
        hasVisibleItems ? "min-h-screen overflow-y-auto" : "overflow-y-hidden",
      )}
    >
      <div className="container mx-auto px-4 max-w-3xl space-y-6 mt-5">
        {/* Sub-locations Section */}
        <div>
          {displayLocations.length > 0 && (
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {selectedLocationId ? "하위 위치" : "위치"}
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
                        물품 {location.itemCount || 0}개
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
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

        {/* Search Bar */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="물품 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-secondary/50 border-none text-sm placeholder:text-muted-foreground focus:ring-1 focus:ring-primary transition-all focus:bg-background"
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
                물품 목록{" "}
                {breadcrumbPath.length > 0
                  ? breadcrumbPath[breadcrumbPath.length - 1].name
                  : "현재 위치"}
              </h2>
              <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                정렬: 유통기한순 <ChevronRight className="w-3 h-3 rotate-90" />
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
                  아직 등록된 물품이 없어요
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item: Item) => {
                  return (
                    <ItemListRowCard
                      key={item.id}
                      title={item.item_name}
                      type={item.type}
                      imageUrl={item.image_url}
                      locationText={item.location_path}
                      tags={item.tags || []}
                      daysUntilExpiry={item.days_until_expiry}
                      onClick={() => setActiveItemId(item.id)}
                    />
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

      {activeItemId && activeItemDetail && !isActiveItemLoading && (
        <ItemDetailPanelFromData
          item={activeItemDetail.item}
          location={activeItemDetail.location}
          locationPath={activeItemDetail.locationPath}
          onCloseRequested={() => setActiveItemId(null)}
          onEditRequested={(itemId) => openEditSheet(itemId)}
        />
      )}

      {editingItemId && (
        <BottomSheet
          isOpen={isEditSheetOpen}
          onClose={closeEditSheetWithAnimation}
          title="물품 수정"
          maxHeight="max-h-[95vh]"
          closeOnOverlayClick={false}
        >
          <div className="-mx-6 -my-4">
            <ItemAddClient
              mode="modal"
              isEditMode
              itemId={editingItemId}
              onSuccess={() => closeEditSheetWithAnimation()}
            />
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

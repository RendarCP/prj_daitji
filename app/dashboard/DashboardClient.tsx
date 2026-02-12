"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, CheckCircle, Plus, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { QuickAddButton } from "@/components/features/QuickAddButton";
import { LocationDetailPanel } from "@/components/ui/LocationDetailPanel";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ItemAddClient } from "@/app/items/add/ItemAddClient";
import { useItemDetail } from "@/lib/hooks/useItemDetail";
import { ItemDetailPanelFromData } from "@/components/features/ItemDetailPanelFromData";
import {
  ExpiryItemSkeleton,
  ListItemSkeleton,
  LocationCardSkeleton,
} from "@/components/ui/Skeleton";
import {
  useDashboardStats,
  useRecentItems,
  useLocationSummary,
} from "@/lib/hooks/useDashboard";
import { useExpiringItems } from "@/lib/hooks/useItems";
import { cn } from "@/lib/utils/cn";
import type { ExpiringItem, Item, Location } from "@/lib/types";

export function DashboardClient() {
  const SHEET_EXIT_MS = 300;
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  /** 장소 디테일 패널에서 하위로 들어갈 때마다 부모를 쌓음. 뒤로가기 시 pop */
  const [locationStack, setLocationStack] = useState<Location[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const editSheetCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // React Query hooks
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    data: expiringItems = [],
    isLoading: isExpiringLoading,
    error: expiringError,
  } = useExpiringItems();
  const {
    data: recentItems = [],
    isLoading: isRecentLoading,
    error: recentError,
  } = useRecentItems();
  const {
    data: locationSummary = [],
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocationSummary();
  const { data: activeItemDetail, isLoading: isActiveItemLoading } =
    useItemDetail(activeItemId);

  const handleAddItem = () => {
    router.push("/items/add");
  };

  const handleAddLocation = () => {
    router.push("/explorer/add");
  };

  const handleItemClick = (item: Item | ExpiringItem) => {
    const id = "item_id" in item ? item.item_id : item.id;
    setActiveItemId(id);
  };

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

  useEffect(() => {
    return () => {
      if (editSheetCloseTimerRef.current) {
        clearTimeout(editSheetCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Quick Stats - Hidden, data used for sections below */}
        <div className="hidden">
          {stats && (
            <>
              <span data-total={stats.total_items} />
              <span data-active={stats.active_items} />
              <span data-expiring={stats.expiring_soon} />
              <span data-expired={stats.expired} />
              <span data-locations={stats.locations_count} />
            </>
          )}
        </div>

        {/* Expiry Alerts Section */}
        <section
          className="mb-6 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground">만료 알림</h2>
            {expiringItems.length > 0 && (
              <button
                className="text-sm text-primary hover:text-primary/80 font-medium"
                onClick={() => router.push("/items?filter=expiring")}
              >
                전체보기
              </button>
            )}
          </div>

          {expiringError ? (
            <Alert variant="danger">
              {expiringError instanceof Error
                ? expiringError.message
                : "데이터를 불러오지 못했습니다"}
            </Alert>
          ) : isExpiringLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <ExpiryItemSkeleton key={i} />
              ))}
            </div>
          ) : expiringItems.length === 0 ? (
            <div className="card text-center py-6">
              <CheckCircle className="w-10 h-10 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                만료 임박 물품이 없습니다
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 stagger-children">
              {expiringItems.slice(0, 4).map((item) => {
                const expiryDate = new Date(
                  item.expiry_date || item.computed_expiry_date || Date.now(),
                );
                const today = new Date();
                const daysUntilExpiry =
                  item.days_until_expiry !== undefined
                    ? item.days_until_expiry
                    : Math.ceil(
                        (expiryDate.getTime() - today.getTime()) /
                          (1000 * 60 * 60 * 24),
                      );
                const isExpired = daysUntilExpiry < 0;
                const daysTotal = 30;
                const progress = isExpired
                  ? 100
                  : Math.max(
                      0,
                      Math.min(
                        100,
                        ((daysTotal - daysUntilExpiry) / daysTotal) * 100,
                      ),
                    );

                return (
                  <button
                    key={item.item_id}
                    onClick={() => handleItemClick(item)}
                    className="card hover-lift group text-left"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl">
                        {item.item_type === "FOOD"
                          ? "🍽️"
                          : item.item_type === "COSMETIC"
                            ? "💄"
                            : item.item_type === "MEDICINE"
                              ? "💊"
                              : "📦"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded inline-block mb-1",
                            isExpired
                              ? "bg-destructive/20 text-destructive"
                              : daysUntilExpiry <= 3
                                ? "bg-warning/20 text-warning"
                                : "bg-success/20 text-success",
                          )}
                        >
                          {isExpired
                            ? `${Math.abs(daysUntilExpiry)}일 지남`
                            : `${daysUntilExpiry}일 남음`}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 truncate">
                      {item.item_name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 truncate">
                      {item.location_path ||
                        item.location_name ||
                        "위치 미지정"}
                    </p>
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          isExpired
                            ? "bg-destructive"
                            : daysUntilExpiry <= 3
                              ? "bg-warning"
                              : "bg-success",
                        )}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Items Section */}
        <section
          className="mb-6 animate-fade-in"
          style={{ animationDelay: "300ms" }}
        >
          <h2 className="text-xl font-bold text-foreground mb-3">
            최근 등록 물품
          </h2>

          {recentError ? (
            <Alert variant="danger">
              {recentError instanceof Error
                ? recentError.message
                : "데이터를 불러오지 못했습니다"}
            </Alert>
          ) : isRecentLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="card text-center py-8">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                등록된 물품 없음
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                첫 물품을 추가해보세요
              </p>
              <Button onClick={handleAddItem} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                물품 추가
              </Button>
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {recentItems.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full card hover-lift group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl flex-shrink-0">
                      {item.type === "FOOD"
                        ? "🍽️"
                        : item.type === "COSMETIC"
                          ? "💄"
                          : item.type === "MEDICINE"
                            ? "💊"
                            : "📦"}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="font-semibold text-foreground mb-0.5 truncate">
                        {item.item_name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.location_path || "위치 미지정"}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Quick Zones Section */}
        <section
          className="mb-6 animate-fade-in"
          style={{ animationDelay: "200ms" }}
        >
          <h2 className="text-xl font-bold text-foreground mb-4">빠른 장소</h2>

          {locationError ? (
            <Alert variant="danger">
              {locationError instanceof Error
                ? locationError.message
                : "데이터를 불러오지 못했습니다"}
            </Alert>
          ) : isLocationLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <LocationCardSkeleton key={i} />
              ))}
            </div>
          ) : locationSummary.length === 0 ? null : (
            <div className="grid grid-cols-2 gap-3">
              {locationSummary.slice(0, 4).map((location: Location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className="card hover-lift p-6 transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-3">
                      <span className="text-4xl">{location.icon || "📦"}</span>
                    </div>
                    <h3 className="font-bold text-foreground mb-1">
                      {location.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {location.item_count || location.itemCount || 0}개 물품
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Add Button */}
      <QuickAddButton
        onAddItem={handleAddItem}
        onAddLocation={handleAddLocation}
      />

      {/* Location Detail Panel */}
      <LocationDetailPanel
        isOpen={!!selectedLocation}
        onClose={() => {
          setSelectedLocation(null);
          setLocationStack([]);
        }}
        onBack={() => {
          if (locationStack.length > 0) {
            const parentLoc = locationStack[locationStack.length - 1];
            setLocationStack((s) => s.slice(0, -1));
            setSelectedLocation(parentLoc);
          } else {
            setSelectedLocation(null);
          }
        }}
        location={selectedLocation}
        onSubLocationClick={(subLoc) => {
          if (selectedLocation) {
            setLocationStack((s) => [...s, selectedLocation]);
          }
          setSelectedLocation(subLoc);
        }}
        onItemClick={(item) => {
          const id = "item_id" in item ? item.item_id : item.id;
          if (!id) return;
          setActiveItemId(id);
        }}
      />

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

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

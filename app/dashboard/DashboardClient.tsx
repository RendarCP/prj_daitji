"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { Alert } from "@/components/ui/Alert";
import { QuickAddButton } from "@/components/features/QuickAddButton";
import { LocationDetailPanel } from "@/components/ui/LocationDetailPanel";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ItemAddClient } from "@/app/items/add/ItemAddClient";
import { EmptyState } from "@/components/ui/EmptyState";
import { useItemDetail } from "@/lib/hooks/useItemDetail";
import { ItemDetailPanelFromData } from "@/components/features/ItemDetailPanelFromData";
import { LocationCardSkeleton } from "@/components/ui/Skeleton";
import {
  useDashboardStats,
  useLocationSummary,
} from "@/lib/hooks/useDashboard";
import { useDialog } from "@/lib/hooks/useDialog";
import type { Location } from "@/lib/types";
import { LocationThumbnail } from "@/components/features/LocationThumbnail";

const DashboardOverviewSection = dynamic(
  () =>
    import("./DashboardOverviewSection").then(
      (mod) => mod.DashboardOverviewSection,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mb-8 animate-fade-in" style={{ animationDelay: "60ms" }}>
        <div className="rounded-[32px] border border-border/60 bg-card/90 p-5 shadow-medium">
          <div className="h-3 w-32 animate-pulse rounded bg-secondary/30" />
          <div className="mt-3 h-8 w-56 animate-pulse rounded bg-secondary/30" />
          <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-secondary/30" />
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card p-4">
                <div className="h-4 w-16 animate-pulse rounded bg-secondary/30" />
                <div className="mt-4 h-8 w-14 animate-pulse rounded bg-secondary/30" />
                <div className="mt-2 h-3 w-20 animate-pulse rounded bg-secondary/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
);

export function DashboardClient() {
  const SHEET_EXIT_MS = 300;
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  /** 장소 디테일 패널에서 하위로 들어갈 때마다 부모를 쌓음. 뒤로가기 시 pop */
  const [locationStack, setLocationStack] = useState<Location[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const editSheetDialog = useDialog<string>();
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
    data: locationSummary = [],
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocationSummary();
  const { data: activeItemDetail, isLoading: isActiveItemLoading } =
    useItemDetail(activeItemId);

  const handleAddItem = () => {
    router.push("/items/add", { scroll: false });
  };

  const handleAddLocation = () => {
    router.push("/explorer/add", { scroll: false });
  };

  const openEditSheet = (itemId: string) => {
    editSheetDialog.open(itemId);
  };

  const closeEditSheetWithAnimation = () => {
    editSheetDialog.close();
    editSheetCloseTimerRef.current = setTimeout(() => {
      editSheetDialog.reset();
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
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-background sm:min-h-[calc(100dvh-4rem)]">
      <div className="container mx-auto max-w-7xl flex-1 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {statsError ? (
          <Alert variant="danger" className="mb-6">
            {statsError instanceof Error
              ? statsError.message
              : "대시보드 요약을 불러오지 못했습니다"}
          </Alert>
        ) : null}

        {isStatsLoading || !stats ? (
          <div
            className="mb-8 animate-fade-in"
            style={{ animationDelay: "60ms" }}
          >
            <div className="rounded-[32px] border border-border/60 bg-card/90 p-5 shadow-medium">
              <div className="h-3 w-32 animate-pulse rounded bg-secondary/30" />
              <div className="mt-3 h-8 w-56 animate-pulse rounded bg-secondary/30" />
              <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-secondary/30" />
              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="card p-4">
                    <div className="h-4 w-16 animate-pulse rounded bg-secondary/30" />
                    <div className="mt-4 h-8 w-14 animate-pulse rounded bg-secondary/30" />
                    <div className="mt-2 h-3 w-20 animate-pulse rounded bg-secondary/30" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <DashboardOverviewSection stats={stats} />
        )}

        {/* Quick Zones Section */}
        <section
          className="mb-6 animate-fade-in"
          style={{ animationDelay: "210ms" }}
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
          ) : locationSummary.length === 0 ? (
            <div className="card">
              <EmptyState
                size="sm"
                title="등록된 위치가 없습니다"
                description="첫 위치를 추가해서 빠르게 탐색해보세요"
                action={{
                  label: "위치 추가",
                  onClick: handleAddLocation,
                }}
                className="py-10"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {locationSummary.slice(0, 4).map((location: Location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className="card hover-lift p-6 transition-all duration-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <LocationThumbnail
                      name={location.name}
                      icon={location.icon || "📦"}
                      className="mb-3 h-24 w-full max-w-[168px]"
                      emojiClassName="h-8 w-8 text-base"
                    />
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
          const id = item.id;
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

      {editSheetDialog.data && (
        <BottomSheet
          isOpen={editSheetDialog.isOpen}
          onClose={closeEditSheetWithAnimation}
          title="물품 수정"
          maxHeight="max-h-[95vh]"
          closeOnOverlayClick={false}
        >
          <div className="-mx-6 -my-4">
            <ItemAddClient
              mode="modal"
              isEditMode
              itemId={editSheetDialog.data}
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

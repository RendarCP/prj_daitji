"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { QuickAddButton } from "@/components/features/QuickAddButton";
import { LocationDetailPanel } from "@/components/ui/LocationDetailPanel";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { FullPageModal } from "@/components/ui/FullPageModal";
import { useOverlayHistorySync } from "@/lib/hooks/useOverlayHistorySync";
import { useToastError } from "@/lib/hooks/useToastError";
import { ItemAddClient } from "@/app/items/add/ItemAddClient";
import { AddLocationClient } from "@/app/explorer/AddLocationClient";
import { EmptyState } from "@/components/ui/EmptyState";
import { useItemDetail } from "@/lib/hooks/useItemDetail";
import { ItemDetailPanelFromData } from "@/components/features/ItemDetailPanelFromData";
import { LocationCardSkeleton } from "@/components/ui/Skeleton";
import { useDashboardStats } from "@/lib/hooks/useDashboard";
import { useLocations } from "@/lib/hooks/useLocations";
import { useAnimatedDialog } from "@/lib/hooks/useAnimatedDialog";
import { cn } from "@/lib/utils/cn";
import type { Location } from "@/lib/types";
import { LocationGridCard } from "@/components/features/LocationGridCard";

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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  /** 장소 디테일 패널에서 하위로 들어갈 때마다 부모를 쌓음. 뒤로가기 시 pop */
  const [locationStack, setLocationStack] = useState<Location[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isItemAddModalOpen, setIsItemAddModalOpen] = useState(false);
  const [isLocationAddModalOpen, setIsLocationAddModalOpen] = useState(false);
  const editSheetDialog = useAnimatedDialog<string>();

  // React Query hooks
  const {
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
  } = useDashboardStats();
  const {
    data: locations = [],
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocations({ tree: true });
  const { data: activeItemDetail, isLoading: isActiveItemLoading } =
    useItemDetail(activeItemId);
  const closeActiveItemPanel = useCallback(() => {
    setActiveItemId(null);
  }, []);
  const { requestClose: requestCloseActiveItemPanel } = useOverlayHistorySync({
    isOpen: !!activeItemId,
    overlayKey: "item-detail",
    overlayId: activeItemId ?? "pending",
    onRequestClose: closeActiveItemPanel,
  });
  const isOverlayOpen =
    !!selectedLocation || !!activeItemId || !!editSheetDialog.data;
  const statsErrorMessage =
    statsError instanceof Error
      ? statsError.message
      : statsError
        ? "대시보드 요약을 불러오지 못했습니다"
        : null;
  const locationErrorMessage =
    locationError instanceof Error
      ? locationError.message
      : locationError
        ? "데이터를 불러오지 못했습니다"
        : null;

  useToastError(statsErrorMessage, {
    title: "대시보드 요약을 불러올 수 없습니다.",
  });
  useToastError(locationErrorMessage, {
    title: "위치 데이터를 불러올 수 없습니다.",
  });

  const handleAddItem = () => {
    setIsItemAddModalOpen(true);
  };

  const handleAddLocation = () => {
    setIsLocationAddModalOpen(true);
  };

  const openEditSheet = (itemId: string) => {
    editSheetDialog.open(itemId);
  };

  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-3.5rem)] flex-col bg-background sm:min-h-[calc(100dvh-4rem)]",
        isOverlayOpen && "overflow-hidden touch-none",
      )}
    >
      <div className="container mx-auto max-w-7xl flex-1 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
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
          <DashboardOverviewSection stats={stats} onAddItem={handleAddItem} />
        )}

        {/* Quick Zones Section */}
        <section
          className="mb-6 animate-fade-in"
          style={{ animationDelay: "210ms" }}
        >
          <h2 className="text-xl font-bold text-foreground mb-4">빠른 장소</h2>

          {locationError ? null : isLocationLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <LocationCardSkeleton key={i} />
              ))}
            </div>
          ) : locations.length === 0 ? (
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
              {locations.slice(0, 4).map((location: Location) => (
                <LocationGridCard
                  key={location.id}
                  location={location}
                  onClick={setSelectedLocation}
                  countLabel={(count) => `${count}개 물품`}
                  className="card hover-lift p-6 transition-all duration-200"
                />
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
        shouldCloseOnBack={locationStack.length === 0}
      />

      {activeItemId && activeItemDetail && !isActiveItemLoading && (
        <ItemDetailPanelFromData
          item={activeItemDetail.item}
          location={activeItemDetail.location}
          locationPath={activeItemDetail.locationPath}
          onCloseRequested={requestCloseActiveItemPanel}
          onEditRequested={(itemId) => openEditSheet(itemId)}
          enableOverlayHistorySync={false}
        />
      )}

      {editSheetDialog.data && (
        <BottomSheet
          isOpen={editSheetDialog.isOpen}
          onClose={editSheetDialog.closeWithAnimation}
          title="물품 수정"
          maxHeight="max-h-[95vh]"
          closeOnOverlayClick={false}
        >
          <ItemAddClient
            mode="modal"
            isEditMode
            itemId={editSheetDialog.data}
            onSuccess={() => editSheetDialog.closeWithAnimation()}
          />
        </BottomSheet>
      )}

      {isItemAddModalOpen && (
        <FullPageModal
          onClose={() => setIsItemAddModalOpen(false)}
          title="물품 추가"
          disableBodyScroll={true}
        >
          <ItemAddClient
            mode="modal"
            onSuccess={(targetId) => {
              setIsItemAddModalOpen(false);
              setActiveItemId(targetId);
            }}
          />
        </FullPageModal>
      )}

      {isLocationAddModalOpen && (
        <FullPageModal
          onClose={() => setIsLocationAddModalOpen(false)}
          title="위치 추가"
          disableBodyScroll={true}
        >
          <AddLocationClient
            locations={locations}
            mode="modal"
            onSuccess={async (_targetId, location) => {
              setIsLocationAddModalOpen(false);
              if (location) {
                setSelectedLocation(location);
              }
            }}
          />
        </FullPageModal>
      )}
    </div>
  );
}

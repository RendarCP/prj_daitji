"use client";

import type { ActivityComponentType } from "@stackflow/react";
import { stackflow } from "@stackflow/react";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import { ItemListRowCard } from "@/components/features/ItemListRowCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useItems } from "@/lib/hooks/useItems";
import { useItemDetail } from "@/lib/hooks/useItemDetail";
import { ItemDetailPanelFromData } from "@/components/features/ItemDetailPanelFromData";
import type { Item } from "@/lib/types";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ItemAddClient } from "@/app/items/add/ItemAddClient";

const SHEET_EXIT_MS = 300;

// ----- ItemsListActivity -----
const ItemsListActivity: ActivityComponentType = () => {
  const { push } = useFlow();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const openedFromQueryRef = useRef(false);

  const { data: items = [], isLoading, error } = useItems();

  const filteredItems = items.filter((item: Item) => {
    if (!searchQuery.trim()) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      item.item_name.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery) ||
      (item.tags &&
        item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
    );
  });
  const isGlobalEmpty =
    !isLoading && !error && items.length === 0 && !searchQuery.trim();

  useEffect(() => {
    if (openedFromQueryRef.current) return;
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const itemId = url.searchParams.get("itemId");
    if (!itemId) return;

    openedFromQueryRef.current = true;
    push("ItemDetailActivity", { id: itemId });

    url.searchParams.delete("itemId");
    const query = url.searchParams.toString();
    window.history.replaceState(
      {},
      "",
      query ? `${url.pathname}?${query}` : url.pathname,
    );
  }, [push]);

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-background sm:min-h-[calc(100dvh-4rem)]">
      <div className="container mx-auto max-w-3xl flex-1 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))]">
        {!isGlobalEmpty && (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-6">
              전체 물품
            </h1>

            <div className="relative flex items-center gap-2 mb-6">
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
          </>
        )}

        {error ? (
          <Alert variant="danger">
            {error instanceof Error
              ? error.message
              : "데이터를 불러오지 못했습니다"}
          </Alert>
        ) : isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        ) : isGlobalEmpty ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <EmptyState
              size="sm"
              title="등록된 물품이 없습니다"
              description="첫 물품을 추가해서 관리를 시작해보세요"
              action={{
                label: "물품 추가",
                onClick: () => push("ItemCreateActivity", {}),
              }}
              className="py-0"
            />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            size="sm"
            title={
              searchQuery ? "검색 결과가 없습니다" : "등록된 물품이 없습니다"
            }
            description={
              searchQuery
                ? "검색어를 바꾸거나 필터를 확인해보세요"
                : "첫 물품을 추가해서 관리를 시작해보세요"
            }
            action={
              searchQuery
                ? undefined
                : {
                    label: "물품 추가",
                    onClick: () => push("ItemCreateActivity", {}),
                  }
            }
            className="py-10"
          />
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              return (
                <ItemListRowCard
                  key={item.id}
                  title={item.item_name}
                  type={item.type}
                  imageUrl={item.image_url}
                  locationText={item.location_path || item.location_name}
                  tags={item.tags || []}
                  daysUntilExpiry={item.days_until_expiry}
                  onClick={() => push("ItemDetailActivity", { id: item.id })}
                />
              );
            })}
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => push("ItemCreateActivity", {})} />

      <BottomNav />
    </div>
  );
};

// ----- ItemDetailActivity -----
const ItemDetailActivity: ActivityComponentType<{ id: string }> = ({
  params,
}) => {
  const { pop, push } = useFlow();
  const { data, isLoading, error } = useItemDetail(params.id);

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-background sm:min-h-[calc(100dvh-4rem)]">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center gap-4 bg-background p-4 sm:min-h-[calc(100dvh-4rem)]">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "물품을 불러올 수 없습니다"}
        </p>
        <Button onClick={() => pop()}>목록으로</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-background sm:min-h-[calc(100dvh-4rem)]">
      <ItemDetailPanelFromData
        item={data.item}
        location={data.location}
        locationPath={data.locationPath}
        onCloseRequested={() => pop()}
        onEditRequested={(itemId) => push("ItemEditActivity", { id: itemId })}
      />
    </div>
  );
};

const ItemCreateActivity: ActivityComponentType = () => {
  const { pop, replace } = useFlow();

  return (
    <BottomSheet
      isOpen
      onClose={() => pop()}
      title="새 물품 추가"
      maxHeight="max-h-[95vh]"
      closeOnOverlayClick={false}
    >
      <div className="-mx-6 -my-4">
        <ItemAddClient
          mode="modal"
          onSuccess={(targetId) =>
            replace("ItemDetailActivity", { id: targetId })
          }
        />
      </div>
    </BottomSheet>
  );
};

const ItemEditActivity: ActivityComponentType<{ id: string }> = ({
  params,
}) => {
  const { pop } = useFlow();
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeWithAnimation = () => {
    setIsSheetOpen(false);
    closeTimerRef.current = setTimeout(() => {
      pop();
    }, SHEET_EXIT_MS);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <BottomSheet
      isOpen={isSheetOpen}
      onClose={closeWithAnimation}
      title="물품 수정"
      maxHeight="max-h-[95vh]"
      closeOnOverlayClick={false}
    >
      <div className="-mx-6 -my-4">
        <ItemAddClient
          mode="modal"
          isEditMode
          itemId={params.id}
          onSuccess={() => closeWithAnimation()}
        />
      </div>
    </BottomSheet>
  );
};

// ----- Stackflow config -----
export const { Stack, useFlow } = stackflow({
  transitionDuration: 300,
  activities: {
    ItemsListActivity,
    ItemDetailActivity,
    ItemCreateActivity,
    ItemEditActivity,
  },
  plugins: [basicRendererPlugin()],
  initialActivity: () => "ItemsListActivity",
});

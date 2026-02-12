"use client";

import type { ActivityComponentType } from "@stackflow/react";
import { stackflow } from "@stackflow/react";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
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
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">전체 물품</h1>

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
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
              <div className="text-2xl">📦</div>
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              {searchQuery ? "검색 결과가 없습니다" : "등록된 물품이 없습니다"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
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
                <button
                  key={item.id}
                  type="button"
                  onClick={() => push("ItemDetailActivity", { id: item.id })}
                  className="w-full card hover-lift group p-3 sm:p-4 bg-card border border-border block text-left"
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
                            만료됨
                          </Badge>
                        )}
                        {isExpiring && (
                          <Badge
                            variant="warning"
                            size="sm"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            임박
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground truncate">
                          {item.location_path || "위치 미지정"}
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1">
                            {item.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </button>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">
          {error instanceof Error ? error.message : "물품을 불러올 수 없습니다"}
        </p>
        <Button onClick={() => pop()}>목록으로</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ItemDetailPanelFromData
        item={data.item}
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
          onSuccess={(targetId) => replace("ItemDetailActivity", { id: targetId })}
        />
      </div>
    </BottomSheet>
  );
};

const ItemEditActivity: ActivityComponentType<{ id: string }> = ({ params }) => {
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ListItemSkeleton } from "@/components/ui/Skeleton";
import { useItems } from "@/lib/hooks/useItems";
import type { Item } from "@/lib/types";

export function ItemsClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  // React Query hook
  const { data: items = [], isLoading, error } = useItems();

  // Filter items based on search query
  const filteredItems = items.filter((item: Item) => {
    if (!searchQuery.trim()) return true;

    const lowerQuery = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery) ||
      (item.tags &&
        item.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
    );
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-foreground mb-6">전체 물품</h1>

        {/* Search Bar */}
        <div className="relative flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="물품 검색..."
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

        {/* Items List */}
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
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setIsAddSheetOpen(true)} />

      {/* Bottom Sheet for Adding Items */}
      <BottomSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="새 물품 추가"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">물품 추가 폼으로 이동합니다.</p>
          <Button onClick={() => router.push("/items/add")} className="w-full">
            물품 추가하기
          </Button>
        </div>
      </BottomSheet>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

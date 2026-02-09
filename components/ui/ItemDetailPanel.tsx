"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  Edit,
  MapPin,
  Plus,
  Minus,
  Calendar,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { SidePanel } from "./SidePanel";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { cn } from "@/lib/utils/cn";

interface ItemDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id?: string | null;
    item_id?: string | null;
    name?: string | null;
    item_name?: string | null;
    type?: string | null;
    item_type?: string | null;
    quantity?: number | null;
    location_path?: string | null;
    location_name?: string | null;
    tags?: string[] | null;
    computed_expiry_date?: string | null;
    expiry_date?: string | null;
    created_at?: string | null;
    days_until_expiry?: number | null;
    metadata?: any;
  } | null;
  onEdit?: () => void;
  onFavorite?: () => void;
  onQuantityChange?: (newQuantity: number) => void;
}

const getEmojiByType = (type: string) => {
  switch (type) {
    case "FOOD":
      return "🍽️";
    case "COSMETIC":
      return "💄";
    case "MEDICINE":
      return "💊";
    case "GENERAL":
      return "🔋";
    default:
      return "📦";
  }
};

const getExpiryStatus = (
  daysUntilExpiry: number | null | undefined,
): "expired" | "expiring" | "fresh" => {
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) return "fresh";
  if (daysUntilExpiry < 0) return "expired";
  if (daysUntilExpiry <= 7) return "expiring";
  return "fresh";
};

export function ItemDetailPanel({
  isOpen,
  onClose,
  item,
  onEdit,
  onFavorite,
  onQuantityChange,
}: ItemDetailPanelProps) {
  // Persist item data for exit animation
  const [displayItem, setDisplayItem] = useState(item);

  useEffect(() => {
    if (item) {
      setDisplayItem(item);
      if (item.quantity !== undefined && item.quantity !== null) {
        setQuantity(item.quantity);
      }
    }
  }, [item]);

  const [quantity, setQuantity] = useState(displayItem?.quantity ?? 1);
  const [newTag, setNewTag] = useState("");

  if (!displayItem) return null;

  const itemName = displayItem.item_name || displayItem.name || "이름 없음";
  const itemType = displayItem.item_type || displayItem.type || "GENERAL";
  const emoji = getEmojiByType(itemType);
  const locationPath =
    displayItem.location_path || displayItem.location_name || "위치 미지정";
  const tags = displayItem.tags || [];
  const expiryDate =
    displayItem.computed_expiry_date || displayItem.expiry_date;
  const createdAt = displayItem.created_at;
  const daysUntilExpiry = displayItem.days_until_expiry;
  const expiryStatus = getExpiryStatus(daysUntilExpiry);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(0, quantity + delta);
    setQuantity(newQuantity);
    onQuantityChange?.(newQuantity);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      // TODO: Implement tag addition API call
      setNewTag("");
    }
  };

  return (
    <SidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="" // Title hidden in header, shown in content
      showBackButton
      showFavoriteButton={!!onFavorite}
      showEditButton={false} // Hide header edit button, moved to bottom
      onFavorite={onFavorite}
      onEdit={onEdit}
      disableBodyScroll={true}
    >
      <div className="flex flex-col h-full bg-background no-scrollbar relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
          {/* Hero Section */}
          <div className="flex flex-col items-center justify-center pt-8 pb-4">
            <div className="text-[100px] leading-none mb-8 drop-shadow-2xl filter hover:scale-110 transition-transform duration-300 cursor-default select-none">
              {emoji}
            </div>

            <div className="flex items-center gap-3 mb-4 w-full justify-start">
              {expiryStatus === "expired" &&
                daysUntilExpiry !== null &&
                daysUntilExpiry !== undefined && (
                  <Badge
                    variant="danger"
                    size="md"
                    className="rounded-full px-3 uppercase tracking-wider text-xs font-bold"
                  >
                    ⚠️ Expired
                  </Badge>
                )}
              {expiryStatus === "expiring" &&
                daysUntilExpiry !== null &&
                daysUntilExpiry !== undefined && (
                  <Badge
                    variant="warning"
                    size="md"
                    className="rounded-full px-3 uppercase tracking-wider text-xs font-bold"
                  >
                    ⚠️ Expiring
                  </Badge>
                )}

              <Badge
                variant="secondary"
                size="md"
                className="rounded-full px-3 uppercase tracking-wider text-xs font-bold bg-secondary/30 text-muted-foreground hover:bg-secondary/40"
              >
                {emoji} {itemType}
              </Badge>
            </div>

            <h1 className="text-4xl font-bold text-foreground self-start w-full leading-tight">
              {itemName}
            </h1>
          </div>

          {/* Quantity Section */}
          <div className="bg-secondary/10 rounded-2xl p-2 w-fit">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground active:scale-95 duration-200"
                aria-label="Decrease quantity"
              >
                <Minus className="w-6 h-6" />
              </button>
              <span className="w-12 text-center text-xl font-bold font-mono">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground active:scale-95 duration-200"
                aria-label="Increase quantity"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Location
            </label>
            <div className="bg-secondary/10 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-foreground/90 font-medium text-lg leading-relaxed">
                  {locationPath.replace(/\s>\s/g, " , ")}
                </p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Details
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Expiration Date */}
              <div
                className={cn(
                  "rounded-2xl p-5 border transition-colors flex flex-col justify-between h-32 relative overflow-hidden group",
                  expiryStatus === "expired"
                    ? "bg-red-500/10 border-red-500/20"
                    : "bg-secondary/10 border-white/5 hover:border-white/10",
                )}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      expiryStatus === "expired"
                        ? "text-red-400"
                        : "text-muted-foreground",
                    )}
                  >
                    Expiration Date
                  </span>
                  <Calendar
                    className={cn(
                      "w-5 h-5",
                      expiryStatus === "expired"
                        ? "text-red-400"
                        : "text-muted-foreground/50",
                    )}
                  />
                </div>

                <div className="relative z-10">
                  {expiryDate ? (
                    <>
                      <p
                        className={cn(
                          "text-lg font-bold mb-1",
                          expiryStatus === "expired"
                            ? "text-red-400"
                            : "text-foreground",
                        )}
                      >
                        {new Date(expiryDate).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      {daysUntilExpiry !== null &&
                        daysUntilExpiry !== undefined && (
                          <p
                            className={cn(
                              "text-sm font-medium",
                              expiryStatus === "expired"
                                ? "text-red-400"
                                : "text-amber-500",
                            )}
                          >
                            {daysUntilExpiry < 0
                              ? `${Math.abs(daysUntilExpiry)}일 지남`
                              : `${daysUntilExpiry}일 남음`}
                          </p>
                        )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">설정 안됨</p>
                  )}
                </div>
              </div>

              {/* Date Added */}
              <div className="bg-secondary/10 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between h-32">
                <span className="text-sm font-medium text-muted-foreground">
                  Date Added
                </span>
                <div>
                  <p className="text-lg font-bold text-foreground">
                    {createdAt
                      ? new Date(createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-full border border-white/10 bg-secondary/5 text-sm font-medium text-foreground/80 hover:bg-secondary/10 transition-colors cursor-default"
                >
                  {tag}
                </div>
              ))}
              <button
                onClick={() => {
                  // Focus mock input or similar for now
                  document.getElementById("add-tag-input")?.focus();
                }}
                className="px-4 py-2 rounded-full border border-dashed border-white/20 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-white/40 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Tag
              </button>
            </div>
            {/* Hidden Input for Future Implementation */}
            <input
              id="add-tag-input"
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              className="sr-only"
            />
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="z-10 absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-card/95 backdrop-blur-md">
          <Button
            onClick={onEdit}
            className="w-full text-lg h-14 font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5"
            size="lg"
          >
            <Edit className="w-5 h-5 mr-2" />
            수정하기
          </Button>
        </div>
      </div>
    </SidePanel>
  );
}

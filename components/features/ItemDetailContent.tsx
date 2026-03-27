"use client";

import Image from "next/image";
import { Edit, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ItemDetailContentProps {
  item: {
    id?: string | null;
    item_id?: string | null;
    name?: string | null;
    item_name?: string | null;
    type?: string | null;
    item_type?: string | null;
    image_url?: string | null;
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
  /** If provided, renders the extra content (like Bottom Bar) used in SidePanel.
   * For the Page version, we might want to put Bottom Bar in a specific slot or just inline.
   * This component will render the SCROLLABLE CONTENT primarily.
   */
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

export function ItemDetailContent({ item, onEdit }: ItemDetailContentProps) {
  if (!item) return null;

  const itemName = item.item_name || item.name || "이름 없음";
  const itemType = item.item_type || item.type || "GENERAL";
  const emoji = getEmojiByType(itemType);
  const locationPath =
    item.location_path || item.location_name || "위치 미지정";
  const tags: string[] = item.tags || [];
  const quantity = item.quantity ?? null;
  const expiryDate = item.computed_expiry_date || item.expiry_date;
  const createdAt = item.created_at;
  const daysUntilExpiry = item.days_until_expiry;
  const expiryStatus = getExpiryStatus(daysUntilExpiry);
  const imageUrl = item.image_url;

  return (
    <div className="flex flex-col h-full bg-background no-scrollbar relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center pb-4">
          <div
            className={cn(
              "relative mb-8 overflow-hidden bg-secondary/20",
              imageUrl
                ? "-mx-6 -mt-6 aspect-square w-[calc(100%+3rem)] rounded-none border-b border-border/60 sm:aspect-[4/3]"
                : "flex aspect-[4/3] w-full items-center justify-center rounded-[28px] border border-border/60 shadow-soft",
            )}
          >
            {imageUrl ? (
              <>
                <Image
                  src={imageUrl}
                  alt={itemName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1200px) calc(100vw - 3rem), 768px"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
              </>
            ) : (
              <div className="text-[100px] leading-none drop-shadow-2xl filter transition-transform duration-300 hover:scale-110 cursor-default select-none">
                {emoji}
              </div>
            )}
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
                  만료됨
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
                  만료 임박
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

        {/* Location Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            저장 위치
          </label>
          <div className="bg-secondary/10 rounded-2xl p-5 border border-border/50 hover:border-border/70 transition-colors">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-foreground/90 font-medium text-lg leading-relaxed">
                {locationPath.replace(/\s>\s/g, " , ")}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
            물품 내용
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* 갯수 */}
            <div className="bg-secondary/10 rounded-2xl p-5 border border-border/50 hover:border-border/70 transition-colors flex flex-col justify-between h-32">
              <span className="text-sm font-medium text-muted-foreground">
                갯수
              </span>
              <div>
                <p className="text-lg font-bold text-foreground">
                  {quantity !== null && quantity !== undefined
                    ? `${quantity}개`
                    : "-"}
                </p>
              </div>
            </div>

            {/* Expiration Date */}
            <div
              className={cn(
                "rounded-2xl p-5 border transition-colors flex flex-col justify-between h-32 relative overflow-hidden group",
                expiryStatus === "expired"
                  ? "status-expired"
                  : "bg-secondary/10 border-border/50 hover:border-border/70",
              )}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "text-sm font-medium",
                    expiryStatus === "expired"
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  유통기한
                </span>
                <Calendar
                  className={cn(
                    "size-5",
                    expiryStatus === "expired"
                      ? "text-destructive"
                      : "text-muted-foreground/50",
                  )}
                />
              </div>

              <div className="relative z-10">
                {expiryDate ? (
                  <>
                    <p
                      className={cn(
                        "text-md font-bold mb-1",
                        expiryStatus === "expired"
                          ? "text-destructive"
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
                            "text-xs font-medium",
                            expiryStatus === "expired"
                              ? "text-destructive"
                              : "text-warning",
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
            <div className="bg-secondary/10 rounded-2xl p-5 border border-border/50 hover:border-border/70 transition-colors flex flex-col justify-between h-28">
              <span className="text-sm font-medium text-muted-foreground">
                추가일
              </span>
              <div>
                <p className="text-md font-bold text-foreground">
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
            태그
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-full border border-border/70 bg-secondary/5 text-sm font-medium text-foreground/80 hover:bg-secondary/10 transition-colors cursor-default"
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="z-10 absolute bottom-0 left-0 right-0 p-4 border-t border-border/70 bg-card/95 backdrop-blur-md">
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
  );
}

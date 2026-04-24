"use client";

import Image from "next/image";
import { Edit, PackageMinus, PackageOpen, MapPin } from "lucide-react";
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
  onUse?: () => void;
  isUsing?: boolean;
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

const getTypeLabel = (type: string) => {
  switch (type) {
    case "FOOD":
      return "식품";
    case "COSMETIC":
      return "화장품";
    case "MEDICINE":
      return "의약품";
    case "GENERAL":
      return "일반";
    default:
      return type;
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

const metadataLabelMap: Record<string, string> = {
  expiry_date: "유통기한",
  purchase_date: "구매일",
  brand: "브랜드",
  category: "카테고리",
  opened_date: "개봉일",
  pao: "PAO",
  prescription: "전문의약품",
  dosage: "복용량",
  warnings: "주의사항",
  warranty_until: "품질보증기간",
  manufacturer: "제조사",
  model: "모델명",
  notes: "메모",
};

const metadataDateKeys = new Set([
  "expiry_date",
  "purchase_date",
  "opened_date",
  "warranty_until",
]);

const hiddenMetadataKeys = new Set(["expiry_date", "purchase_date"]);

const isDisplayableMetadataValue = (value: unknown) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return false;
  return true;
};

const formatMetadataLabel = (key: string) =>
  metadataLabelMap[key] ||
  key
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatMetadataValue = (key: string, value: unknown) => {
  if (typeof value === "boolean") {
    return value ? "예" : "아니오";
  }

  if (typeof value === "number") {
    return key === "pao" ? `${value}개월` : String(value);
  }

  if (typeof value === "string") {
    if (metadataDateKeys.has(key)) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value
      .filter(
        (entry): entry is string | number =>
          typeof entry === "string" || typeof entry === "number",
      )
      .map((entry) => String(entry))
      .join(", ");
  }

  return null;
};

export function ItemDetailContent({
  item,
  onEdit,
  onUse,
  isUsing = false,
}: ItemDetailContentProps) {
  if (!item) return null;

  const itemName = item.item_name || item.name || "이름 없음";
  const itemType = item.item_type || item.type || "GENERAL";
  const itemTypeLabel = getTypeLabel(itemType);
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
  const metadataEntries = Object.entries(item.metadata ?? {}).filter(
    ([key, value]) =>
      !hiddenMetadataKeys.has(key) && isDisplayableMetadataValue(value),
  );

  return (
    <div className="flex flex-col h-full bg-background no-scrollbar relative">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-28">
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
              {emoji} {itemTypeLabel}
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
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-secondary/10 px-5 py-4 transition-colors hover:border-border/70">
              <span className="text-sm font-medium text-muted-foreground">
                추가일
              </span>
              <p className="text-lg font-bold text-foreground text-right">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </p>
            </div>

            <div
              className={cn(
                "flex items-center justify-between rounded-2xl border px-5 py-4 transition-colors",
                expiryStatus === "expired"
                  ? "status-expired"
                  : "bg-secondary/10 border-border/50 hover:border-border/70",
              )}
            >
              <div className="flex items-center gap-2">
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
              </div>

              <div className="text-right">
                {expiryDate ? (
                  <>
                    <p
                      className={cn(
                        "text-lg font-bold",
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
                            "mt-1 text-xs font-medium",
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

            <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-secondary/10 px-5 py-4 transition-colors hover:border-border/70">
              <span className="text-sm font-medium text-muted-foreground">
                갯수
              </span>
              <p className="text-lg font-bold text-foreground">
                {quantity !== null && quantity !== undefined
                  ? `${quantity}개`
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        {tags.length > 0 && (
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
        )}

        {metadataEntries.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
              메타데이터
            </label>
            <div className="rounded-2xl border border-border/50 bg-secondary/10 px-4 py-3 transition-colors hover:border-border/70">
              {metadataEntries.map(([key, value]) => {
                const formattedValue = formatMetadataValue(key, value);

                if (!formattedValue) return null;

                return (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 border-b border-border/40 py-2.5 last:border-b-0 last:pb-0 first:pt-0"
                  >
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatMetadataLabel(key)}
                    </span>
                    <p className="text-sm font-semibold text-foreground text-right whitespace-pre-wrap break-words">
                      {formattedValue}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="z-10 absolute bottom-0 left-0 right-0 p-4 border-t border-border/70 bg-card/95 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onUse}
            isLoading={isUsing}
            disabled={!onUse || quantity === null || quantity === undefined || quantity <= 0}
            variant="secondary"
            className="text-lg h-14 font-bold rounded-xl"
            size="lg"
          >
            <PackageMinus className="w-5 h-5 mr-2" />
            사용하기
          </Button>
          <Button
            onClick={onEdit}
            disabled={!onEdit}
            className="text-lg h-14 font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-0.5"
            size="lg"
          >
            <Edit className="w-5 h-5 mr-2" />
            수정하기
          </Button>
        </div>
        {quantity !== null && quantity !== undefined && quantity <= 0 && (
          <div className="mt-3 rounded-2xl border border-dashed border-border/70 bg-secondary/10 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <PackageOpen className="h-4 w-4" />
              재고가 모두 소진된 물품입니다
            </div>
            <p className="mt-1">수량이 0개가 되면 물품 목록에서는 자동으로 숨겨집니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

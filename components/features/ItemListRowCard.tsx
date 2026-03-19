"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ItemType = "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";

interface ItemListRowCardProps {
  title: string;
  type: ItemType;
  imageUrl?: string | null;
  locationText?: string | null;
  tags?: string[];
  daysUntilExpiry?: number | null;
  onClick: () => void;
  className?: string;
}

function getTypeEmoji(type: ItemType): string {
  if (type === "FOOD") return "🍽️";
  if (type === "COSMETIC") return "💄";
  if (type === "MEDICINE") return "💊";
  return "📦";
}

function getExpiryBadge(daysUntilExpiry?: number | null): {
  label: string;
  className: string;
} | null {
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) {
    return null;
  }

  if (daysUntilExpiry < 0) {
    return {
      label: "만료됨",
      className: "bg-destructive/15 text-destructive",
    };
  }

  if (daysUntilExpiry <= 7) {
    return {
      label: "만료 임박",
      className: "bg-warning/15 text-warning",
    };
  }

  return null;
}

export function ItemListRowCard({
  title,
  type,
  imageUrl,
  locationText,
  tags = [],
  daysUntilExpiry,
  onClick,
  className,
}: ItemListRowCardProps) {
  const expiry = getExpiryBadge(daysUntilExpiry);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full card hover-lift group p-3 sm:p-4 bg-card border border-border block text-left",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-secondary/30 flex items-center justify-center text-2xl shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <span aria-hidden="true">{getTypeEmoji(type)}</span>
          )}
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-foreground truncate text-base">
              {title}
            </h3>
            {expiry && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                  expiry.className,
                )}
              >
                {expiry.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm text-muted-foreground truncate">
              {locationText || "위치 미지정"}
            </p>
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-secondary text-muted-foreground shrink-0"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors shrink-0" />
      </div>
    </button>
  );
}

"use client";

import { LocationThumbnail } from "@/components/features/LocationThumbnail";
import type { Location } from "@/lib/types";
import { getLocationItemCount } from "@/lib/utils/location-count";

interface LocationGridCardProps {
  location: Location;
  onClick: (location: Location) => void;
  countLabel?: (count: number) => string;
  className?: string;
}

export function LocationGridCard({
  location,
  onClick,
  countLabel = (count) => `물품 ${count}개`,
  className = "card hover-lift p-4 transition-all duration-200 bg-card border border-border",
}: LocationGridCardProps) {
  const itemCount = getLocationItemCount(location);

  return (
    <button type="button" onClick={() => onClick(location)} className={className}>
      <div className="flex flex-col items-center text-center">
        <LocationThumbnail
          name={location.name}
          icon={location.icon || "📦"}
          className="mb-3 h-24 w-full max-w-[168px]"
          emojiClassName="h-8 w-8 text-base"
        />
        <h3 className="font-semibold text-foreground mb-1 text-sm">
          {location.name}
        </h3>
        <p className="text-xs text-muted-foreground">{countLabel(itemCount)}</p>
      </div>
    </button>
  );
}

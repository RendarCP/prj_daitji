"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { getLocationImage } from "@/lib/utils/location-images";

interface LocationThumbnailProps {
  name?: string | null;
  icon?: string | null;
  className?: string;
  emojiClassName?: string;
  labelClassName?: string;
}

export function LocationThumbnail({
  name,
  icon,
  className,
  emojiClassName,
  labelClassName,
}: LocationThumbnailProps) {
  const image = getLocationImage(name);
  const displayName = name?.trim() || image.label;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-secondary/40",
        className,
      )}
    >
      <Image
        src={image.src}
        alt={`${image.label} 기본 이미지`}
        fill
        sizes="(max-width: 768px) 128px, 160px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20" />

      {icon ? (
        <div
          className={cn(
            "absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/75 text-lg shadow-sm backdrop-blur-sm",
            emojiClassName,
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      ) : null}

      <div
        className={cn(
          "absolute inset-x-2 bottom-2 truncate rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-700 backdrop-blur-sm",
          labelClassName,
        )}
      >
        {displayName}
      </div>
    </div>
  );
}

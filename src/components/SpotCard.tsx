"use client";

import { useState, useRef, useCallback } from "react";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";
import SpotImage from "./SpotImage";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";

interface SpotCardProps {
  place: Place;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  featured?: boolean;
}

export default function SpotCard({
  place,
  isFavorite,
  onToggleFavorite,
  onClick,
  featured = false,
}: SpotCardProps) {
  const photos = place.photoUrls.length > 0 ? place.photoUrls : [place.photoUrl];
  const hasMultiple = photos.length > 1;
  const [activeIndex, setActiveIndex] = useState(0);

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const isSwiping = useRef(false);

  const goTo = useCallback(
    (index: number, e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveIndex(Math.max(0, Math.min(index, photos.length - 1)));
    },
    [photos.length]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(touchDeltaX.current) > 10) isSwiping.current = true;
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    if (touchDeltaX.current < -40 && activeIndex < photos.length - 1)
      setActiveIndex((i) => i + 1);
    else if (touchDeltaX.current > 40 && activeIndex > 0)
      setActiveIndex((i) => i - 1);
    touchDeltaX.current = 0;
    isSwiping.current = false;
  };

  const handleCardClick = () => {
    if (!isSwiping.current) onClick();
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group bg-white rounded-2xl overflow-hidden cursor-pointer card-hover animate-fade-in",
        featured
          ? "gradient-border shadow-card"
          : "shadow-card border border-surface-border/60"
      )}
    >
      {/* Image carousel */}
      <div
        className="relative aspect-[4/3] overflow-hidden"
        onTouchStart={hasMultiple ? handleTouchStart : undefined}
        onTouchMove={hasMultiple ? handleTouchMove : undefined}
        onTouchEnd={hasMultiple ? handleTouchEnd : undefined}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {photos.map((url, i) => (
            <div key={i} className="w-full h-full shrink-0">
              <SpotImage
                src={url}
                alt={`${place.name} photo ${i + 1}`}
                types={place.types}
                id={`${place.id}-${i}`}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>

        {/* Arrow buttons (desktop hover) */}
        {hasMultiple && activeIndex > 0 && (
          <button
            onClick={(e) => goTo(activeIndex - 1, e)}
            className="absolute left-2 top-1/2 -translate-y-1/2
                       w-7 h-7 flex items-center justify-center rounded-full
                       bg-white/90 text-text-primary shadow-soft
                       opacity-0 group-hover:opacity-100 transition-all
                       hover:bg-white hover:shadow-card"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {hasMultiple && activeIndex < photos.length - 1 && (
          <button
            onClick={(e) => goTo(activeIndex + 1, e)}
            className="absolute right-2 top-1/2 -translate-y-1/2
                       w-7 h-7 flex items-center justify-center rounded-full
                       bg-white/90 text-text-primary shadow-soft
                       opacity-0 group-hover:opacity-100 transition-all
                       hover:bg-white hover:shadow-card"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Dot indicators */}
        {hasMultiple && (
          <div className="absolute bottom-8 inset-x-0 flex justify-center gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => goTo(i, e)}
                className={cn(
                  "h-1.5 rounded-full transition-all shadow-sm",
                  i === activeIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        )}

        {/* Type badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold
                        bg-white/90 text-text-primary shadow-soft backdrop-blur-sm">
          {place.typeLabel}
        </span>

        {/* Favorite heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-soft
                     backdrop-blur-sm hover:bg-white hover:shadow-card transition-all"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={16}
            className={cn(
              "transition-colors",
              isFavorite
                ? "fill-brand-magenta text-brand-magenta"
                : "text-text-muted hover:text-brand-magenta"
            )}
          />
        </button>

        {/* Rating badge */}
        {place.rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1
                         px-2.5 py-1 rounded-full bg-white/90 shadow-soft backdrop-blur-sm">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-text-primary">
              {place.rating.toFixed(1)}
            </span>
            {place.ratingCount > 0 && (
              <span className="text-xs text-text-muted">
                ({place.ratingCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Price badge */}
        {place.priceLevelLabel && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold
                          bg-white/90 shadow-soft backdrop-blur-sm gradient-text">
            {place.priceLevelLabel}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-text-primary leading-tight line-clamp-1
                       group-hover:gradient-text transition-colors">
          {place.name}
        </h3>

        <p className="text-sm text-text-secondary line-clamp-1">
          {place.shortAddress}
        </p>

        {/* Tags */}
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-medium
                           gradient-brand-subtle text-brand-purple"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton loader ────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-white border border-surface-border/60 rounded-2xl overflow-hidden shadow-soft">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
        <div className="flex gap-1.5">
          <div className="h-5 w-16 skeleton rounded-full" />
          <div className="h-5 w-14 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}

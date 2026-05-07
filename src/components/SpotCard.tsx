"use client";

import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";
import { qualityScore } from "@/lib/algorithm";
import SpotImage from "./SpotImage";
import { Heart, Star } from "lucide-react";

interface SpotCardProps {
  place: Place;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

export default function SpotCard({
  place,
  isFavorite,
  onToggleFavorite,
  onClick,
}: SpotCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-surface-card border border-surface-border rounded-2xl overflow-hidden
                 hover:border-brand-orange/30 hover:bg-surface-card-hover
                 transition-all duration-200 cursor-pointer animate-fade-in"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <SpotImage
          src={place.photoUrl}
          alt={place.name}
          types={place.types}
          id={place.id}
          className="w-full h-full"
        />

        {/* Type badge */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold
                        bg-black/60 text-white backdrop-blur-sm">
          {place.typeLabel}
        </span>

        {/* Favorite heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm
                     hover:bg-black/60 transition-colors"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            size={18}
            className={cn(
              "transition-colors",
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-white/80 hover:text-red-400"
            )}
          />
        </button>

        {/* Rating badge */}
        {place.rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1
                         px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
            <Star size={13} className="fill-brand-orange text-brand-orange" />
            <span className="text-xs font-semibold text-white">
              {place.rating.toFixed(1)}
            </span>
            {place.ratingCount > 0 && (
              <span className="text-xs text-white/60">
                ({place.ratingCount.toLocaleString()})
              </span>
            )}
          </div>
        )}

        {/* Price badge */}
        {place.priceLevelLabel && (
          <span className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold
                          bg-black/60 text-brand-orange backdrop-blur-sm">
            {place.priceLevelLabel}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-text-primary leading-tight line-clamp-1
                       group-hover:text-brand-orange transition-colors">
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
                className="px-2 py-0.5 rounded-full text-[11px] font-medium
                           bg-brand-orange/10 text-brand-orange"
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
    <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
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

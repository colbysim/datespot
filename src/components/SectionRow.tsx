"use client";

import type { Place } from "@/lib/types";
import type { CuratedSection } from "@/lib/algorithm";
import SpotCard from "./SpotCard";

interface SectionRowProps {
  section: CuratedSection;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (place: Place) => void;
  onSelectPlace: (id: string) => void;
}

export default function SectionRow({
  section,
  isFavorite,
  onToggleFavorite,
  onSelectPlace,
}: SectionRowProps) {
  if (section.places.length === 0) return null;

  const isTrending = section.id === "trending" || section.id === "top-picks";

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center
                         shadow-glow">
            <span className="text-lg">{section.icon}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {section.title}
            </h2>
            <p className="text-xs text-text-muted">{section.description}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-text-muted bg-surface-elevated
                        px-3 py-1 rounded-full">
          {section.places.length} spots
        </span>
      </div>

      {/* Gradient accent line */}
      <div className="h-[2px] w-20 rounded-full gradient-brand opacity-40" />

      {/* Horizontal scroll row */}
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
        {section.places.map((place) => (
          <div key={place.id} className="w-[210px] sm:w-[230px] shrink-0">
            <SpotCard
              place={place}
              isFavorite={isFavorite(place.id)}
              onToggleFavorite={() => onToggleFavorite(place)}
              onClick={() => onSelectPlace(place.id)}
              featured={isTrending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

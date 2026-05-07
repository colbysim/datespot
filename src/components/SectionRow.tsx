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

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{section.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {section.title}
            </h2>
            <p className="text-xs text-text-muted">{section.description}</p>
          </div>
        </div>
        <span className="text-xs text-text-muted">
          {section.places.length} spots
        </span>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
        {section.places.map((place) => (
          <div key={place.id} className="w-[200px] sm:w-[220px] shrink-0">
            <SpotCard
              place={place}
              isFavorite={isFavorite(place.id)}
              onToggleFavorite={() => onToggleFavorite(place)}
              onClick={() => onSelectPlace(place.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

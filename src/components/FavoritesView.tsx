"use client";

import type { Place } from "@/lib/types";
import SpotCard from "./SpotCard";
import EmptyState from "./EmptyState";

interface FavoritesViewProps {
  favorites: Place[];
  onToggleFavorite: (place: Place) => void;
  onSelectPlace: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export default function FavoritesView({
  favorites,
  onToggleFavorite,
  onSelectPlace,
  isFavorite,
}: FavoritesViewProps) {
  if (favorites.length === 0) {
    return (
      <EmptyState
        icon="💕"
        title="No Saved Spots Yet"
        message="Tap the heart on any date spot to save it here for later."
      />
    );
  }

  return (
    <div className="px-5 md:px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-extrabold text-text-primary">
          Saved Spots
        </h2>
        <span className="text-sm font-medium text-text-muted bg-surface-elevated
                        px-3 py-1 rounded-full">
          {favorites.length}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {favorites.map((place) => (
          <SpotCard
            key={place.id}
            place={place}
            isFavorite={isFavorite(place.id)}
            onToggleFavorite={() => onToggleFavorite(place)}
            onClick={() => onSelectPlace(place.id)}
          />
        ))}
      </div>
    </div>
  );
}

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
    <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-text-primary mb-5">
        Saved Spots ({favorites.length})
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

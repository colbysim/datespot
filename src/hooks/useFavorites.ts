"use client";

import { useState, useCallback, useEffect } from "react";
import type { Place } from "@/lib/types";

const STORAGE_KEY = "datespot-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Place[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {}
  }, [favorites, loaded]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (place: Place) => {
      setFavorites((prev) =>
        prev.some((f) => f.id === place.id)
          ? prev.filter((f) => f.id !== place.id)
          : [...prev, place]
      );
    },
    []
  );

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return { favorites, isFavorite, toggleFavorite, clearFavorites, loaded };
}

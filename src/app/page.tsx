"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Place, Filters } from "@/lib/types";
import { DEFAULT_FILTERS } from "@/lib/types";
import { mapPlace } from "@/lib/mappers";
import {
  rankAndFilter,
  buildCuratedSections,
  type VenueCategory,
} from "@/lib/algorithm";
import { useDebounce } from "@/hooks/useDebounce";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useFavorites } from "@/hooks/useFavorites";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import SpotCard, { SkeletonCard } from "@/components/SpotCard";
import FilterSheet from "@/components/FilterSheet";
import SpotDetail from "@/components/SpotDetail";
import FavoritesView from "@/components/FavoritesView";
import SectionRow from "@/components/SectionRow";
import EmptyState from "@/components/EmptyState";

type Screen = "home" | "favorites" | "detail";

export default function HomePage() {
  // ─── State ──────────────────────────────────
  const [screen, setScreen] = useState<Screen>("home");
  const [query, setQuery] = useState("");
  const [rawResults, setRawResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeCategory, setActiveCategory] = useState<VenueCategory>("all");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 500);
  const geo = useGeolocation();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  // ─── Algorithm: rank + filter results ─────
  const filteredResults = useMemo(
    () =>
      rankAndFilter(
        rawResults,
        activeCategory,
        filters.minRating,
        filters.priceLevels
      ),
    [rawResults, activeCategory, filters.minRating, filters.priceLevels]
  );

  // ─── Algorithm: curated sections ──────────
  const curatedSections = useMemo(
    () => buildCuratedSections(rawResults),
    [rawResults]
  );

  // ─── Derived ────────────────────────────────
  const hasActiveFilters =
    filters.priceLevels.length > 0 ||
    filters.minRating > 0 ||
    filters.radiusMiles !== 15;

  const showCuratedView =
    activeCategory === "all" && !hasActiveFilters && hasSearched && !isLoading && !error;

  // ─── Search by city ─────────────────────────
  const searchByCity = useCallback(
    async (cityQuery: string) => {
      if (!cityQuery.trim()) return;
      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: cityQuery,
            filters: {
              radiusMiles: filters.radiusMiles,
              latitude: geo.latitude,
              longitude: geo.longitude,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const places = (data.places || []).map(mapPlace);
        setRawResults(places);
      } catch (e: any) {
        setError(e.message || "Search failed");
        setRawResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filters.radiusMiles, geo.latitude, geo.longitude]
  );

  // ─── Search nearby ─────────────────────────
  const searchNearby = useCallback(async () => {
    if (!geo.latitude || !geo.longitude) return;
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch("/api/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: geo.latitude,
          longitude: geo.longitude,
          filters: { radiusMiles: filters.radiusMiles },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const places = (data.places || []).map(mapPlace);
      setRawResults(places);
    } catch (e: any) {
      setError(e.message || "Nearby search failed");
      setRawResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [geo.latitude, geo.longitude, filters.radiusMiles]);

  // ─── Auto-search on debounced query ────────
  useEffect(() => {
    if (debouncedQuery.trim()) {
      searchByCity(debouncedQuery);
    }
  }, [debouncedQuery, searchByCity]);

  // ─── Request location on mount ────────────
  useEffect(() => {
    geo.requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-search nearby on location grant ──
  useEffect(() => {
    if (geo.status === "granted" && !query.trim() && !hasSearched) {
      searchNearby();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.status]);

  // ─── Navigation helpers ────────────────────
  const openDetail = (id: string) => {
    setSelectedPlaceId(id);
    setScreen("detail");
    window.scrollTo(0, 0);
  };

  const closeDetail = () => {
    setSelectedPlaceId(null);
    setScreen("home");
  };

  const selectedPlace =
    rawResults.find((p) => p.id === selectedPlaceId) ||
    favorites.find((f) => f.id === selectedPlaceId);

  // ─── Detail view ──────────────────────────
  if (screen === "detail" && selectedPlaceId) {
    return (
      <SpotDetail
        placeId={selectedPlaceId}
        onBack={closeDetail}
        isFavorite={isFavorite(selectedPlaceId)}
        onToggleFavorite={() => {
          if (selectedPlace) toggleFavorite(selectedPlace);
        }}
      />
    );
  }

  // ─── Main layout ──────────────────────────
  return (
    <div className="min-h-screen bg-surface-base">
      <Navbar
        activeScreen={screen === "favorites" ? "favorites" : "home"}
        onNavigate={(s) => setScreen(s)}
        favoritesCount={favorites.length}
      />

      {screen === "favorites" ? (
        <FavoritesView
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onSelectPlace={openDetail}
          isFavorite={isFavorite}
        />
      ) : (
        <>
          {/* Hero + Search */}
          <div className="px-5 md:px-6 pt-8 pb-2 max-w-6xl mx-auto">
            {/* Tagline — only before first search */}
            {!hasSearched && (
              <div className="text-center mb-8 animate-fade-in">
                <h1 className="text-3xl md:text-5xl font-extrabold text-text-primary mb-3 tracking-tight">
                  Find Your Perfect{" "}
                  <span className="gradient-text">Date Spot</span>
                </h1>
                <p className="text-text-secondary text-sm md:text-lg max-w-lg mx-auto leading-relaxed">
                  Discover trending restaurants, hidden gems, and unique
                  experiences — curated by our quality algorithm.
                </p>
              </div>
            )}

            <SearchBar
              value={query}
              onChange={setQuery}
              isLoading={isLoading}
              onFilterClick={() => setShowFilters(true)}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Location status */}
            {geo.status === "loading" && (
              <p className="text-xs text-text-muted mt-2 text-center">
                Detecting your location...
              </p>
            )}
            {geo.status === "denied" && !query && (
              <p className="text-xs text-text-muted mt-2 text-center">
                Location access denied — search by city instead
              </p>
            )}
          </div>

          {/* Category Tabs */}
          {hasSearched && (
            <div className="px-4 md:px-6 py-3 max-w-6xl mx-auto">
              <CategoryTabs
                active={activeCategory}
                onChange={setActiveCategory}
              />
            </div>
          )}

          {/* Results */}
          <div className="px-5 md:px-6 pb-12 max-w-6xl mx-auto">
            {/* Loading skeleton */}
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {!isLoading && error && (
              <EmptyState
                icon="😔"
                title="Something Went Wrong"
                message={error}
                action={{
                  label: "Try Again",
                  onClick: () =>
                    query ? searchByCity(query) : searchNearby(),
                }}
              />
            )}

            {/* Curated sections view (default "All" tab, no extra filters) */}
            {showCuratedView && curatedSections.length > 0 && (
              <div className="space-y-10 mt-6">
                {curatedSections.map((section) => (
                  <SectionRow
                    key={section.id}
                    section={section}
                    isFavorite={isFavorite}
                    onToggleFavorite={toggleFavorite}
                    onSelectPlace={openDetail}
                  />
                ))}
              </div>
            )}

            {/* Filtered grid view (specific category or filters active) */}
            {!isLoading &&
              !error &&
              hasSearched &&
              (!showCuratedView || curatedSections.length === 0) && (
                <>
                  {filteredResults.length > 0 ? (
                    <>
                      <div className="flex items-center justify-between mb-4 mt-4">
                        <h2 className="text-lg font-bold text-text-primary">
                          {activeCategory !== "all"
                            ? `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}`
                            : query
                              ? `Spots in ${query}`
                              : "Date Spots Near You"}
                        </h2>
                        <span className="text-sm text-text-muted">
                          {filteredResults.length} results
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredResults.map((place) => (
                          <SpotCard
                            key={place.id}
                            place={place}
                            isFavorite={isFavorite(place.id)}
                            onToggleFavorite={() => toggleFavorite(place)}
                            onClick={() => openDetail(place.id)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      icon="🔍"
                      title="No Spots Found"
                      message={
                        activeCategory !== "all"
                          ? `No ${activeCategory} match your criteria. Try a different category or adjust filters.`
                          : "Try a different city or adjust your filters."
                      }
                      action={
                        hasActiveFilters || activeCategory !== "all"
                          ? {
                              label: "Reset Filters",
                              onClick: () => {
                                setFilters(DEFAULT_FILTERS);
                                setActiveCategory("all");
                              },
                            }
                          : undefined
                      }
                    />
                  )}
                </>
              )}

            {/* Initial state — no search yet */}
            {!isLoading && !hasSearched && !error && rawResults.length === 0 && (
              <EmptyState
                icon="🔥"
                title="Where To Tonight?"
                message="Search a city above or let us find spots near you."
                action={
                  geo.status !== "granted"
                    ? {
                        label: "Use My Location",
                        onClick: geo.requestLocation,
                      }
                    : undefined
                }
              />
            )}
          </div>
        </>
      )}

      {/* Filter sheet */}
      {showFilters && (
        <FilterSheet
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
          onApply={() => {
            setShowFilters(false);
            if (query) searchByCity(query);
            else if (geo.latitude && geo.longitude) searchNearby();
          }}
        />
      )}
    </div>
  );
}

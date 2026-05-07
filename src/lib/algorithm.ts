import type { Place } from "./types";

// ═══════════════════════════════════════════════
//  DateSpot Quality Algorithm
// ═══════════════════════════════════════════════
//  Combines rating, review count, and venue type
//  into a single quality score (0–100). Also
//  enforces per-category minimum thresholds and
//  classifies places into curated sections.
// ═══════════════════════════════════════════════

// ─── Category Definitions ───────────────────
export type VenueCategory =
  | "all"
  | "restaurants"
  | "cafes"
  | "parks"
  | "activities"
  | "nightlife";

// Maps our categories to Google Places types
export const CATEGORY_TYPES: Record<VenueCategory, string[]> = {
  all: [],
  restaurants: [
    "restaurant",
    "steak_house",
    "seafood_restaurant",
    "fine_dining_restaurant",
    "brunch_restaurant",
    "hamburger_restaurant",
    "pizza_restaurant",
    "mexican_restaurant",
    "chinese_restaurant",
    "japanese_restaurant",
    "thai_restaurant",
    "indian_restaurant",
    "italian_restaurant",
    "korean_restaurant",
    "vietnamese_restaurant",
    "mediterranean_restaurant",
    "american_restaurant",
  ],
  cafes: [
    "cafe",
    "coffee_shop",
    "bakery",
    "ice_cream_shop",
    "tea_house",
  ],
  parks: [
    "park",
    "garden",
    "hiking_area",
    "marina",
    "national_park",
    "dog_park",
    "playground",
  ],
  activities: [
    "bowling_alley",
    "amusement_center",
    "escape_room",
    "movie_theater",
    "karaoke",
    "comedy_club",
    "aquarium",
    "zoo",
    "amusement_park",
    "tourist_attraction",
    "shopping_mall",
  ],
  nightlife: [
    "bar",
    "night_club",
    "wine_bar",
    "cocktail_bar",
    "live_music_venue",
    "performing_arts_theater",
    "lounge",
  ],
};

// ─── Per-Category Minimum Thresholds ────────
// Places below these ratings get filtered out entirely
const MIN_THRESHOLDS: Record<VenueCategory, { rating: number; reviews: number }> = {
  all:         { rating: 3.8, reviews: 8 },
  restaurants: { rating: 4.0, reviews: 15 },
  cafes:       { rating: 4.0, reviews: 10 },
  parks:       { rating: 3.5, reviews: 5 },
  activities:  { rating: 3.8, reviews: 10 },
  nightlife:   { rating: 3.8, reviews: 10 },
};

// ─── Scoring Weights ────────────────────────
const WEIGHTS = {
  rating: 0.50,      // Rating is king
  reviewConfidence: 0.30, // More reviews = more trustworthy
  typeBonus: 0.20,   // Bonus for date-worthy types
};

// ─── Review count confidence curve ──────────
// Uses a sigmoid-style curve so that:
//   10 reviews  → ~0.25 confidence
//   50 reviews  → ~0.60 confidence
//   200 reviews → ~0.85 confidence
//   500+ reviews → ~0.95 confidence
// This is the "balanced approach" — hidden gems
// with 30 great reviews still score decently.
function reviewConfidence(count: number): number {
  // Tuned sigmoid: 1 - e^(-count/150)
  return 1 - Math.exp(-count / 150);
}

// ─── Type bonus for date-worthy venues ──────
const DATE_WORTHY_TYPES = new Set([
  "fine_dining_restaurant",
  "wine_bar",
  "cocktail_bar",
  "spa",
  "art_gallery",
  "performing_arts_theater",
  "live_music_venue",
  "garden",
  "rooftop_bar",
  "lounge",
]);

const FUN_DATE_TYPES = new Set([
  "bowling_alley",
  "escape_room",
  "karaoke",
  "comedy_club",
  "amusement_center",
  "amusement_park",
  "aquarium",
  "zoo",
]);

function typeBonus(types: string[]): number {
  let bonus = 0;
  for (const t of types) {
    if (DATE_WORTHY_TYPES.has(t)) bonus = Math.max(bonus, 1.0);
    if (FUN_DATE_TYPES.has(t)) bonus = Math.max(bonus, 0.8);
  }
  return bonus; // 0–1 scale
}

// ─── Main Quality Score (0–100) ─────────────
export function qualityScore(place: Place): number {
  const { rating, ratingCount, types } = place;

  // Normalize rating to 0–1 (maps 1–5 → 0–1)
  const ratingNorm = Math.max(0, (rating - 1) / 4);

  // Review confidence (0–1)
  const confidence = reviewConfidence(ratingCount);

  // Type bonus (0–1)
  const bonus = typeBonus(types);

  // Weighted combination
  const raw =
    ratingNorm * WEIGHTS.rating +
    confidence * WEIGHTS.reviewConfidence +
    bonus * WEIGHTS.typeBonus;

  // Scale to 0–100
  return Math.round(raw * 100);
}

// ─── Detect venue category ──────────────────
export function detectCategory(place: Place): VenueCategory {
  const typeSet = new Set(place.types);

  // Check in priority order (nightlife before restaurants
  // so bars don't get classified as restaurants)
  const categoryOrder: VenueCategory[] = [
    "nightlife",
    "cafes",
    "activities",
    "parks",
    "restaurants",
  ];

  for (const cat of categoryOrder) {
    if (CATEGORY_TYPES[cat].some((t) => typeSet.has(t))) {
      return cat;
    }
  }
  return "restaurants"; // fallback
}

// ─── Filter by category thresholds ──────────
export function passesThreshold(
  place: Place,
  category: VenueCategory = "all"
): boolean {
  const detected = category === "all" ? detectCategory(place) : category;
  const thresh = MIN_THRESHOLDS[detected] || MIN_THRESHOLDS.all;

  return place.rating >= thresh.rating && place.ratingCount >= thresh.reviews;
}

// ─── Filter by category tab ─────────────────
export function matchesCategory(
  place: Place,
  category: VenueCategory
): boolean {
  if (category === "all") return true;
  const validTypes = CATEGORY_TYPES[category];
  return place.types.some((t) => validTypes.includes(t));
}

// ═══════════════════════════════════════════════
//  Curated Section Classification
// ═══════════════════════════════════════════════

export interface CuratedSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  places: Place[];
}

// ─── Section classifiers ────────────────────

function isTrending(place: Place): boolean {
  // High review count + good rating = trending/popular
  return place.ratingCount >= 200 && place.rating >= 4.2;
}

function isHiddenGem(place: Place): boolean {
  // Great rating but not many reviews yet
  return (
    place.rating >= 4.5 &&
    place.ratingCount >= 10 &&
    place.ratingCount <= 150
  );
}

function isRomantic(place: Place): boolean {
  const romanticTypes = new Set([
    "fine_dining_restaurant",
    "wine_bar",
    "cocktail_bar",
    "spa",
    "garden",
    "performing_arts_theater",
    "art_gallery",
    "italian_restaurant",
    "french_restaurant",
    "steak_house",
    "seafood_restaurant",
  ]);
  return (
    place.rating >= 4.3 &&
    place.types.some((t) => romanticTypes.has(t))
  );
}

function isBudgetFriendly(place: Place): boolean {
  return (
    place.priceLevel <= 1 &&
    place.rating >= 4.0
  );
}

function isUniqueExperience(place: Place): boolean {
  const uniqueTypes = new Set([
    "escape_room",
    "karaoke",
    "comedy_club",
    "bowling_alley",
    "amusement_center",
    "amusement_park",
    "aquarium",
    "zoo",
    "live_music_venue",
    "museum",
  ]);
  return (
    place.rating >= 3.8 &&
    place.types.some((t) => uniqueTypes.has(t))
  );
}

// ─── Build all curated sections ─────────────
export function buildCuratedSections(places: Place[]): CuratedSection[] {
  // First, score and sort all places
  const scored = places
    .filter((p) => passesThreshold(p))
    .map((p) => ({ place: p, score: qualityScore(p) }))
    .sort((a, b) => b.score - a.score);

  const scoredPlaces = scored.map((s) => s.place);

  const sections: CuratedSection[] = [];

  // Top Picks — overall best by algorithm score
  const topPicks = scoredPlaces.slice(0, 8);
  if (topPicks.length > 0) {
    sections.push({
      id: "top-picks",
      title: "Top Picks",
      icon: "🔥",
      description: "Highest-rated date spots by our algorithm",
      places: topPicks,
    });
  }

  // Trending — popular spots with lots of reviews
  const trending = scoredPlaces.filter(isTrending).slice(0, 8);
  if (trending.length > 0) {
    sections.push({
      id: "trending",
      title: "Trending Spots",
      icon: "📈",
      description: "Popular places everyone's talking about",
      places: trending,
    });
  }

  // Hidden Gems — high rating, lower review count
  const gems = scoredPlaces.filter(isHiddenGem).slice(0, 8);
  if (gems.length > 0) {
    sections.push({
      id: "hidden-gems",
      title: "Hidden Gems",
      icon: "💎",
      description: "Under-the-radar spots with amazing reviews",
      places: gems,
    });
  }

  // Romantic Picks
  const romantic = scoredPlaces.filter(isRomantic).slice(0, 8);
  if (romantic.length > 0) {
    sections.push({
      id: "romantic",
      title: "Romantic Picks",
      icon: "💕",
      description: "Set the mood for a special night",
      places: romantic,
    });
  }

  // Budget-Friendly
  const budget = scoredPlaces.filter(isBudgetFriendly).slice(0, 8);
  if (budget.length > 0) {
    sections.push({
      id: "budget",
      title: "Budget-Friendly",
      icon: "💰",
      description: "Great dates that won't break the bank",
      places: budget,
    });
  }

  // Unique Experiences
  const unique = scoredPlaces.filter(isUniqueExperience).slice(0, 8);
  if (unique.length > 0) {
    sections.push({
      id: "unique",
      title: "Unique Experiences",
      icon: "✨",
      description: "Something different for your next date",
      places: unique,
    });
  }

  return sections;
}

// ─── Sort + filter a results list ───────────
// Used when the user actively searches or picks a category tab
export function rankAndFilter(
  places: Place[],
  category: VenueCategory = "all",
  minRating = 0,
  priceLevels: number[] = []
): Place[] {
  return places
    // Category filter
    .filter((p) => matchesCategory(p, category))
    // Quality threshold
    .filter((p) => passesThreshold(p, category))
    // User-selected min rating
    .filter((p) => (minRating > 0 ? p.rating >= minRating : true))
    // User-selected price levels
    .filter((p) =>
      priceLevels.length > 0 ? priceLevels.includes(p.priceLevel) : true
    )
    // Sort by quality score descending
    .sort((a, b) => qualityScore(b) - qualityScore(a));
}

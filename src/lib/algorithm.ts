import type { Place } from "./types";

// ═══════════════════════════════════════════════
//  DateSpot Quality Algorithm v2
// ═══════════════════════════════════════════════
//  - Per-category rating thresholds
//  - Chain restaurant/cafe blacklist
//  - Uniqueness scoring (prioritizes interesting venues)
//  - Weighted quality score (0–100)
//  - Curated section classification
// ═══════════════════════════════════════════════

// ─── Category Definitions ───────────────────
export type VenueCategory =
  | "all"
  | "restaurants"
  | "cafes"
  | "parks"
  | "activities"
  | "nightlife";

// Each type appears in EXACTLY ONE bucket — detectCategory()
// resolves a place to a single tab, so duplicates across buckets
// would make tab assignment unpredictable.
//
// Deliberately NOT listed anywhere (anti-date, would reintroduce
// junk): fast_food_restaurant, meal_takeaway, meal_delivery,
// food_court, cafeteria.
export const CATEGORY_TYPES: Record<VenueCategory, string[]> = {
  all: [],
  restaurants: [
    "restaurant", "steak_house", "seafood_restaurant",
    "fine_dining_restaurant", "brunch_restaurant",
    "hamburger_restaurant", "pizza_restaurant",
    "mexican_restaurant", "chinese_restaurant",
    "japanese_restaurant", "thai_restaurant",
    "indian_restaurant", "italian_restaurant",
    "korean_restaurant", "vietnamese_restaurant",
    "mediterranean_restaurant", "american_restaurant",
    "french_restaurant", "greek_restaurant",
    "turkish_restaurant", "ramen_restaurant",
    "sushi_restaurant",
    // ── expanded coverage ──
    "pub", "bar_and_grill", "deli", "diner",
    "sandwich_shop", "bagel_shop", "breakfast_restaurant",
    "barbecue_restaurant", "vegan_restaurant",
    "vegetarian_restaurant", "asian_restaurant",
    "spanish_restaurant", "middle_eastern_restaurant",
    "lebanese_restaurant", "african_restaurant",
    "afghani_restaurant", "brazilian_restaurant",
    "indonesian_restaurant", "buffet_restaurant",
  ],
  cafes: [
    "cafe", "coffee_shop", "bakery",
    "ice_cream_shop", "tea_house",
    // ── expanded coverage ──
    "dessert_shop", "dessert_restaurant", "donut_shop",
    "chocolate_shop", "confectionery", "candy_store",
    "juice_shop", "acai_shop", "cat_cafe", "dog_cafe",
    "chocolate_factory",
  ],
  parks: [
    "park", "garden", "hiking_area", "marina",
    "national_park", "dog_park", "botanical_garden",
    // ── expanded coverage ──
    "beach", "plaza", "state_park",
    "observation_deck", "picnic_ground",
  ],
  activities: [
    "bowling_alley", "amusement_center", "escape_room",
    "movie_theater", "karaoke", "comedy_club",
    "aquarium", "zoo", "amusement_park",
    "tourist_attraction", "miniature_golf",
    // ── expanded coverage: culture lives here ──
    "museum", "art_gallery", "art_studio",
    "cultural_landmark", "historical_place", "monument",
    "sculpture", "opera_house", "concert_hall",
    "philharmonic_hall", "amphitheatre", "auditorium",
    "planetarium",
    // ── expanded coverage: recreation ──
    "spa", "arcade", "golf_course", "ice_skating_rink",
    "water_park", "skateboard_park", "sports_complex",
    "wildlife_park", "ferris_wheel", "roller_coaster",
  ],
  nightlife: [
    "bar", "night_club", "wine_bar", "cocktail_bar",
    "live_music_venue", "performing_arts_theater",
    // ── expanded coverage ──
    "casino", "dance_hall",
  ],
};

// ═══════════════════════════════════════════════
//  CHAIN BLACKLIST
// ═══════════════════════════════════════════════
// Filter out major chains that aren't date-worthy.
// Matched case-insensitively against the place name.
const CHAIN_BLACKLIST = [
  // Coffee/cafe chains — big corporate
  "starbucks", "peet's coffee", "peets coffee",
  "dunkin", "dunkin' donuts", "tim hortons",
  "caribou coffee", "dutch bros",
  // Coffee/cafe chains — "lowkey" but still chains
  "tous les jours", "paris baguette", "85 degrees",
  "85°c", "panera", "au bon pain",
  "cosi", "corner bakery", "la madeleine",
  "nothing bundt cakes", "crumbl", "insomnia cookies",
  "cinnabon", "auntie anne", "jamba", "smoothie king",
  "tropical smoothie", "kung fu tea", "gong cha",
  "tiger sugar", "coco fresh", "quickly",
  // Dessert/ice cream chains
  "baskin-robbins", "baskin robbins", "cold stone",
  "dairy queen", "carvel", "rita's italian ice",
  "marble slab", "menchie", "pinkberry", "yogurtland",
  "sweet frog", "tcby",
  // Fast food
  "mcdonald", "burger king", "wendy's", "wendys",
  "taco bell", "kfc", "popeyes", "chick-fil-a",
  "sonic drive", "jack in the box", "carl's jr",
  "hardee", "arby's", "arbys", "subway",
  "five guys", "shake shack", "in-n-out",
  "whataburger", "wingstop", "raising cane",
  "panda express", "chipotle", "qdoba",
  "jersey mike", "jimmy john", "firehouse subs",
  "jason's deli", "potbelly",
  // Casual dining chains
  "applebee", "chili's", "chilis", "olive garden",
  "red lobster", "outback steakhouse", "ihop",
  "denny's", "dennys", "cracker barrel",
  "buffalo wild wings", "hooters", "waffle house",
  "golden corral", "bob evans", "perkins",
  "texas roadhouse", "longhorn steakhouse",
  "red robin", "t.g.i. friday", "tgi friday",
  "cheesecake factory",
  // Convenience / not date spots
  "7-eleven", "wawa", "sheetz", "circle k",
  "gas station", "convenience store",
];

function isChain(name: string): boolean {
  const lower = name.toLowerCase();
  return CHAIN_BLACKLIST.some((chain) => lower.includes(chain));
}

// ═══════════════════════════════════════════════
//  NON-DATE PLACE FILTER
// ═══════════════════════════════════════════════
// Google sometimes returns places that aren't
// date-appropriate at all. Filter them out.
const EXCLUDED_TYPES = new Set([
  "gas_station", "car_wash", "car_dealer", "car_rental",
  "car_repair", "parking", "atm", "bank",
  "dentist", "doctor", "hospital", "pharmacy",
  "veterinary_care", "funeral_home", "cemetery",
  "police", "fire_station", "post_office",
  "laundry", "locksmith", "plumber", "electrician",
  "roofing_contractor", "moving_company",
  "insurance_agency", "real_estate_agency",
  "grocery_or_supermarket", "supermarket",
  "convenience_store", "department_store",
  "hardware_store", "storage",
  "school", "university", "church", "mosque",
  "synagogue", "hindu_temple",
]);

function isNonDatePlace(types: string[]): boolean {
  // If the ONLY types are excluded types, filter it out
  // But if it has both "restaurant" and "grocery_or_supermarket", keep it
  const dateTypes = types.filter((t) => !EXCLUDED_TYPES.has(t));
  const hasDateType = dateTypes.some(
    (t) =>
      CATEGORY_TYPES.restaurants.includes(t) ||
      CATEGORY_TYPES.cafes.includes(t) ||
      CATEGORY_TYPES.parks.includes(t) ||
      CATEGORY_TYPES.activities.includes(t) ||
      CATEGORY_TYPES.nightlife.includes(t)
  );
  return !hasDateType;
}

// ═══════════════════════════════════════════════
//  PER-CATEGORY THRESHOLDS
// ═══════════════════════════════════════════════
const MIN_THRESHOLDS: Record<VenueCategory, { rating: number; reviews: number }> = {
  all:         { rating: 3.8, reviews: 8 },
  restaurants: { rating: 4.2, reviews: 15 },
  cafes:       { rating: 4.5, reviews: 10 },
  parks:       { rating: 3.5, reviews: 5 },
  activities:  { rating: 4.0, reviews: 10 },
  nightlife:   { rating: 4.0, reviews: 10 },
};

// ═══════════════════════════════════════════════
//  SCORING WEIGHTS
// ═══════════════════════════════════════════════
const WEIGHTS = {
  rating: 0.40,
  reviewConfidence: 0.20,
  uniqueness: 0.25,
  typeBonus: 0.15,
};

// Review confidence (sigmoid curve)
// 30 reviews → ~0.18, 100 → ~0.49, 300 → ~0.86, 500+ → ~0.96
function reviewConfidence(count: number): number {
  return 1 - Math.exp(-count / 200);
}

// ─── Uniqueness score ───────────────────────
// Heavily rewards interesting, uncommon venue types
// that make for memorable dates.
const VERY_UNIQUE_TYPES = new Set([
  "escape_room", "karaoke", "comedy_club",
  "live_music_venue", "cocktail_bar",
  "wine_bar", "performing_arts_theater",
  "aquarium", "zoo", "botanical_garden",
  "amusement_park", "miniature_golf",
  // ── expanded coverage ──
  "opera_house", "concert_hall", "planetarium",
  "observation_deck", "amphitheatre",
]);

const UNIQUE_TYPES = new Set([
  "art_gallery", "museum", "spa",
  "bowling_alley", "amusement_center",
  "fine_dining_restaurant", "steak_house",
  "seafood_restaurant", "night_club",
  "garden", "marina", "hiking_area",
  // ── expanded coverage ──
  "art_studio", "historical_place", "monument",
  "cultural_landmark", "sculpture", "philharmonic_hall",
  "arcade", "golf_course", "ice_skating_rink",
  "beach", "wildlife_park", "casino",
]);

const GENERIC_TYPES = new Set([
  "restaurant", "cafe", "coffee_shop",
  "park", "bar",
]);

function uniquenessScore(types: string[], name: string): number {
  // Chain = 0 uniqueness
  if (isChain(name)) return 0;

  let score = 0.3; // baseline for non-chains

  for (const t of types) {
    if (VERY_UNIQUE_TYPES.has(t)) return 1.0;
    if (UNIQUE_TYPES.has(t)) score = Math.max(score, 0.7);
  }

  // Penalize very generic types slightly
  const allGeneric = types.every(
    (t) => GENERIC_TYPES.has(t) || EXCLUDED_TYPES.has(t)
  );
  if (allGeneric) score = Math.min(score, 0.2);

  return score;
}

// ─── Date-worthiness bonus ──────────────────
const DATE_WORTHY_TYPES = new Set([
  "fine_dining_restaurant", "wine_bar", "cocktail_bar",
  "spa", "art_gallery", "performing_arts_theater",
  "live_music_venue", "garden", "botanical_garden",
]);

const FUN_DATE_TYPES = new Set([
  "bowling_alley", "escape_room", "karaoke",
  "comedy_club", "amusement_center", "amusement_park",
  "aquarium", "zoo", "miniature_golf",
]);

function typeBonus(types: string[]): number {
  for (const t of types) {
    if (DATE_WORTHY_TYPES.has(t)) return 1.0;
    if (FUN_DATE_TYPES.has(t)) return 0.85;
  }
  return 0;
}

// ═══════════════════════════════════════════════
//  MAIN QUALITY SCORE (0–100)
// ═══════════════════════════════════════════════
export function qualityScore(place: Place): number {
  const { rating, ratingCount, types, name } = place;

  // Rating normalized 0–1 (maps 1–5 → 0–1)
  const ratingNorm = Math.max(0, (rating - 1) / 4);

  // Review confidence 0–1
  const confidence = reviewConfidence(ratingCount);

  // Uniqueness 0–1
  const uniqueness = uniquenessScore(types, name);

  // Type bonus 0–1
  const bonus = typeBonus(types);

  // Weighted sum
  const raw =
    ratingNorm * WEIGHTS.rating +
    confidence * WEIGHTS.reviewConfidence +
    uniqueness * WEIGHTS.uniqueness +
    bonus * WEIGHTS.typeBonus;

  return Math.round(raw * 100);
}

// ─── Detect venue category ──────────────────
export function detectCategory(place: Place): VenueCategory {
  const typeSet = new Set(place.types);
  const order: VenueCategory[] = [
    "nightlife", "cafes", "activities", "parks", "restaurants",
  ];
  for (const cat of order) {
    if (CATEGORY_TYPES[cat].some((t) => typeSet.has(t))) return cat;
  }
  return "restaurants";
}

// ═══════════════════════════════════════════════
//  FILTERING PIPELINE
// ═══════════════════════════════════════════════

// Step 1: Remove non-date places and chains
export function filterJunk(places: Place[]): Place[] {
  return places.filter((p) => {
    // Remove non-date places
    if (isNonDatePlace(p.types)) return false;
    // Remove chains
    if (isChain(p.name)) return false;
    // Must have a rating
    if (!p.rating || p.rating === 0) return false;
    return true;
  });
}

// Step 2: Apply per-category quality thresholds
export function passesThreshold(
  place: Place,
  category: VenueCategory = "all"
): boolean {
  const detected = category === "all" ? detectCategory(place) : category;
  const thresh = MIN_THRESHOLDS[detected] || MIN_THRESHOLDS.all;
  return place.rating >= thresh.rating && place.ratingCount >= thresh.reviews;
}

// Step 3: Match category tab
// Uses detectCategory() so each place only appears in its
// BEST-FIT category. A cafe tagged ["cafe","restaurant"]
// goes to Cafes, not Restaurants.
export function matchesCategory(
  place: Place,
  category: VenueCategory
): boolean {
  if (category === "all") return true;
  return detectCategory(place) === category;
}

// ═══════════════════════════════════════════════
//  NAME DEDUPLICATION
// ═══════════════════════════════════════════════
// Normalizes venue names and keeps only the highest-
// rated instance of any same-brand venue. This prevents
// e.g. 8 "Tous Les Jours" locations flooding a section.
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`]/g, "")           // curly quotes
    .replace(/[^a-z0-9\s]/g, " ")   // strip punctuation
    .replace(/\s+/g, " ")           // collapse whitespace
    .trim();
}

export function deduplicateByName(places: Place[]): Place[] {
  const bestByName = new Map<string, Place>();

  for (const place of places) {
    const key = normalizeName(place.name);
    const existing = bestByName.get(key);

    if (!existing) {
      bestByName.set(key, place);
    } else if (place.rating > existing.rating) {
      // Keep the higher-rated location
      bestByName.set(key, place);
    } else if (
      place.rating === existing.rating &&
      place.ratingCount > existing.ratingCount
    ) {
      // Same rating → keep the one with more reviews
      bestByName.set(key, place);
    }
  }

  return Array.from(bestByName.values());
}

// ═══════════════════════════════════════════════
//  FULL RANK + FILTER PIPELINE
// ═══════════════════════════════════════════════
export function rankAndFilter(
  places: Place[],
  category: VenueCategory = "all",
  minRating = 0,
  priceLevels: number[] = []
): Place[] {
  const filtered = filterJunk(places)
    .filter((p) => matchesCategory(p, category))
    .filter((p) => passesThreshold(p, category))
    .filter((p) => (minRating > 0 ? p.rating >= minRating : true))
    .filter((p) =>
      priceLevels.length > 0 ? priceLevels.includes(p.priceLevel) : true
    )
    .sort((a, b) => qualityScore(b) - qualityScore(a));

  // Deduplicate: keep only the best instance of each venue name
  return deduplicateByName(filtered);
}

// ═══════════════════════════════════════════════
//  CURATED SECTIONS
// ═══════════════════════════════════════════════

export interface CuratedSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  places: Place[];
}

function isTrending(place: Place): boolean {
  return place.ratingCount >= 200 && place.rating >= 4.2;
}

function isHiddenGem(place: Place): boolean {
  return (
    place.rating >= 4.5 &&
    place.ratingCount >= 10 &&
    place.ratingCount <= 150
  );
}

function isRomantic(place: Place): boolean {
  const romanticTypes = new Set([
    "fine_dining_restaurant", "wine_bar", "cocktail_bar",
    "spa", "garden", "botanical_garden",
    "performing_arts_theater", "art_gallery",
    "italian_restaurant", "french_restaurant",
    "steak_house", "seafood_restaurant",
  ]);
  return place.rating >= 4.3 && place.types.some((t) => romanticTypes.has(t));
}

function isBudgetFriendly(place: Place): boolean {
  return place.priceLevel <= 1 && place.rating >= 4.0;
}

function isUniqueExperience(place: Place): boolean {
  return place.types.some((t) => VERY_UNIQUE_TYPES.has(t)) && place.rating >= 3.8;
}

export function buildCuratedSections(places: Place[]): CuratedSection[] {
  // Full pipeline: junk filter → threshold → dedupe → score → sort
  const deduped = deduplicateByName(
    filterJunk(places).filter((p) => passesThreshold(p))
  );
  const cleaned = deduped
    .map((p) => ({ place: p, score: qualityScore(p) }))
    .sort((a, b) => b.score - a.score);

  const scoredPlaces = cleaned.map((s) => s.place);
  const sections: CuratedSection[] = [];

  // Top Picks
  const topPicks = scoredPlaces.slice(0, 8);
  if (topPicks.length > 0) {
    sections.push({
      id: "top-picks",
      title: "Top Picks",
      icon: "🔥",
      description: "Highest-ranked date spots by our algorithm",
      places: topPicks,
    });
  }

  // Unique Experiences (prioritized — matches user preference)
  const unique = scoredPlaces.filter(isUniqueExperience).slice(0, 8);
  if (unique.length > 0) {
    sections.push({
      id: "unique",
      title: "Unique Experiences",
      icon: "✨",
      description: "Escape rooms, comedy clubs, karaoke, and more",
      places: unique,
    });
  }

  // Trending
  const trending = scoredPlaces.filter(isTrending).slice(0, 8);
  if (trending.length > 0) {
    sections.push({
      id: "trending",
      title: "Trending Spots",
      icon: "📈",
      description: "Popular places with hundreds of great reviews",
      places: trending,
    });
  }

  // Hidden Gems
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

  // Romantic
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

  return sections;
}

// ─── Place types ────────────────────────────

export interface Place {
  id: string;
  name: string;
  address: string;
  shortAddress: string;
  rating: number;
  ratingCount: number;
  priceLevel: PriceLevel;
  priceLevelLabel: string;
  primaryType: string;
  typeLabel: string;
  photoUrl: string | null;
  photoUrls: string[];
  lat: number;
  lng: number;
  types: string[];
  tags: string[];
  distance?: string;
}

export interface PlaceDetail extends Place {
  description: string;
  phone: string | null;
  website: string | null;
  mapsUrl: string | null;
  hours: DayHours[];
  reviews: Review[];
  bestFor: string[];
  vibeTags: string[];
  suggestedPlan: string | null;
}

export interface DayHours {
  day: string;
  hours: string;
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  timeAgo: string;
  photoUrl?: string;
}

// ─── Filter types ───────────────────────────

export type PriceLevel = 0 | 1 | 2 | 3 | 4;

export interface Filters {
  experiences: string[];
  cuisines: string[];
  priceLevels: number[];
  minRating: number;
  radiusMiles: number;
  vibes: string[];
}

export const DEFAULT_FILTERS: Filters = {
  experiences: [],
  cuisines: [],
  priceLevels: [],
  minRating: 0,
  radiusMiles: 15,
  vibes: [],
};

// ─── Category types ─────────────────────────

export interface CategorySection {
  title: string;
  icon: string;
  description: string;
  places: Place[];
}

// ─── Search state ───────────────────────────

export type SearchMode = "city" | "nearby";

export interface SearchState {
  query: string;
  mode: SearchMode;
  isLoading: boolean;
  results: Place[];
  error: string | null;
}

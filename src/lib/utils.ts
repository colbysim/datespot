import { clsx, type ClassValue } from "clsx";

// ─── Class merge helper ─────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── Price level mapping ────────────────────
const PRICE_MAP: Record<string, { level: number; label: string }> = {
  PRICE_LEVEL_FREE: { level: 0, label: "Free" },
  PRICE_LEVEL_INEXPENSIVE: { level: 1, label: "$" },
  PRICE_LEVEL_MODERATE: { level: 2, label: "$$" },
  PRICE_LEVEL_EXPENSIVE: { level: 3, label: "$$$" },
  PRICE_LEVEL_VERY_EXPENSIVE: { level: 4, label: "$$$$" },
};

export function mapPriceLevel(raw?: string) {
  return PRICE_MAP[raw || ""] || { level: 0, label: "" };
}

// ─── Type → emoji icon ─────────────────────
const TYPE_ICONS: Record<string, string> = {
  restaurant: "🍽️",
  steak_house: "🥩",
  seafood_restaurant: "🦞",
  fine_dining_restaurant: "🥂",
  brunch_restaurant: "🥞",
  cafe: "☕",
  coffee_shop: "☕",
  bakery: "🧁",
  ice_cream_shop: "🍦",
  bar: "🍸",
  night_club: "🎶",
  wine_bar: "🍷",
  cocktail_bar: "🍹",
  bowling_alley: "🎳",
  amusement_center: "🎮",
  escape_room: "🔐",
  movie_theater: "🎬",
  karaoke: "🎤",
  comedy_club: "😂",
  park: "🌳",
  garden: "🌺",
  hiking_area: "🥾",
  marina: "⛵",
  museum: "🏛️",
  art_gallery: "🎨",
  performing_arts_theater: "🎭",
  live_music_venue: "🎵",
  spa: "💆",
  wellness_center: "🧘",
};

export function getTypeIcon(types: string[]): string {
  for (const t of types) {
    if (TYPE_ICONS[t]) return TYPE_ICONS[t];
  }
  return "📍";
}

// ─── Type → readable label ──────────────────
const TYPE_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  steak_house: "Steakhouse",
  seafood_restaurant: "Seafood",
  fine_dining_restaurant: "Fine Dining",
  brunch_restaurant: "Brunch",
  cafe: "Café",
  coffee_shop: "Coffee Shop",
  bakery: "Bakery",
  ice_cream_shop: "Ice Cream",
  bar: "Bar",
  night_club: "Nightclub",
  wine_bar: "Wine Bar",
  cocktail_bar: "Cocktail Bar",
  bowling_alley: "Bowling",
  amusement_center: "Arcade",
  escape_room: "Escape Room",
  movie_theater: "Movie Theater",
  karaoke: "Karaoke",
  comedy_club: "Comedy Club",
  park: "Park",
  garden: "Garden",
  hiking_area: "Hiking",
  marina: "Marina",
  museum: "Museum",
  art_gallery: "Art Gallery",
  performing_arts_theater: "Theater",
  live_music_venue: "Live Music",
  spa: "Spa",
  wellness_center: "Wellness",
};

export function getTypeLabel(types: string[], primaryType?: string): string {
  if (primaryType && TYPE_LABELS[primaryType]) return TYPE_LABELS[primaryType];
  for (const t of types) {
    if (TYPE_LABELS[t]) return TYPE_LABELS[t];
  }
  return "Venue";
}

// ─── Fallback gradients ─────────────────────
const GRADIENTS = [
  "gradient-warm",
  "gradient-cool",
  "gradient-sunset",
  "gradient-ocean",
  "gradient-forest",
  "gradient-night",
];

export function getFallbackGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// ─── Rating stars ───────────────────────────
export function getStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

// ─── Smart tags from types ──────────────────
export function deriveTags(types: string[]): string[] {
  const tags: string[] = [];
  const typeSet = new Set(types);

  if (typeSet.has("fine_dining_restaurant") || typeSet.has("steak_house"))
    tags.push("Romantic");
  if (typeSet.has("bar") || typeSet.has("night_club") || typeSet.has("cocktail_bar"))
    tags.push("Nightlife");
  if (typeSet.has("cafe") || typeSet.has("bakery") || typeSet.has("ice_cream_shop"))
    tags.push("Casual");
  if (typeSet.has("park") || typeSet.has("garden") || typeSet.has("hiking_area"))
    tags.push("Outdoor");
  if (typeSet.has("museum") || typeSet.has("art_gallery"))
    tags.push("Culture");
  if (typeSet.has("bowling_alley") || typeSet.has("amusement_center") || typeSet.has("escape_room"))
    tags.push("Active");
  if (typeSet.has("spa") || typeSet.has("wellness_center"))
    tags.push("Relaxing");
  if (typeSet.has("movie_theater") || typeSet.has("performing_arts_theater"))
    tags.push("Entertainment");
  if (typeSet.has("live_music_venue") || typeSet.has("karaoke"))
    tags.push("Music");

  return tags.length > 0 ? tags : ["Date Spot"];
}

// ─── "Best for" suggestions ─────────────────
export function deriveBestFor(types: string[], rating: number): string[] {
  const suggestions: string[] = [];

  if (rating >= 4.6) suggestions.push("Anniversary");
  if (rating >= 4.3) suggestions.push("First Date");

  const typeSet = new Set(types);
  if (typeSet.has("restaurant") || typeSet.has("fine_dining_restaurant"))
    suggestions.push("Dinner Date");
  if (typeSet.has("cafe") || typeSet.has("bakery"))
    suggestions.push("Casual Date");
  if (typeSet.has("bar") || typeSet.has("night_club"))
    suggestions.push("Night Out");
  if (typeSet.has("park") || typeSet.has("hiking_area"))
    suggestions.push("Active Date");
  if (typeSet.has("museum") || typeSet.has("art_gallery"))
    suggestions.push("Culture Date");
  if (typeSet.has("bowling_alley") || typeSet.has("amusement_center"))
    suggestions.push("Double Date");

  return suggestions.slice(0, 4);
}

// ─── Suggested date plan ────────────────────
export function suggestDatePlan(typeLabel: string, name: string): string {
  const plans: Record<string, string> = {
    Restaurant: `Start with dinner at ${name}, then take a walk nearby for dessert.`,
    "Fine Dining": `Dress up for an elegant evening at ${name}. Pair it with cocktails afterward.`,
    Café: `Grab coffee at ${name}, then browse nearby shops or take a stroll.`,
    Bar: `Kick off the night at ${name}, then check out a late-night spot nearby.`,
    Museum: `Explore ${name} together, then grab lunch at a nearby café.`,
    "Art Gallery": `Wander through ${name}, then share impressions over wine nearby.`,
    Park: `Pack a picnic and enjoy ${name}, then find a cozy spot for drinks.`,
    Bowling: `Have fun at ${name}, then grab pizza or burgers after.`,
    Spa: `Relax together at ${name}, then wind down with dinner.`,
  };
  return plans[typeLabel] || `Visit ${name} and explore the surrounding area for a full date experience.`;
}

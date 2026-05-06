// ─── Experience types for filter UI ─────────
export const EXPERIENCE_TYPES = [
  { id: "fine_dining", label: "Fine Dining", icon: "🥂" },
  { id: "casual_food", label: "Casual Food", icon: "🍔" },
  { id: "cafes", label: "Cafes", icon: "☕" },
  { id: "dessert", label: "Dessert", icon: "🍰" },
  { id: "outdoor", label: "Outdoor", icon: "🌿" },
  { id: "indoor", label: "Indoor", icon: "🏠" },
  { id: "active", label: "Active", icon: "🎳" },
  { id: "romantic", label: "Romantic", icon: "💕" },
  { id: "budget", label: "Budget-Friendly", icon: "💰" },
  { id: "unique", label: "Unique", icon: "✨" },
  { id: "nightlife", label: "Nightlife", icon: "🌙" },
] as const;

// ─── Cuisine types for filter UI ────────────
export const CUISINE_TYPES = [
  { id: "chinese", label: "Chinese", icon: "🥡" },
  { id: "korean", label: "Korean", icon: "🍜" },
  { id: "japanese", label: "Japanese", icon: "🍣" },
  { id: "italian", label: "Italian", icon: "🍝" },
  { id: "mexican", label: "Mexican", icon: "🌮" },
  { id: "american", label: "American", icon: "🍟" },
  { id: "indian", label: "Indian", icon: "🍛" },
  { id: "thai", label: "Thai", icon: "🥘" },
  { id: "mediterranean", label: "Mediterranean", icon: "🫒" },
  { id: "seafood", label: "Seafood", icon: "🦐" },
  { id: "bbq", label: "BBQ", icon: "🍖" },
  { id: "vegan", label: "Vegan", icon: "🥗" },
] as const;

// ─── Price level options ────────────────────
export const PRICE_LEVELS = [
  { value: 1, label: "$", description: "Budget" },
  { value: 2, label: "$$", description: "Moderate" },
  { value: 3, label: "$$$", description: "Upscale" },
  { value: 4, label: "$$$$", description: "Fine Dining" },
] as const;

// ─── Vibe options ───────────────────────────
export const VIBE_OPTIONS = [
  { id: "romantic", label: "Romantic", icon: "💘" },
  { id: "fun", label: "Fun", icon: "🎉" },
  { id: "adventurous", label: "Adventurous", icon: "🧗" },
  { id: "lowkey", label: "Low-key", icon: "🌊" },
  { id: "classy", label: "Classy", icon: "🥂" },
  { id: "artsy", label: "Artsy", icon: "🎨" },
] as const;

// ─── Google Places type groups ──────────────
// Maps filter selections to actual Google Places types
export const VENUE_TYPE_MAP: Record<string, string[]> = {
  fine_dining: ["fine_dining_restaurant", "steak_house"],
  casual_food: ["restaurant", "brunch_restaurant", "hamburger_restaurant"],
  cafes: ["cafe", "coffee_shop"],
  dessert: ["bakery", "ice_cream_shop"],
  outdoor: ["park", "garden", "hiking_area", "marina"],
  indoor: ["museum", "art_gallery", "movie_theater"],
  active: ["bowling_alley", "amusement_center", "escape_room", "karaoke"],
  romantic: ["fine_dining_restaurant", "wine_bar", "spa"],
  budget: ["cafe", "park", "restaurant"],
  unique: ["escape_room", "karaoke", "comedy_club", "live_music_venue"],
  nightlife: ["bar", "night_club", "cocktail_bar", "wine_bar"],
};

// All supported venue types for nearby search
export const ALL_VENUE_TYPES = [
  "restaurant", "cafe", "bar", "night_club", "bowling_alley",
  "amusement_center", "movie_theater", "museum", "art_gallery",
  "spa", "park", "performing_arts_theater",
];

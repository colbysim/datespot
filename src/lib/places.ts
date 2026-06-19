// ─── Server-side Google Places API client ───
// This file runs ONLY on the server (API routes).
// The API key never reaches the browser.

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const PLACES_BASE = "https://places.googleapis.com/v1/places";

const SEARCH_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.photos",
  "places.types",
  "places.location",
  "places.primaryType",
  "places.primaryTypeDisplayName",
].join(",");

const DETAIL_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "shortFormattedAddress",
  "rating",
  "userRatingCount",
  "priceLevel",
  "photos",
  "types",
  "location",
  "internationalPhoneNumber",
  "nationalPhoneNumber",
  "websiteUri",
  "primaryType",
  "primaryTypeDisplayName",
  "editorialSummary",
  "googleMapsUri",
  "currentOpeningHours",
  "reviews",
].join(",");

// ─── Photo URL builder ──────────────────────
export function buildPhotoUrl(photoName: string, maxWidth = 600): string {
  return `/api/photo?ref=${encodeURIComponent(photoName)}&maxwidth=${maxWidth}`;
}

// ─── Enrich places with photo URLs ──────────
function enrichPlaces(places: any[]): any[] {
  return (places || []).map((place: any) => ({
    ...place,
    photoUrl: place.photos?.[0]?.name
      ? buildPhotoUrl(place.photos[0].name, 600)
      : null,
    photoUrls: (place.photos || [])
      .slice(0, 5)
      .map((p: any) => buildPhotoUrl(p.name, 600)),
  }));
}

// ─── Single text search call ────────────────
async function textSearch(
  textQuery: string,
  options: {
    maxResults?: number;
    latitude?: number;
    longitude?: number;
    radius?: number;
    priceLevels?: string[];
  } = {}
): Promise<any[]> {
  const body: any = {
    textQuery,
    maxResultCount: options.maxResults || 10,
    languageCode: "en",
  };

  if (options.latitude && options.longitude) {
    body.locationBias = {
      circle: {
        center: {
          latitude: options.latitude,
          longitude: options.longitude,
        },
        radius: options.radius || 24000,
      },
    };
  }

  if (options.priceLevels?.length) {
    body.priceLevels = options.priceLevels;
  }

  try {
    const response = await fetch(`${PLACES_BASE}:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": SEARCH_FIELDS,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`[textSearch] "${textQuery}" failed:`, data.error?.message);
      return [];
    }
    return data.places || [];
  } catch (e: any) {
    console.error(`[textSearch] "${textQuery}" error:`, e.message);
    return [];
  }
}

// ═══════════════════════════════════════════════
//  SMART SEARCH — INTENT DETECTION + QUERY BUILDING
// ═══════════════════════════════════════════════
// Detects whether the user searched for a specific
// topic (cuisine, activity, vibe) or just a city.
// Builds targeted queries accordingly.
// ═══════════════════════════════════════════════

// ─── Topic → targeted search queries ────────
// Each topic maps to multiple specific queries that
// surface interesting, date-worthy spots — not chains.
const TOPIC_QUERIES: Record<string, string[]> = {
  // ── Cuisines ──────────────────────────────
  asian: [
    "best Japanese omakase sushi restaurant",
    "upscale Korean BBQ restaurant",
    "best Thai restaurant authentic",
    "Vietnamese pho banh mi restaurant",
    "Chinese dim sum Sichuan restaurant",
    "Asian fusion chef driven restaurant",
  ],
  japanese: [
    "best omakase sushi restaurant",
    "authentic ramen izakaya",
    "Japanese robatayaki yakitori restaurant",
    "best Japanese restaurant chef driven",
  ],
  sushi: [
    "best omakase sushi bar",
    "upscale sushi restaurant chef driven",
    "Japanese sushi counter high quality",
  ],
  korean: [
    "best Korean BBQ restaurant",
    "Korean fried chicken restaurant",
    "upscale Korean restaurant modern",
    "Korean gastropub date night",
  ],
  thai: [
    "best Thai restaurant authentic",
    "upscale Thai restaurant modern",
    "Thai street food restaurant",
  ],
  chinese: [
    "best Chinese restaurant authentic",
    "dim sum restaurant",
    "Sichuan Cantonese upscale Chinese",
    "Chinese dumpling noodle house",
  ],
  vietnamese: [
    "best Vietnamese pho restaurant",
    "Vietnamese banh mi restaurant",
    "modern Vietnamese restaurant",
  ],
  indian: [
    "best Indian restaurant upscale",
    "modern Indian restaurant chef driven",
    "authentic Indian cuisine fine dining",
  ],
  mexican: [
    "best Mexican restaurant authentic",
    "upscale Mexican restaurant modern",
    "mezcal tequila bar Mexican food",
    "taqueria best tacos authentic",
  ],
  italian: [
    "best Italian restaurant date night",
    "upscale Italian trattoria pasta",
    "Italian wine bar restaurant",
    "authentic Italian fine dining",
  ],
  french: [
    "best French restaurant bistro",
    "French fine dining upscale",
    "French brasserie date night",
  ],
  mediterranean: [
    "best Mediterranean restaurant",
    "Greek restaurant upscale",
    "Turkish Lebanese restaurant",
    "Mediterranean mezze tapas",
  ],
  seafood: [
    "best seafood restaurant upscale",
    "raw bar oyster bar restaurant",
    "fresh seafood market restaurant",
    "seafood fine dining date night",
  ],
  steak: [
    "best steakhouse upscale",
    "fine dining steakhouse date night",
    "modern steakhouse chef driven",
  ],
  bbq: [
    "best BBQ restaurant craft",
    "upscale barbecue smokehouse",
    "BBQ brisket restaurant best",
  ],
  brunch: [
    "best brunch restaurant",
    "upscale brunch spot unique",
    "brunch bottomless mimosa date",
  ],
  pizza: [
    "best pizza neapolitan wood fired",
    "artisan pizza restaurant upscale",
    "best pizza restaurant date night",
  ],
  vegan: [
    "best vegan restaurant upscale",
    "plant based restaurant fine dining",
    "vegan date night restaurant creative",
  ],
  // ── Drinks / Nightlife ────────────────────
  cocktails: [
    "best cocktail bar speakeasy",
    "craft cocktail lounge upscale",
    "hidden speakeasy bar",
    "rooftop cocktail bar",
  ],
  wine: [
    "best wine bar date night",
    "wine bar small plates",
    "wine tasting room upscale",
  ],
  beer: [
    "best craft brewery taproom",
    "brewery date night beer garden",
    "craft beer bar unique",
  ],
  bars: [
    "best cocktail bar speakeasy",
    "rooftop bar lounge",
    "wine bar date night",
    "best bars unique atmosphere",
  ],
  rooftop: [
    "rooftop bar restaurant",
    "rooftop lounge cocktails",
    "rooftop dining date night",
  ],
  speakeasy: [
    "hidden speakeasy bar",
    "secret cocktail bar underground",
    "speakeasy craft cocktails",
  ],
  // ── Activities ────────────────────────────
  outdoor: [
    "scenic park botanical garden waterfront",
    "hiking trail scenic overlook",
    "outdoor date activities nature",
    "rooftop garden patio restaurant",
  ],
  adventure: [
    "escape room immersive experience",
    "rock climbing indoor",
    "axe throwing date",
    "go kart racing indoor",
  ],
  fun: [
    "bowling alley arcade bar",
    "escape room date night",
    "mini golf putt putt",
    "comedy club live show",
  ],
  comedy: [
    "comedy club stand up",
    "improv comedy theater",
    "comedy show date night",
  ],
  music: [
    "live music venue intimate",
    "jazz club live performance",
    "live music bar indie",
    "concert venue small intimate",
  ],
  art: [
    "art gallery contemporary modern",
    "museum date interactive",
    "art exhibition immersive experience",
    "sculpture garden art walk",
  ],
  // ── Vibes ─────────────────────────────────
  romantic: [
    "romantic restaurant date night",
    "candlelit dinner intimate restaurant",
    "wine bar romantic atmosphere",
    "fine dining tasting menu",
  ],
  fancy: [
    "fine dining tasting menu restaurant",
    "upscale restaurant Michelin quality",
    "luxury dining experience",
    "chef table omakase fine dining",
  ],
  cheap: [
    "best cheap eats restaurant",
    "affordable date night restaurant",
    "budget friendly restaurant good food",
    "casual restaurant great reviews affordable",
  ],
  casual: [
    "casual date restaurant great food",
    "laid back restaurant good vibes",
    "casual dining unique atmosphere",
  ],
  unique: [
    "most unique restaurant experience",
    "immersive dining experience",
    "themed restaurant unique",
    "unusual date spot hidden gem",
  ],
  // ── Dessert / Cafe ────────────────────────
  dessert: [
    "best dessert shop patisserie",
    "artisan ice cream gelato shop",
    "bakery pastry shop unique desserts",
  ],
  coffee: [
    "specialty coffee shop third wave roastery",
    "best independent cafe artisan",
    "coffee roaster pour over specialty",
  ],
  cafe: [
    "specialty coffee shop third wave roastery",
    "best independent cafe artisan bakery",
    "cozy cafe pastry shop",
  ],
};

// Keywords that indicate the query has a specific intent
// (not just a city name)
const INTENT_KEYWORDS = Object.keys(TOPIC_QUERIES);

// Common filler words to strip when extracting the city
const FILLER_WORDS = new Set([
  "in", "near", "around", "by", "at", "for",
  "the", "best", "good", "great", "top",
  "date", "night", "spot", "spots", "place", "places",
  "food", "restaurant", "restaurants", "cuisine",
  "me", "my", "nearby", "area",
]);

// ─── Parse query into intent + location ────
interface ParsedQuery {
  intent: string | null;   // matched topic key, or null for city-only
  location: string;        // extracted city/location portion
}

function parseQuery(raw: string): ParsedQuery {
  const lower = raw.toLowerCase().trim();

  // Check for topic matches (longest match first)
  let matchedTopic: string | null = null;
  let matchedKeyword = "";

  for (const keyword of INTENT_KEYWORDS) {
    if (lower.includes(keyword) && keyword.length > matchedKeyword.length) {
      matchedTopic = keyword;
      matchedKeyword = keyword;
    }
  }

  if (!matchedTopic) {
    // No intent detected — treat the whole thing as a city
    return { intent: null, location: raw.trim() };
  }

  // Extract the location by removing the topic keyword and filler words
  const remaining = lower
    .replace(matchedKeyword, "")
    .split(/\s+/)
    .filter((w) => !FILLER_WORDS.has(w) && w.length > 0)
    .join(" ")
    .trim();

  // If nothing remains, the user just typed the topic with no city.
  // We'll let the location bias from geolocation handle it.
  return {
    intent: matchedTopic,
    location: remaining || "",
  };
}

// ─── Broad category queries (city-only search) ──
const BROAD_CATEGORIES = [
  {
    id: "dining",
    queries: [
      "best restaurants date night",
      "romantic dinner fine dining",
    ],
    maxResults: 10,
  },
  {
    id: "cafes",
    queries: [
      "specialty coffee shop third wave roastery",
      "best independent cafe artisan bakery pastry shop",
    ],
    maxResults: 10,
  },
  {
    id: "nightlife",
    queries: [
      "best bars cocktail lounges speakeasy rooftop bar",
      "wine bar live music venue",
    ],
    maxResults: 10,
  },
  {
    id: "activities",
    queries: [
      "fun date activities bowling escape room axe throwing arcade",
      "comedy club karaoke rage room mini golf",
    ],
    maxResults: 10,
  },
  {
    id: "culture",
    queries: [
      "museum art gallery botanical garden scenic park waterfront",
    ],
    maxResults: 6,
  },
];

// Deduplicate by place ID
function deduplicatePlaces(places: any[]): any[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

// ─── Smart search (main entry point) ───────
export async function multiSearchByCity(
  rawQuery: string,
  filters: {
    priceLevels?: number[];
    radiusMiles?: number;
    latitude?: number;
    longitude?: number;
  } = {}
) {
  const radius = Math.min((filters.radiusMiles || 15) * 1609.34, 50000);

  // Map price levels
  const priceMap: Record<number, string> = {
    1: "PRICE_LEVEL_INEXPENSIVE",
    2: "PRICE_LEVEL_MODERATE",
    3: "PRICE_LEVEL_EXPENSIVE",
    4: "PRICE_LEVEL_VERY_EXPENSIVE",
  };
  const priceLevels = (filters.priceLevels || [])
    .map((p) => priceMap[p])
    .filter(Boolean);

  const searchOpts = {
    latitude: filters.latitude,
    longitude: filters.longitude,
    radius,
    priceLevels: priceLevels.length > 0 ? priceLevels : undefined,
  };

  const { intent, location } = parseQuery(rawQuery);

  if (intent && TOPIC_QUERIES[intent]) {
    // ─── FOCUSED SEARCH: user asked for something specific ──
    const topicQueries = TOPIC_QUERIES[intent];
    const locationSuffix = location ? ` in ${location}` : "";

    const allPromises = topicQueries.map((q) =>
      textSearch(`${q}${locationSuffix}`, {
        ...searchOpts,
        maxResults: 10,
      })
    );

    const results = await Promise.all(allPromises);
    return enrichPlaces(deduplicatePlaces(results.flat()));
  }

  // ─── BROAD SEARCH: city-only, use all categories ──
  const allPromises = BROAD_CATEGORIES.flatMap((cat) =>
    cat.queries.map((q) =>
      textSearch(`${q} in ${location}`, {
        ...searchOpts,
        maxResults: cat.maxResults,
      })
    )
  );

  const results = await Promise.all(allPromises);
  return enrichPlaces(deduplicatePlaces(results.flat()));
}

// ─── Nearby multi-search ────────────────────
export async function multiSearchNearby(
  latitude: number,
  longitude: number,
  filters: { radiusMiles?: number } = {}
) {
  const radius = Math.min((filters.radiusMiles || 15) * 1609.34, 50000);

  const searchOpts = { latitude, longitude, radius };

  // Broad nearby queries across all categories
  const queries = [
    "best restaurants for date night",
    "specialty coffee independent cafe artisan bakery",
    "cocktail bars speakeasy rooftop lounge",
    "fun activities bowling escape room arcade",
    "museum art gallery park botanical garden",
  ];

  const results = await Promise.all(
    queries.map((q) =>
      textSearch(`${q} nearby`, { ...searchOpts, maxResults: 8 })
    )
  );

  return enrichPlaces(deduplicatePlaces(results.flat()));
}

// ─── Export parseQuery for use in API routes ──
export { parseQuery };

// ─── Place details (unchanged) ──────────────
export async function getPlaceDetails(placeId: string) {
  const response = await fetch(`${PLACES_BASE}/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": DETAIL_FIELDS,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Google API error");
  }

  const photoUrls = (data.photos || [])
    .slice(0, 8)
    .map((p: any) => buildPhotoUrl(p.name, 800));

  return {
    ...data,
    photoUrl: photoUrls[0] || null,
    photoUrls,
  };
}

// ─── Photo proxy URL (server-side direct) ───
export function getDirectPhotoUrl(
  photoName: string,
  maxWidth = 600
): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${API_KEY}`;
}

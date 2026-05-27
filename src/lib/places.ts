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
//  MULTI-CATEGORY SEARCH
// ═══════════════════════════════════════════════
// Makes 5 parallel targeted API calls to ensure
// variety across dining, cafes, nightlife,
// activities, and unique experiences.
// ═══════════════════════════════════════════════

// The specific queries we fire per category.
// These are tuned to surface date-worthy spots,
// not generic Google results.
const SEARCH_CATEGORIES = [
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
      "unique local cafes bakeries dessert spots",
    ],
    maxResults: 8,
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
] as const;

// Deduplicate by place ID
function deduplicatePlaces(places: any[]): any[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export async function multiSearchByCity(
  city: string,
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

  // Fire all category queries in parallel
  const allPromises = SEARCH_CATEGORIES.flatMap((cat) =>
    cat.queries.map((q) =>
      textSearch(`${q} in ${city}`, {
        ...searchOpts,
        maxResults: cat.maxResults,
      })
    )
  );

  const results = await Promise.all(allPromises);
  const allPlaces = results.flat();

  // Deduplicate and enrich
  return enrichPlaces(deduplicatePlaces(allPlaces));
}

// ─── Nearby multi-search ────────────────────
export async function multiSearchNearby(
  latitude: number,
  longitude: number,
  filters: { radiusMiles?: number } = {}
) {
  const radius = Math.min((filters.radiusMiles || 15) * 1609.34, 50000);

  const searchOpts = { latitude, longitude, radius };

  // Targeted nearby queries
  const queries = [
    "best restaurants for date night",
    "unique cafes bakeries dessert",
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

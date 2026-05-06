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

// ─── Text search (by city query) ────────────
export async function searchByText(
  query: string,
  filters: {
    experiences?: string[];
    cuisines?: string[];
    priceLevels?: number[];
    radiusMiles?: number;
    latitude?: number;
    longitude?: number;
  } = {}
) {
  const radius = Math.min((filters.radiusMiles || 15) * 1609.34, 50000);

  // Build rich search query
  const parts: string[] = [];
  if (filters.experiences?.length) {
    parts.push(...filters.experiences);
  } else {
    parts.push("restaurants", "cafes", "bars", "activities", "things to do");
  }
  if (filters.cuisines?.length) {
    parts.push(...filters.cuisines);
  }
  const searchQuery = `${parts.join(" ")} in ${query}`;

  const body: any = {
    textQuery: searchQuery,
    maxResultCount: 20,
    languageCode: "en",
  };

  if (filters.latitude && filters.longitude) {
    body.locationBias = {
      circle: {
        center: { latitude: filters.latitude, longitude: filters.longitude },
        radius,
      },
    };
  }

  if (filters.priceLevels?.length) {
    const map: Record<number, string> = {
      1: "PRICE_LEVEL_INEXPENSIVE",
      2: "PRICE_LEVEL_MODERATE",
      3: "PRICE_LEVEL_EXPENSIVE",
      4: "PRICE_LEVEL_VERY_EXPENSIVE",
    };
    body.priceLevels = filters.priceLevels
      .map((p) => map[p])
      .filter(Boolean);
  }

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
    throw new Error(data.error?.message || "Google API error");
  }

  return enrichPlaces(data.places);
}

// ─── Nearby search (by coordinates) ─────────
export async function searchNearby(
  latitude: number,
  longitude: number,
  filters: { radiusMiles?: number } = {}
) {
  const radius = Math.min((filters.radiusMiles || 15) * 1609.34, 50000);

  const body = {
    maxResultCount: 20,
    languageCode: "en",
    rankPreference: "POPULARITY",
    locationRestriction: {
      circle: {
        center: { latitude, longitude },
        radius,
      },
    },
    includedTypes: [
      "restaurant",
      "cafe",
      "bar",
      "night_club",
      "bowling_alley",
      "amusement_center",
      "movie_theater",
      "museum",
      "art_gallery",
      "spa",
      "park",
      "performing_arts_theater",
    ],
  };

  const response = await fetch(`${PLACES_BASE}:searchNearby`, {
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
    throw new Error(data.error?.message || "Google API error");
  }

  return enrichPlaces(data.places);
}

// ─── Place details ──────────────────────────
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

  // Enrich photos
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

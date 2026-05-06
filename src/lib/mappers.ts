import type { Place, PlaceDetail, DayHours, Review } from "./types";
import {
  mapPriceLevel,
  getTypeLabel,
  getTypeIcon,
  deriveTags,
  deriveBestFor,
  suggestDatePlan,
} from "./utils";

// ─── Map raw Google Places response → Place ─
export function mapPlace(raw: any): Place {
  const price = mapPriceLevel(raw.priceLevel);
  const types: string[] = raw.types || [];
  const typeLabel = getTypeLabel(types, raw.primaryType);

  return {
    id: raw.id,
    name: raw.displayName?.text || raw.displayName || "Unknown",
    address: raw.formattedAddress || "",
    shortAddress: raw.shortFormattedAddress || raw.formattedAddress || "",
    rating: raw.rating || 0,
    ratingCount: raw.userRatingCount || 0,
    priceLevel: price.level as any,
    priceLevelLabel: price.label,
    primaryType: raw.primaryType || "",
    typeLabel,
    photoUrl: raw.photoUrl || null,
    photoUrls: raw.photoUrls || [],
    lat: raw.location?.latitude || 0,
    lng: raw.location?.longitude || 0,
    types,
    tags: deriveTags(types),
  };
}

// ─── Map raw Google Places detail → PlaceDetail ─
export function mapDetail(raw: any): PlaceDetail {
  const base = mapPlace(raw);

  // Parse opening hours
  const hours: DayHours[] = (
    raw.currentOpeningHours?.weekdayDescriptions || []
  ).map((desc: string) => {
    const [day, ...rest] = desc.split(": ");
    return { day, hours: rest.join(": ") || "Closed" };
  });

  // Parse reviews
  const reviews: Review[] = (raw.reviews || []).slice(0, 5).map((r: any) => ({
    author: r.authorAttribution?.displayName || "Anonymous",
    rating: r.rating || 0,
    text: r.text?.text || "",
    timeAgo: r.relativePublishTimeDescription || "",
    photoUrl: r.authorAttribution?.photoUri || undefined,
  }));

  return {
    ...base,
    description:
      raw.editorialSummary?.text || `A popular ${base.typeLabel.toLowerCase()} in the area.`,
    phone: raw.nationalPhoneNumber || raw.internationalPhoneNumber || null,
    website: raw.websiteUri || null,
    mapsUrl: raw.googleMapsUri || null,
    hours,
    reviews,
    bestFor: deriveBestFor(base.types, base.rating),
    vibeTags: deriveTags(base.types),
    suggestedPlan: suggestDatePlan(base.typeLabel, base.name),
  };
}

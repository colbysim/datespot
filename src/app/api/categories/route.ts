import { NextResponse } from "next/server";

const VENUE_CATEGORIES = {
  Restaurants: [
    "restaurant",
    "steak_house",
    "seafood_restaurant",
    "fine_dining_restaurant",
    "brunch_restaurant",
  ],
  "Cafes & Dessert": ["cafe", "bakery", "ice_cream_shop", "coffee_shop"],
  "Bars & Nightlife": ["bar", "night_club", "wine_bar", "cocktail_bar"],
  Activities: [
    "bowling_alley",
    "amusement_center",
    "escape_room",
    "movie_theater",
    "karaoke",
    "comedy_club",
  ],
  Outdoor: ["park", "garden", "hiking_area", "marina"],
  "Arts & Culture": [
    "museum",
    "art_gallery",
    "performing_arts_theater",
    "live_music_venue",
  ],
  Wellness: ["spa", "wellness_center"],
};

export async function GET() {
  return NextResponse.json(VENUE_CATEGORIES);
}

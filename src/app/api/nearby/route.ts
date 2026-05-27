import { NextRequest, NextResponse } from "next/server";
import { multiSearchNearby } from "@/lib/places";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, filters = {} } = await req.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "latitude and longitude required" },
        { status: 400 }
      );
    }

    const places = await multiSearchNearby(latitude, longitude, filters);
    return NextResponse.json({ places });
  } catch (e: any) {
    console.error("[nearby] Error:", e.message);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 }
    );
  }
}

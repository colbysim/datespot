import { NextRequest, NextResponse } from "next/server";
import { searchByText } from "@/lib/places";

export async function POST(req: NextRequest) {
  try {
    const { query, filters = {} } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 }
      );
    }

    const places = await searchByText(query, filters);
    return NextResponse.json({ places });
  } catch (e: any) {
    console.error("[search] Error:", e.message);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 }
    );
  }
}

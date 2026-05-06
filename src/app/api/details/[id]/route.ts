import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/places";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const details = await getPlaceDetails(id);
    return NextResponse.json(details);
  } catch (e: any) {
    console.error("[details] Error:", e.message);
    return NextResponse.json(
      { error: e.message || "Internal server error" },
      { status: 500 }
    );
  }
}

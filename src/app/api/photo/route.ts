import { NextRequest, NextResponse } from "next/server";
import { getDirectPhotoUrl } from "@/lib/places";

export async function GET(req: NextRequest) {
  try {
    const ref = req.nextUrl.searchParams.get("ref");
    const maxwidth = parseInt(
      req.nextUrl.searchParams.get("maxwidth") || "600"
    );

    if (!ref) {
      return new NextResponse("ref required", { status: 400 });
    }

    const url = getDirectPhotoUrl(ref, maxwidth);
    const response = await fetch(url, { redirect: "follow" });

    if (!response.ok) {
      return new NextResponse("Photo not available", {
        status: response.status,
      });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e: any) {
    console.error("[photo] Error:", e.message);
    return new NextResponse("Error loading photo", { status: 500 });
  }
}

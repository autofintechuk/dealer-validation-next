import { NextRequest, NextResponse } from "next/server";
import { marketplaceAPI } from "@/lib/marketplace-api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");

    console.log("[API] Processing request:", {
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    });

    const dealersResponse = await marketplaceAPI.getDealersWithStats(
      page,
      pageSize
    );
    return NextResponse.json(dealersResponse);
  } catch (error) {
    console.error("[API Error] Failed to fetch dealers:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      headers: Object.fromEntries(request.headers.entries()),
    });

    // Check if it's an authentication error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("Authentication failed") ||
      errorMessage.toLowerCase().includes("auth")
    ) {
      return NextResponse.json(
        { error: "Authentication failed", details: errorMessage },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

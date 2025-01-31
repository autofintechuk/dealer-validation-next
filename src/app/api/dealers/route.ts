import { NextResponse } from "next/server";
import { marketplaceAPI } from "@/lib/marketplace-api/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 100;

    const dealers = await marketplaceAPI.getDealersWithStats(page, pageSize);

    return NextResponse.json(dealers);
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

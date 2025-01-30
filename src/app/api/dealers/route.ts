import { NextRequest, NextResponse } from "next/server";
import { marketplaceAPI } from "@/lib/marketplace-api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");

    console.log(`[API] Fetching dealers: page=${page}, pageSize=${pageSize}`);
    const dealersResponse = await marketplaceAPI.getDealersWithStats(
      page,
      pageSize
    );
    console.log(`[API] Fetched dealers response:`, dealersResponse);

    return NextResponse.json(dealersResponse);
  } catch (error) {
    console.error("[API] Failed to fetch dealers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dealers",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

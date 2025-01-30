import { NextRequest, NextResponse } from "next/server";
import { marketplaceAPI } from "@/lib/marketplace-api";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "100");

    const dealersResponse = await marketplaceAPI.getDealersWithStats(
      page,
      pageSize
    );
    return NextResponse.json(dealersResponse);
  } catch (error) {
    console.error("[API Error] Failed to fetch dealers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

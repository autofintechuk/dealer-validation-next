import { NextRequest, NextResponse } from "next/server";
import { marketplaceAPI } from "@/lib/marketplace-api/server";

type Props = {
  params: { dealerId: string };
};

export async function GET(request: NextRequest, { params }: Props) {
  const { dealerId } = await Promise.resolve(params);

  try {
    if (!dealerId) {
      return NextResponse.json(
        { error: "Dealer ID is required" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 100;

    const vehicles = await marketplaceAPI.getDealerVehicles(
      dealerId,
      page,
      pageSize
    );
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("[API Error] Failed to fetch dealer vehicles:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      dealerId,
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

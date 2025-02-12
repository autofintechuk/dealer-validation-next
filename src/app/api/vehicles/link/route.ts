import { NextRequest, NextResponse } from "next/server";
import { marketCheckAPI } from "@/lib/marketcheck-api/server";

export async function GET(request: NextRequest) {
  const vrm = request.nextUrl.searchParams.get("vrm");

  if (!vrm) {
    return NextResponse.json({ error: "VRM is required" }, { status: 400 });
  }

  try {
    const link = await marketCheckAPI.getVehicleLink(vrm);
    return NextResponse.json({ link });
  } catch (error) {
    console.error("[API Error] Failed to fetch vehicle link:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle link" },
      { status: 500 }
    );
  }
}

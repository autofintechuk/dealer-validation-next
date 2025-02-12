import { NextResponse } from "next/server";
import { marketplaceAPI } from "@/lib/marketplace-api/server";

export async function GET() {
  try {
    const reports = await marketplaceAPI.getDealerReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error("[API Error] Failed to fetch dealer reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch dealer reports" },
      { status: 500 }
    );
  }
}

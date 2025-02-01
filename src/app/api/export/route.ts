import { marketplaceAPI } from "@/lib/marketplace-api/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const dealerId = searchParams.get("dealerId");
    const organizationId = await marketplaceAPI.getOrganizationId();

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    let response;
    let filename;

    switch (type) {
      case "all-vehicles":
        response = await fetch(
          `${process.env.MARKETPLACE_API_URL}/organizations/export/${organizationId}/dealers/vehicles`,
          {
            headers: await marketplaceAPI.getHeaders(),
          }
        );
        filename = "all-vehicles.csv";
        break;

      case "all-dealers":
        response = await fetch(
          `${process.env.MARKETPLACE_API_URL}/organizations/export/${organizationId}/dealers`,
          {
            headers: await marketplaceAPI.getHeaders(),
          }
        );
        filename = "all-dealers.csv";
        break;

      case "dealer-vehicles":
        if (!dealerId) {
          return NextResponse.json(
            { error: "Dealer ID is required" },
            { status: 400 }
          );
        }
        response = await fetch(
          `${process.env.MARKETPLACE_API_URL}/organizations/export/${organizationId}/dealers/${dealerId}/vehicles`,
          {
            headers: await marketplaceAPI.getHeaders(),
          }
        );
        filename = `dealer-${dealerId}-vehicles.csv`;
        break;

      case "vehicles-with-issues":
        const dealers = await marketplaceAPI.getDealersWithStats();
        const vehiclesWithIssues = dealers.flatMap((dealer) => {
          if (!dealer.listingOverview) return [];

          const warnings =
            dealer.listingOverview[
              "Vehicles not advertised due to specific criteria"
            ].warnings;
          const lastSeenIssues =
            dealer.listingOverview[
              "Vehicles not advertised due to last seen time more than 48 hours"
            ].details;

          return [
            ...warnings.map((w) => ({
              dealerName: dealer.dealer.name,
              dealerId: dealer.marketcheckDealerId,
              vehicleId: w.vehicleId,
              issue: w.warningMsg.join("; "),
              type: "criteria",
            })),
            ...lastSeenIssues.map((l) => ({
              dealerName: dealer.dealer.name,
              dealerId: dealer.marketcheckDealerId,
              vehicleId: l.vehicleId,
              issue: `Last seen: ${l.lastSeen}`,
              type: "last_seen",
            })),
          ];
        });

        const csvContent = [
          "Dealer Name,Dealer ID,Vehicle ID,Issue Type,Issue",
          ...vehiclesWithIssues.map(
            (v) =>
              `"${v.dealerName}","${v.dealerId}","${v.vehicleId}","${v.type}","${v.issue}"`
          ),
        ].join("\n");

        return new NextResponse(csvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="vehicles-with-issues.csv"`,
          },
        });

      case "dealer-issues":
        if (!dealerId) {
          return NextResponse.json(
            { error: "Dealer ID is required" },
            { status: 400 }
          );
        }
        const dealerData = await marketplaceAPI.getDealersWithStats();
        const dealer = dealerData.find(
          (d) => d.marketcheckDealerId === dealerId
        );

        if (!dealer || !dealer.listingOverview) {
          return NextResponse.json(
            { error: "Dealer not found or no data available" },
            { status: 404 }
          );
        }

        const dealerIssues = [
          ...dealer.listingOverview[
            "Vehicles not advertised due to specific criteria"
          ].warnings.map((w) => ({
            vehicleId: w.vehicleId,
            issue: w.warningMsg.join("; "),
            type: "criteria",
          })),
          ...dealer.listingOverview[
            "Vehicles not advertised due to last seen time more than 48 hours"
          ].details.map((l) => ({
            vehicleId: l.vehicleId,
            issue: `Last seen: ${l.lastSeen}`,
            type: "last_seen",
          })),
        ];

        const dealerCsvContent = [
          "Vehicle ID,Issue Type,Issue",
          ...dealerIssues.map(
            (v) => `"${v.vehicleId}","${v.type}","${v.issue}"`
          ),
        ].join("\n");

        return new NextResponse(dealerCsvContent, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="dealer-${dealerId}-issues.csv"`,
          },
        });

      default:
        return NextResponse.json(
          { error: "Invalid export type" },
          { status: 400 }
        );
    }

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const csvContent = await response.text();
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[Export API] Error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

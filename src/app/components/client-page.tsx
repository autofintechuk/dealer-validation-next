"use client";

import { type DealerWithStats } from "@/lib/marketplace-api";
import { DealerDetailsModal } from "./dealer-details-modal";
import { useState } from "react";
import { handleLogout } from "../../lib/actions";
import { useDealers, useDealerStats } from "@/lib/hooks/use-queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

function DealersTable({ dealers }: { dealers: DealerWithStats[] }) {
  const [selectedDealer, setSelectedDealer] = useState<DealerWithStats | null>(
    null
  );

  return (
    <>
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold">Dealer Name</TableHead>
              <TableHead className="font-semibold">Website</TableHead>
              <TableHead className="font-semibold">Dealer ID</TableHead>
              <TableHead className="font-semibold">Postcode</TableHead>
              <TableHead className="font-semibold text-right">
                Total Stock
              </TableHead>
              <TableHead className="font-semibold text-right">
                Advertised
              </TableHead>
              <TableHead className="font-semibold text-right">
                Not Advertised
              </TableHead>
              <TableHead className="font-semibold text-right">
                Expired (48h+)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.map((dealer) => (
              <TableRow
                key={dealer.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedDealer(dealer)}
              >
                <TableCell>
                  <div className="font-medium tracking-tight">
                    {dealer.dealer.name || "-"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {dealer.dealer.website || "-"}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {dealer.marketcheckDealerId}
                </TableCell>
                <TableCell>{dealer.dealer.zipcode || "-"}</TableCell>
                <TableCell className="text-right font-medium">
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Total number of stocks in marketcheck"
                      ]
                    : "-"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Total number of vehicles currently advertised"
                      ]
                    : "-"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Vehicles not advertised due to specific criteria"
                      ].count
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="destructive" className="font-medium">
                    {dealer.listingOverview
                      ? dealer.listingOverview[
                          "Vehicles not advertised due to last seen time more than 48 hours"
                        ].count
                      : "0"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedDealer && (
        <DealerDetailsModal
          dealer={selectedDealer}
          onClose={() => setSelectedDealer(null)}
          open={!!selectedDealer}
        />
      )}
    </>
  );
}

export default function ClientPage() {
  const { data: dealers, isLoading, error } = useDealers();
  const { data: stats } = useDealerStats();

  const handleExport = async (type: string, dealerId?: string) => {
    const params = new URLSearchParams({ type });
    if (dealerId) {
      params.append("dealerId", dealerId);
    }

    window.location.href = `/api/export?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 font-medium">Loading dealers...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600 font-medium">
        {error instanceof Error ? error.message : "Failed to fetch dealers"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-3 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Dashboard
          </h1>
          <form action={handleLogout}>
            <button
              type="submit"
              className="text-gray-300 hover:text-white font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-3 py-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                Total Dealers
              </CardTitle>
              <Badge
                variant="outline"
                className="border-gray-700 text-gray-100 font-medium"
              >
                {stats?.totalDealers || 0}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-400 font-normal">
                Managing {stats?.totalVehicles.toLocaleString() || 0} vehicles
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                Total Vehicles
              </CardTitle>
              <Badge
                variant="outline"
                className="border-gray-700 text-gray-100 font-medium"
              >
                {stats?.totalVehicles.toLocaleString() || 0}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-400 font-normal">
                {stats?.advertisedVehicles.toLocaleString() || 0} advertised
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                Not Advertised
              </CardTitle>
              <Badge variant="destructive" className="font-medium">
                {stats?.notAdvertisedVehicles.toLocaleString() || 0}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-400 font-normal">
                Due to criteria issues
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                Not Seen 48h+
              </CardTitle>
              <Badge variant="destructive" className="font-medium">
                {stats?.notAdvertisedDueToLastSeen.toLocaleString() || 0}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-400 font-normal">
                Due to last seen time
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
            onClick={() => handleExport("all-vehicles")}
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Vehicles
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
            onClick={() => handleExport("all-dealers")}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Dealers
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50"
            onClick={() => handleExport("vehicles-with-issues")}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Issues
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">
          Dealer Validation
        </h1>
        <DealersTable dealers={dealers || []} />
      </main>
    </div>
  );
}

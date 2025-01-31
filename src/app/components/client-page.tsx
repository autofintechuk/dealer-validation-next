"use client";

import { type DealerWithStats } from "@/lib/marketplace-api";
import { DealerDetailsModal } from "./dealer-details-modal";
import { useState } from "react";
import { handleLogout } from "../../lib/actions";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function DealersTable({ dealers }: { dealers: DealerWithStats[] }) {
  const [selectedDealer, setSelectedDealer] = useState<DealerWithStats | null>(
    null
  );

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dealer Name</TableHead>
              <TableHead>Dealer ID</TableHead>
              <TableHead>Postcode</TableHead>
              <TableHead>Total Stock</TableHead>
              <TableHead>Advertised</TableHead>
              <TableHead>Not Advertised</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.map((dealer) => (
              <TableRow
                key={dealer.id}
                className="cursor-pointer"
                onClick={() => setSelectedDealer(dealer)}
              >
                <TableCell>
                  <div className="font-medium">{dealer.dealer.name || "-"}</div>
                  <div className="text-sm text-muted-foreground">
                    {dealer.dealer.website}
                  </div>
                </TableCell>
                <TableCell>{dealer.marketcheckDealerId}</TableCell>
                <TableCell>{dealer.dealer.zipcode || "-"}</TableCell>
                <TableCell>
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Total number of stocks in marketcheck"
                      ]
                    : "-"}
                </TableCell>
                <TableCell>
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Total number of vehicles currently advertised"
                      ]
                    : "-"}
                </TableCell>
                <TableCell>
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Vehicles not advertised due to specific criteria"
                      ].count
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      dealer.status === "active" ? "default" : "secondary"
                    }
                  >
                    {dealer.status}
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

async function fetchDealers() {
  const response = await fetch("/api/dealers");
  if (!response.ok) {
    throw new Error("Failed to fetch dealers");
  }
  return response.json();
}

export default function ClientPage() {
  const {
    data: dealers,
    isLoading,
    error,
  } = useQuery<DealerWithStats[]>({
    queryKey: ["dealers"],
    queryFn: fetchDealers,
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading dealers...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error instanceof Error ? error.message : "Failed to fetch dealers"}
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <form action={handleLogout}>
            <button
              type="submit"
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <h1 className="text-2xl font-bold mb-6">Dealer Validation</h1>
        <DealersTable dealers={dealers || []} />
      </main>
    </div>
  );
}

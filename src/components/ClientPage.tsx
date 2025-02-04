"use client";
import React, { useCallback } from "react";
import { useDealers, useDealerStats } from "@/lib/hooks/use-queries";
import { handleLogout } from "@/lib/actions";
import { DealersTable } from "./DealersTable";
import { StatsCardSkeleton } from "@/components/StatsCardSkeleton";
import { TableSkeleton } from "@/components/TableSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ClientPage() {
  const { data: dealers, isLoading, error } = useDealers();
  const { data: stats } = useDealerStats();

  const handleExport = useCallback(async (type: string, dealerId?: string) => {
    const params = new URLSearchParams({ type });
    if (dealerId) params.append("dealerId", dealerId);
    window.location.href = `/api/export?${params.toString()}`;
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-3 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Dealer Validator
            </h1>
            <button
              disabled
              className="text-gray-300 font-medium px-4 py-2 rounded-md bg-gray-800 opacity-50 cursor-not-allowed"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-3 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-full overflow-x-auto flex gap-4 pb-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-32 bg-gray-200 rounded-md animate-pulse"
                />
              ))}
            </div>
          </div>
          <div className="overflow-x-auto -mx-3 px-3">
            <TableSkeleton />
          </div>
        </main>
      </div>
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
            Dealer Validator
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                Managing {stats?.totalVehicles?.toLocaleString() || 0} vehicles
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
                {stats?.totalVehicles?.toLocaleString() || 0}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-400 font-normal">
                {stats?.advertisedVehicles?.toLocaleString() || 0} advertised
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                Not Advertised
              </CardTitle>
              <Badge variant="destructive" className="font-medium">
                {stats?.notAdvertisedVehicles?.toLocaleString() || 0}
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
                {stats?.notAdvertisedDueToLastSeen?.toLocaleString() || 0}
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
          <div className="w-full overflow-x-auto flex gap-4 pb-2">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => handleExport("all-vehicles")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Vehicles
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => handleExport("all-dealers")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Dealers
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
              onClick={() => handleExport("vehicles-with-issues")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Issues
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto -mx-3 px-3">
          <DealersTable dealers={dealers || []} />
        </div>
      </main>
    </div>
  );
}

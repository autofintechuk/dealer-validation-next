import { useQuery } from "@tanstack/react-query";
import type { DealerWithStats, DealerVehicle } from "@/lib/marketplace-api";

async function fetchDealers() {
  const response = await fetch("/api/dealers");
  if (!response.ok) {
    throw new Error("Failed to fetch dealers");
  }
  return response.json();
}

async function fetchDealerVehicles(dealerId: string) {
  const response = await fetch(`/api/dealers/vehicles?dealerId=${dealerId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Failed to fetch vehicles");
  }
  return response.json();
}

export function useDealers() {
  return useQuery<DealerWithStats[]>({
    queryKey: ["dealers"],
    queryFn: fetchDealers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDealerVehicles(dealerId: string, enabled: boolean = true) {
  return useQuery<DealerVehicle[]>({
    queryKey: ["dealer-vehicles", dealerId],
    queryFn: () => fetchDealerVehicles(dealerId),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

interface DealerStats {
  totalDealers: number;
  activeDealers: number;
  totalVehicles: number;
  advertisedVehicles: number;
  notAdvertisedVehicles: number;
  notAdvertisedDueToLastSeen: number;
}

export function useDealerStats() {
  const { data: dealers } = useDealers();

  return useQuery<DealerStats>({
    queryKey: ["dealer-stats"],
    queryFn: () => {
      if (!dealers)
        return {
          totalDealers: 0,
          activeDealers: 0,
          totalVehicles: 0,
          advertisedVehicles: 0,
          notAdvertisedVehicles: 0,
          notAdvertisedDueToLastSeen: 0,
        };

      return {
        totalDealers: dealers.length,
        activeDealers: dealers.filter((d) => d.status === "active").length,
        totalVehicles: dealers.reduce(
          (acc, d) =>
            acc +
            (d.listingOverview?.["Total number of stocks in marketcheck"] || 0),
          0
        ),
        advertisedVehicles: dealers.reduce(
          (acc, d) =>
            acc +
            (d.listingOverview?.[
              "Total number of vehicles currently advertised"
            ] || 0),
          0
        ),
        notAdvertisedVehicles: dealers.reduce(
          (acc, d) =>
            acc +
            (d.listingOverview?.[
              "Vehicles not advertised due to specific criteria"
            ].count || 0),
          0
        ),
        notAdvertisedDueToLastSeen: dealers.reduce(
          (acc, d) =>
            acc +
            (d.listingOverview?.[
              "Vehicles not advertised due to last seen time more than 48 hours"
            ].count || 0),
          0
        ),
      };
    },
    enabled: !!dealers,
  });
}

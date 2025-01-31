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
  const response = await fetch(`/api/dealers/${dealerId}/vehicles`);
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

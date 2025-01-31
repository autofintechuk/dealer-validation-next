"use server";

import type { DealerWithStats, DealerVehiclesResponse } from "./types";
import { marketplaceAPI } from "./server";

export async function getDealersWithStats(
  page = 1,
  pageSize = 100
): Promise<DealerWithStats[]> {
  return marketplaceAPI.getDealersWithStats(page, pageSize);
}

export async function getDealerVehicles(
  dealerId: string,
  page = 1,
  pageSize = 100
): Promise<DealerVehiclesResponse> {
  return marketplaceAPI.getDealerVehicles(dealerId, page, pageSize);
}

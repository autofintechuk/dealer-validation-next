import { env } from "@/env";
import type { MarketCheckVehicleResponse } from "./types";

export class MarketCheckAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = env.MARKETCHECK_API_URL;
    this.apiKey = env.MARKETCHECK_API_KEY;
  }

  async getVehicleLink(vrm: string): Promise<string | null> {
    const response = await fetch(
      `${this.baseUrl}/search/car/uk/active?api_key=${this.apiKey}&vrm=${vrm}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch vehicle link");
    }

    const data: MarketCheckVehicleResponse = await response.json();
    console.log(data.listings[0]?.vdp_url);
    return data.listings[0]?.vdp_url || null;
  }
}

export const marketCheckAPI = new MarketCheckAPI();

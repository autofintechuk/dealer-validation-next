import { env } from "@/env";
import type {
  AuthResponse,
  DealerVehicle,
  DealerWithStats,
  Organization,
  DealerListingStats,
  ListingByDealerResponse,
} from "./types";

export class MarketplaceAPI {
  private baseUrl: string;
  private accessToken: string | null = null;
  private organizationId: string | null = null;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = env.MARKETPLACE_API_URL;
    this.clientId = env.MARKETPLACE_CLIENT_ID;
    this.clientSecret = env.MARKETPLACE_CLIENT_SECRET;
  }

  private async authenticate() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Authentication failed: ${response.status} - ${responseText}`
        );
      }

      const data: AuthResponse = JSON.parse(responseText);
      if (!data.access_token) {
        throw new Error("No access token received");
      }

      this.accessToken = data.access_token;
    } catch (error) {
      console.error("[Marketplace API] Authentication error:", error);
      throw new Error(
        `Authentication failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async getHeaders() {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      if (!this.accessToken) {
        throw new Error("Failed to obtain access token");
      }

      return {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      };
    } catch (error) {
      console.error("[Marketplace API] Headers error:", error);
      throw error;
    }
  }

  async getOrganizationId() {
    if (this.organizationId) return this.organizationId;

    console.log(
      "Fetching organizations from:",
      `${this.baseUrl}/organizations`
    );
    const response = await fetch(`${this.baseUrl}/organizations`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Organizations API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      throw new Error("Failed to fetch organization");
    }

    const data: Organization = await response.json();
    console.log("Organizations API Response:", data);

    if (!data.data.length) {
      throw new Error("No organizations found");
    }

    this.organizationId = data.data[0].id;
    return this.organizationId;
  }

  async getDealers(
    page = 1,
    pageSize = 100
  ): Promise<{
    data: DealerWithStats[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }> {
    const organizationId = await this.getOrganizationId();
    console.log("Organization ID:", organizationId);

    const headers = await this.getHeaders();
    console.log("Request Headers:", headers);

    const url = `${this.baseUrl}/Organizations/${organizationId}/dealers?page=${page}&pageSize=${pageSize}`;
    console.log("Request URL:", url);

    const response = await fetch(url, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Dealers API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      throw new Error("Failed to fetch dealers");
    }

    const data = await response.json();
    console.log("Raw Dealers API Response:", data);
    return data;
  }

  async getDealersWithStats(
    page = 1,
    pageSize = 100
  ): Promise<DealerWithStats[]> {
    try {
      const [dealersResponse, listingResponse] = await Promise.all([
        this.getDealers(page, pageSize),
        this.getListingByDealer(),
      ]);

      const dealerStatsMap = new Map<number, DealerListingStats>(
        listingResponse.dealers.map((d) => [d.dealerId, d])
      );

      const mappedDealers = dealersResponse.data.map((dealer) => {
        const stats = dealerStatsMap.get(Number(dealer.marketcheckDealerId));
        return {
          ...dealer,
          listingOverview: {
            dealerId: Number(dealer.marketcheckDealerId),
            advertisedStockQty: stats?.advertisedStockQty || 0,
            notAdvertisedCriteria: {
              count: stats?.notAdvertisedCriteria.count || 0,
              warnings: stats?.notAdvertisedCriteria.warnings || [],
            },
            notAdvertisedExpired: {
              count: stats?.notAdvertisedExpired.count || 0,
              details: stats?.notAdvertisedExpired.details || [],
            },
            notAdvertisedOther: stats?.notAdvertisedOther || 0,
            stockOver30Days: stats?.stockOver30Days || {
              numberOfAllStock: 0,
              numberOfActiveStock: 0,
            },
            stockOver45Days: stats?.stockOver45Days || {
              numberOfAllStock: 0,
              numberOfActiveStock: 0,
            },
            marketcheckTotalStock: stats?.marketcheckTotalStock || 0,
          },
        };
      });

      return mappedDealers;
    } catch (error) {
      console.error(
        "[Marketplace API] Failed to fetch dealers with stats:",
        error
      );
      throw error;
    }
  }

  private async getListingByDealer(): Promise<ListingByDealerResponse> {
    const response = await fetch(
      `${this.baseUrl}/listingOverview/listing_by_dealer`,
      {
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch listing overview");
    }
    return response.json();
  }

  async getDealerVehicles(
    dealerId: string,
    page = 1,
    pageSize = 100
  ): Promise<DealerVehicle[]> {
    const organizationId = await this.getOrganizationId();
    const headers = await this.getHeaders();

    const response = await fetch(
      `${this.baseUrl}/organizations/${organizationId}/dealers/${dealerId}/vehicles?page=${page}&pageSize=${pageSize}`,
      {
        headers,
      }
    );

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(
        `Failed to fetch dealer vehicles: ${response.status} - ${responseText}`
      );
    }

    return JSON.parse(responseText);
  }
}

export const marketplaceAPI = new MarketplaceAPI();

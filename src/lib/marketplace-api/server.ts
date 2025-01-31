import { env } from "@/env";
import type {
  AuthResponse,
  DealerWithStats,
  DealerVehiclesResponse,
  ListingOverview,
  Organization,
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
      console.log("[Auth] Attempting authentication with:", {
        url: `${this.baseUrl}/auth/token`,
        clientId: this.clientId.slice(0, 4) + "...", // only log first 4 chars for security
      });

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
      console.log("[Auth] Raw response:", responseText);

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
      console.log(
        "[Auth] Successfully authenticated, token:",
        this.accessToken.slice(0, 10) + "..."
      );
    } catch (error) {
      console.error("[Marketplace API] Authentication error:", error);
      throw new Error(
        `Authentication failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  private async getHeaders() {
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

  private async getOrganizationId() {
    if (this.organizationId) return this.organizationId;

    const response = await fetch(`${this.baseUrl}/organizations`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch organization");
    }

    const data: Organization = await response.json();
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
    const response = await fetch(
      `${this.baseUrl}/Organizations/${organizationId}/dealers?page=${page}&pageSize=${pageSize}`,
      {
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch dealers");
    }

    return response.json();
  }

  async getListingOverview(dealerId: string): Promise<ListingOverview> {
    const response = await fetch(
      `${this.baseUrl}/listingOverview/listing_overview/dealer/${dealerId}`,
      {
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch listing overview");
    }

    return response.json();
  }

  async getDealersWithStats(
    page = 1,
    pageSize = 100
  ): Promise<DealerWithStats[]> {
    try {
      const dealersResponse = await this.getDealers(page, pageSize);
      const dealers = dealersResponse.data;

      const dealersWithStats = await Promise.all(
        dealers.map(async (dealer) => {
          try {
            const listingOverview = await this.getListingOverview(
              dealer.marketcheckDealerId
            );
            return { ...dealer, listingOverview };
          } catch (error) {
            console.error(
              `[Marketplace API] Failed to fetch listing overview for dealer ${dealer.marketcheckDealerId}:`,
              error
            );
            return { ...dealer, listingOverview: undefined };
          }
        })
      );
      return dealersWithStats;
    } catch (error) {
      console.error(
        "[Marketplace API] Failed to fetch dealers with stats:",
        error
      );
      throw error;
    }
  }

  async getDealerVehicles(
    dealerId: string,
    page = 1,
    pageSize = 100
  ): Promise<DealerVehiclesResponse> {
    const organizationId = await this.getOrganizationId();
    const headers = await this.getHeaders();

    console.log("[Vehicles] Request details:", {
      url: `${this.baseUrl}/organizations/${organizationId}/dealers/${dealerId}/vehicles?page=${page}&pageSize=${pageSize}`,
      headers: {
        ...headers,
        Authorization: headers.Authorization.slice(0, 15) + "...", // only log start of token
      },
    });

    const response = await fetch(
      `${this.baseUrl}/organizations/${organizationId}/dealers/${dealerId}/vehicles?page=${page}&pageSize=${pageSize}`,
      {
        headers,
      }
    );

    const responseText = await response.text();
    console.log("[Vehicles] Response:", {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch dealer vehicles: ${response.status} - ${responseText}`
      );
    }

    return JSON.parse(responseText);
  }
}

export const marketplaceAPI = new MarketplaceAPI();

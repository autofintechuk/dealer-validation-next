import { config } from "./config";

interface AuthResponse {
  access_token: string;
}

interface Organization {
  data: Array<{
    id: string;
    name: string;
    mode: string;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  }>;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface DealerFinanceServices {
  isActive: boolean;
  activeProviderId: string | null;
  codeWeaversApiKey: string | null;
  codeWeaversDefaultDeposit: number | null;
  autoQuoteUsername: string | null;
  autoQuotePassword: string | null;
  autoQuoteHpGroupId: string | null;
  autoQuotePcpGroupId: string | null;
}

interface DealerMetadata {
  crmFullAccessApiKey: string;
  crmLimitedAccessApiKey: string;
  freeDeliveryRadiusInMiles: number | null;
  fixedDeliveryFee: number | null;
  maxDeliveryRadiusInMiles: number | null;
  representativeExampleText: string | null;
}

interface DealerInfo {
  id: number;
  name: string;
  website: string;
  fcaStatus: string;
  fcaReferenceNumber: string;
  street: string;
  city: string;
  country: string;
  county: string | null;
  zipcode: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
}

interface Dealer {
  id: string;
  marketcheckDealerId: string;
  organizationId: string;
  dealer: DealerInfo;
  metadata: DealerMetadata;
  services: {
    finance: DealerFinanceServices;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DealersResponse {
  data: Dealer[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface VehicleWarning {
  vehicleId: string;
  warningMsg: string[];
}

interface VehicleLastSeen {
  vehicleId: string;
  lastSeen: string;
}

interface StockCount {
  numberOfAllStock: number;
  numberOfActiveStock: number;
}

interface ListingOverview {
  "Total number of stocks in marketcheck": number;
  "Total number of vehicles currently advertised": number;
  "Last data sync time": string;
  "Vehicles not advertised due to specific criteria": {
    count: number;
    warnings: VehicleWarning[];
  };
  "Vehicles not advertised due to last seen time more than 48 hours": {
    count: number;
    details: VehicleLastSeen[];
  };
  "Vehicles not advertised for other reasons": number;
  "Vehicles that have been in stock for over 30 days": StockCount;
  "Vehicles that have been in stock for over 45 days": StockCount;
}

export interface DealerWithStats extends Dealer {
  listingOverview?: ListingOverview;
}

class MarketplaceAPI {
  private baseUrl: string;
  private accessToken: string | null = null;
  private organizationId: string | null = null;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = config.marketplace.apiUrl;
    this.clientId = config.marketplace.clientId;
    this.clientSecret = config.marketplace.clientSecret;

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Missing marketplace API credentials");
    }
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Authentication failed: ${response.status} - ${errorText}`
        );
      }

      const data: AuthResponse = await response.json();
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

  async getDealers(page = 1, pageSize = 100): Promise<DealersResponse> {
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
      const dealersWithStats = await Promise.all(
        dealersResponse.data.map(async (dealer) => {
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
}

export const marketplaceAPI = new MarketplaceAPI();

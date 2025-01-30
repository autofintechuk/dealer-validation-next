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

    console.log("[MarketplaceAPI] Initialized with baseUrl:", this.baseUrl);

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Missing marketplace API credentials");
    }
  }

  private async getHeaders() {
    if (!this.accessToken) {
      await this.authenticate();
    }
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  private async authenticate() {
    console.log("[MarketplaceAPI] Authenticating...");
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
      console.error(
        "[MarketplaceAPI] Authentication failed:",
        response.status,
        response.statusText
      );
      throw new Error("Authentication failed");
    }

    const data: AuthResponse = await response.json();
    this.accessToken = data.access_token;
    console.log("[MarketplaceAPI] Authentication successful");
  }

  private async getOrganizationId() {
    if (this.organizationId) {
      console.log(
        "[MarketplaceAPI] Using cached organization ID:",
        this.organizationId
      );
      return this.organizationId;
    }

    console.log("[MarketplaceAPI] Fetching organization ID...");
    const response = await fetch(`${this.baseUrl}/organizations`, {
      headers: await this.getHeaders(),
    });

    console.log(
      "[MarketplaceAPI] Organizations response status:",
      response.status
    );
    const responseText = await response.text();
    console.log("[MarketplaceAPI] Organizations raw response:", responseText);

    if (!response.ok) {
      console.error(
        "[MarketplaceAPI] Failed to fetch organization:",
        response.status,
        response.statusText
      );
      throw new Error("Failed to fetch organization");
    }

    try {
      const data: Organization = JSON.parse(responseText);

      if (!data.data.length) {
        throw new Error("No organizations found");
      }

      this.organizationId = data.data[0].id;
      console.log(
        "[MarketplaceAPI] Organization ID fetched:",
        this.organizationId
      );
      return this.organizationId;
    } catch (error) {
      console.error(
        "[MarketplaceAPI] Failed to parse organization response:",
        error
      );
      throw new Error("Failed to parse organization response");
    }
  }

  async getDealers(page = 1, pageSize = 100): Promise<DealersResponse> {
    console.log(
      `[MarketplaceAPI] Fetching dealers: page=${page}, pageSize=${pageSize}`
    );
    const organizationId = await this.getOrganizationId();
    console.log("[MarketplaceAPI] Using organization ID:", organizationId);

    const url = `${this.baseUrl}/Organizations/${organizationId}/dealers?page=${page}&pageSize=${pageSize}`;
    console.log("[MarketplaceAPI] Fetching dealers from URL:", url);

    const response = await fetch(url, {
      headers: await this.getHeaders(),
    });

    console.log("[MarketplaceAPI] Dealers response status:", response.status);
    const responseText = await response.text();
    console.log("[MarketplaceAPI] Dealers raw response:", responseText);

    if (!response.ok) {
      console.error(
        "[MarketplaceAPI] Failed to fetch dealers:",
        response.status,
        response.statusText
      );
      throw new Error("Failed to fetch dealers");
    }

    try {
      const data: DealersResponse = JSON.parse(responseText);
      console.log(`[MarketplaceAPI] Fetched ${data.data.length} dealers`);
      return data;
    } catch (error) {
      console.error(
        "[MarketplaceAPI] Failed to parse dealers response:",
        error
      );
      throw new Error("Failed to parse dealers response");
    }
  }

  async getListingOverview(dealerId: string): Promise<ListingOverview> {
    console.log(
      `[MarketplaceAPI] Fetching listing overview for dealer: ${dealerId}`
    );
    const response = await fetch(
      `${this.baseUrl}/listingOverview/listing_overview/dealer/${dealerId}`,
      {
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      console.error(
        "[MarketplaceAPI] Failed to fetch listing overview:",
        response.status,
        response.statusText
      );
      throw new Error("Failed to fetch listing overview");
    }

    const data = await response.json();
    console.log(
      `[MarketplaceAPI] Listing overview fetched for dealer: ${dealerId}`
    );
    return data;
  }

  async getDealersWithStats(
    page = 1,
    pageSize = 100
  ): Promise<DealerWithStats[]> {
    console.log(
      `[MarketplaceAPI] Fetching dealers with stats: page=${page}, pageSize=${pageSize}`
    );
    const dealersResponse = await this.getDealers(page, pageSize);

    console.log("[MarketplaceAPI] Fetching listing overviews in parallel...");
    const dealersWithStats = await Promise.all(
      dealersResponse.data.map(async (dealer) => {
        try {
          const listingOverview = await this.getListingOverview(
            dealer.marketcheckDealerId
          );
          return { ...dealer, listingOverview };
        } catch (error) {
          console.error(
            `[MarketplaceAPI] Failed to fetch listing overview for dealer ${dealer.marketcheckDealerId}:`,
            error
          );
          return { ...dealer, listingOverview: undefined };
        }
      })
    );

    console.log(
      `[MarketplaceAPI] Completed fetching stats for ${dealersWithStats.length} dealers`
    );
    return dealersWithStats;
  }
}

export const marketplaceAPI = new MarketplaceAPI();

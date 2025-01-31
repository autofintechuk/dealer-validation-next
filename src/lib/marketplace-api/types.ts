// Copy all interfaces from marketplace-api.ts
export interface AuthResponse {
  access_token: string;
}

export interface Organization {
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

export interface Location {
  sellerName?: string;
  street: string;
  city: string;
  zip: string;
  county: string | null;
  latitude: number;
  longitude: number;
}

export interface Dealer {
  id: number;
  marketcheckDealerId: string;
  name: string;
  website: string;
  sellerName: string;
  inventoryUrl: string;
  dataSource: string;
  status: string;
  listingCount: string;
  dealerType: string;
  fcaStatus: string;
  fcaReferenceNo: string;
  sellerPhone: string;
  createdAt: string;
  location: Location;
}

export interface VehicleWarning {
  vehicleId: string;
  warningMsg: string[];
}

export interface VehicleLastSeen {
  vehicleId: string;
  lastSeen: string;
}

export interface StockCount {
  numberOfAllStock: number;
  numberOfActiveStock: number;
}

export interface ListingOverview {
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

export interface DealerInfo {
  id: number;
  name: string;
  website: string;
  fcaStatus: string;
  fcaReferenceNumber: string;
  street: string;
  city: string;
  country: string;
  county: string;
  zipcode: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
}

export interface DealerWithStats {
  id: string;
  marketcheckDealerId: string;
  organizationId: string;
  dealer: DealerInfo;
  metadata: {
    crmFullAccessApiKey: string;
    crmLimitedAccessApiKey: string;
    freeDeliveryRadiusInMiles: number;
    fixedDeliveryFee: number;
    maxDeliveryRadiusInMiles: number;
    representativeExampleText: string;
  };
  services: {
    finance: {
      isActive: boolean;
      activeProviderId: string;
      codeWeaversApiKey: string;
      codeWeaversDefaultDeposit: number;
      autoQuoteUsername: string;
      autoQuotePassword: string;
      autoQuoteHpGroupId: string;
      autoQuotePcpGroupId: string;
    };
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  listingOverview?: ListingOverview;
}

export interface VehicleMedia {
  photoLinks?: string[];
  photoLinksCached?: string[];
  s3PhotoLinks?: string[];
}

export interface VehicleBuild {
  year: number;
  make: string;
  variant?: string;
  body_type?: string;
  vehicle_type?: string;
  transmission: string;
  drivetrain?: string;
  fuel_type: string;
  doors?: number;
  cylinders: number;
  std_seating?: number;
  trim?: string;
  engine_size: number;
  model: string;
  highway_mpg?: number;
  city_mpg?: number;
  combined_mpg?: number;
  performance_torque_ftlb?: number;
  performance_maxspeed_mph?: number;
  performance_power_bhp?: number;
  performance_co2?: number;
  euro_status?: string;
}

export interface VehicleFinance {
  id: string;
  RegularPayment: number;
  monthly_price: number;
}

export interface Vehicle {
  id: string;
  vehicleRegistrationMark: string;
  uvcId?: string;
  heading: string;
  price: number;
  priceChangePercent?: number;
  miles: number;
  msrp?: number;
  dataSource?: string;
  vdpUrl: string;
  exteriorColor?: string;
  baseExtColor?: string;
  dom: number;
  dom180: number;
  domActive: number;
  dosActive: number;
  sellerType: string;
  inventoryType: string;
  vehicleRegistrationDate: string;
  vehicleRegistrationYear?: number;
  lastSeenAt: number;
  lastSeenAtDate: string;
  scrapedAt: number;
  scrapedAtDate: string;
  firstSeenAt: number;
  firstSeenAtDate: string;
  firstSeenAtMc: number;
  firstSeenAtMcDate: string;
  firstSeenAtSource: number;
  firstSeenAtSourceDate: string;
  refPrice?: number;
  refPriceDt?: string;
  refMiles?: number;
  refMilesDt?: string;
  isVatIncluded?: boolean;
  source?: string;
  location: Location;
  writeOffCategory?: string;
  media: VehicleMedia;
  dealer: VehicleDealer;
  build: VehicleBuild;
}

export interface VehicleDealer {
  id: string;
  dealer: Dealer;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealerVehicle {
  id: string;
  uniqueId: string;
  vehicle: Vehicle;
  marketcheckDealerId: string;
  status: string;
  autoquote: {
    PCP: VehicleFinance;
    HP: VehicleFinance;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DealerVehiclesResponse {
  data: DealerVehicle[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DealersResponse {
  data: Dealer[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ... rest of the interfaces ...

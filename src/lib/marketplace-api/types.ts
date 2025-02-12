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

export interface DealerListingStats {
  dealerId: number;
  advertisedStockQty: number;
  notAdvertisedCriteria: {
    count: number;
    warnings: VehicleWarning[];
  };
  notAdvertisedExpired: {
    count: number;
    details: VehicleLastSeen[];
  };
  categorizedVehicles: {
    vehicleId: string;
    writeOffCategory: string;
  }[];
  notAdvertisedOther: number;
  stockOver30Days: StockCount;
  stockOver45Days: StockCount;
  marketcheckTotalStock: number;
  DatabaseStock: number;
}

export interface ListingByDealerResponse {
  lastDataSyncTime: string;
  totalAdvertisedStockQty: number;
  totalNotAdvertisedCriteria: number;
  totalNotAdvertisedExpired: number;
  totalNotAdvertisedOther: number;
  totalStockOver30Days: StockCount;
  totalStockOver45Days: StockCount;
  totalMarketcheckStock: number;
  totalDatabaseStock: number;
  dealers: DealerListingStats[];
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

export interface ListingOverview {
  dealerId: number;
  totalDatabaseStock: number;
  advertisedStockQty: number;
  notAdvertisedCriteria: {
    count: number;
    warnings: VehicleWarning[];
  };
  notAdvertisedExpired: {
    count: number;
    details: VehicleLastSeen[];
  };
  notAdvertisedOther: number;
  stockOver30Days: StockCount;
  stockOver45Days: StockCount;
  marketcheckTotalStock: number;
  categorizedVehicles?: {
    vehicleId: string;
    writeOffCategory: string;
  }[];
}

export interface VehicleMedia {
  photoLinks: string[];
  photoLinksCached: string[];
  s3PhotoLinks: string[];
}

export interface VehicleBuild {
  year: number;
  make: string;
  variant: string;
  body_type: string;
  vehicle_type: string;
  transmission: string;
  drivetrain: string;
  fuel_type: string;
  doors: number;
  cylinders: number;
  std_seating: string;
  trim: string;
  engine_size: number;
  model: string;
  highway_mpg: number | null;
  city_mpg: number | null;
  combined_mpg: number;
  performance_torque_ftlb: number;
  performance_maxspeed_mph: number;
  performance_power_bhp: number;
  performance_co2: number;
  euro_status: number;
}

export interface VehicleFinance {
  id: string;
  RegularPayment: number;
  monthly_price: number;
}

export interface Vehicle {
  id: string;
  vehicleRegistrationMark: string;
  uvcId: string;
  heading: string;
  price: number;
  priceChangePercent: number;
  miles: number;
  msrp: number | null;
  dataSource: string;
  vdpUrl: string;
  exteriorColor: string;
  baseExtColor: string;
  dom: number;
  dom180: number;
  domActive: number;
  dosActive: number;
  sellerType: string;
  inventoryType: string;
  vehicleRegistrationDate: string;
  vehicleRegistrationYear: number;
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
  refPrice: number;
  refPriceDt: number;
  refMiles: number;
  refMilesDt: number;
  isVatIncluded: boolean | null;
  source: string;
  carLocation: string | null;
  writeOffCategory: string | null;
  media: VehicleMedia;
  dealer: VehicleDealer;
  build: VehicleBuild;
}

export interface VehicleDealer {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string | null;
  country: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone: string;
}

export interface DealerVehicle {
  _id: string;
  uid: string;
  uniqueId: string;
  marketcheckDealerId: string;
  vehicle: Vehicle;
  status: "active" | "expired";
  createdAt: string;
  updatedAt: string;
  build: VehicleBuild;
  autoquote?: {
    PCP?: VehicleFinance;
    HP?: VehicleFinance;
  };
}

export interface DealerVehicle {
  data: {
    _id: string;
    uid: string;
    uniqueId: string;
    marketcheckDealerId: string;
    vehicle: {
      id: string;
      vehicleRegistrationMark: string;
      uvcId: string;
      heading: string;
      price: number;
      priceChangePercent: number;
      miles: number;
      dataSource: string;
      vdpUrl: string;
      exteriorColor: string;
      baseExtColor: string;
      dom: number;
      dom180: number;
      domActive: number;
      dosActive: number;
      sellerType: string;
      inventoryType: string;
      vehicleRegistrationDate: string;
      vehicleRegistrationYear: number;
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
      refPrice: number;
      refPriceDt: number;
      refMiles: number;
      refMilesDt: number;
      source: string;
      media: {
        photoLinks: Array<string>;
        photoLinksCached: Array<string>;
        s3PhotoLinks: Array<string>;
      };
      dealer: {
        id: number;
        name: string;
        street: string;
        city: string;
        country: string;
        zip: string;
        latitude: number;
        longitude: number;
        phone: string;
      };
      build: {
        year: number;
        make: string;
        variant: string;
        body_type: string;
        vehicle_type: string;
        transmission: string;
        drivetrain: string;
        fuel_type: string;
        doors: number;
        cylinders: number;
        std_seating: string;
        trim: string;
        engine_size: number;
        model: string;
        highway_mpg: number;
        city_mpg: number;
        combined_mpg: number;
        performance_torque_ftlb: number;
        performance_maxspeed_mph: number;
        performance_power_bhp: number;
        performance_co2: number;
        euro_status: number;
      };
    };
    status: string;
    createdAt: string;
    updatedAt: string;
    build: {
      year: number;
      make: string;
      variant: string;
      body_type: string;
      vehicle_type: string;
      transmission: string;
      drivetrain: string;
      fuel_type: string;
      doors: number;
      cylinders: number;
      std_seating: string;
      trim: string;
      engine_size: number;
      model: string;
      highway_mpg: number;
      city_mpg: number;
      combined_mpg: number;
      performance_torque_ftlb: number;
      performance_maxspeed_mph: number;
      performance_power_bhp: number;
      performance_co2: number;
      euro_status: number;
    };
    __v: number;
    autoquote: {
      HP: {
        RegularPayment: number;
        monthly_price: number;
      };
    };
  };
}

export interface DealersResponse {
  data: Dealer[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DealerReport {
  dealerId: string;
  weeklyTarget: number;
  monthlyTarget: number;
  weeklyLeadsSoFar: number;
  monthlyLeadsSoFar: number;
  rollingWeeklyLeads: number;
  rollingMonthlyLeads: number;
  weeklyLeadsRemaining: number;
  monthlyLeadsRemaining: number;
  activeVehicleCount: number;
  lastWeeklyReset: string;
  lastMonthlyReset: string;
  status: string;
}

export interface DealerReportResponse {
  reports: DealerReport[];
  timestamp: string;
}

// ... rest of the interfaces ...

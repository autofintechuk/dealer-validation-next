"use client";

import { type DealerWithStats } from "@/lib/marketplace-api";
import { useState, useMemo, useCallback } from "react";
import { useDealerVehicles } from "@/lib/hooks/use-queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { DealerVehicle } from "@/lib/marketplace-api/types";

interface DealerDetailsModalProps {
  dealer: DealerWithStats;
  onClose: () => void;
  open: boolean;
  defaultTab?: string;
}

interface VehicleIssue {
  vehicleId: string;
  criteria?: string | string[];
  lastSeen?: string;
}

type IssueTableRow = {
  vrm: string;
  issueType: "criteria" | "lastSeen";
  issueDetail: string;
};

type TableRow = {
  getValue: (key: string) => unknown;
};

function VehiclesTableSkeleton() {
  return (
    <div className="bg-white rounded-md border border-gray-200 shadow-sm min-h-[600px]">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>
              <Skeleton className="h-4 w-16" /> {/* VRM */}
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-32" /> {/* Vehicle */}
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" /> {/* Price */}
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" /> {/* Mileage */}
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-16" /> {/* Images */}
            </TableHead>
            <TableHead>
              <Skeleton className="h-4 w-20" /> {/* Status */}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-8 mx-auto" />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Skeleton className="h-5 w-16" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function DealerDetailsModal({
  dealer,
  onClose,
  open,
  defaultTab = "issues",
}: DealerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [activeIssueTab, setActiveIssueTab] = useState<
    "criteria" | "expired" | "writeoff"
  >("criteria");
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [issuesGlobalFilter, setIssuesGlobalFilter] = useState("");

  const {
    data: vehicles = [],
    isLoading,
    error,
  } = useDealerVehicles(dealer.marketcheckDealerId, activeTab === "vehicles");

  // const { data: reportsData } = useDealerReports();
  // const reportsData:any = undefined;
  // const dealerReport = reportsData?.reports.find(
  //   (r) => r.dealerId === dealer.marketcheckDealerId
  // );

  // Memoize vehicle issues transformation
  const vehicleIssues = useMemo(() => {
    const issues = new Map<string, VehicleIssue>();

    // Add criteria warnings
    dealer.listingOverview?.notAdvertisedCriteria?.warnings?.forEach(
      (warning) => {
        issues.set(warning.vehicleId, {
          vehicleId: warning.vehicleId,
          criteria: Array.isArray(warning.warningMsg)
            ? warning.warningMsg.join(", ")
            : warning.warningMsg,
        });
      }
    );

    // Add last seen issues and merge with existing criteria if any
    dealer.listingOverview?.notAdvertisedExpired?.details?.forEach((detail) => {
      const existing = issues.get(detail.vehicleId);
      issues.set(detail.vehicleId, {
        vehicleId: detail.vehicleId,
        criteria: existing?.criteria,
        lastSeen: detail.lastSeen,
      });
    });

    return issues;
  }, [dealer.listingOverview]);

  // Memoize columns definition
  const columns = useMemo<ColumnDef<DealerVehicle>[]>(
    () => [
      {
        id: "vrm",
        accessorFn: (row) => row.vehicle.vehicleRegistrationMark,
        header: "VRM",
        cell: ({ row }) => (
          <div className="font-mono text-sm whitespace-nowrap">
            {row.original.vehicle.vehicleRegistrationMark}
          </div>
        ),
      },
      {
        id: "vehicle",
        accessorFn: (row) => ({
          make: row.vehicle.build.make,
          model: row.vehicle.build.model,
          variant: row.vehicle.build.variant,
          year: row.vehicle.build.year,
        }),
        header: "Vehicle",
        cell: ({ row }) => (
          <div>
            <div className="font-medium tracking-tight whitespace-nowrap">
              {row.original.vehicle.build.make}{" "}
              {row.original.vehicle.build.model}
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {row.original.vehicle.build.year} •{" "}
              {row.original.vehicle.build.variant}
            </div>
          </div>
        ),
      },
      {
        id: "price",
        accessorFn: (row) => row.vehicle.price,
        header: () => <div className="text-right">Price</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium whitespace-nowrap">
            £{row.original.vehicle.price.toLocaleString()}
          </div>
        ),
      },
      {
        id: "miles",
        accessorFn: (row) => row.vehicle.miles,
        header: () => <div className="text-right">Mileage</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium whitespace-nowrap">
            {row.original.vehicle.miles.toLocaleString()}
          </div>
        ),
      },
      {
        id: "images",
        accessorFn: (row) => row.vehicle.media.photoLinks?.length || 0,
        header: () => <div className="text-center">Images</div>,
        cell: ({ row }) => {
          const imageCount = row.original.vehicle.media.photoLinks?.length || 0;
          const hasEnoughImages = imageCount >= 5;
          return (
            <div className="text-center whitespace-nowrap">
              <Badge
                variant={hasEnoughImages ? "outline" : "destructive"}
                className="font-medium"
              >
                {imageCount}
              </Badge>
            </div>
          );
        },
      },
      {
        id: "status",
        accessorFn: (row) => row.status,
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.status === "active";
          const lastSeenDays = Math.floor(
            (Date.now() -
              new Date(row.original.vehicle.lastSeenAtDate).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const hasLastSeenIssue = lastSeenDays > 2;

          return (
            <div className="space-y-1 whitespace-nowrap">
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="font-medium"
              >
                {row.original.status}
              </Badge>
              {hasLastSeenIssue && (
                <Badge variant="destructive" className="font-medium">
                  Not seen {lastSeenDays}d
                </Badge>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // Memoize issue columns definition
  const issueColumns = useMemo<ColumnDef<IssueTableRow>[]>(
    () => [
      {
        id: "vrm",
        accessorKey: "vrm",
        header: "VRM",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{row.getValue("vrm")}</span>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                const vrm = row.getValue("vrm") as string;
                const response = await fetch(`/api/vehicles/link?vrm=${vrm}`);
                if (!response.ok) return;
                const { link } = await response.json();
                if (link) window.open(link, "_blank", "noopener,noreferrer");
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        ),
      },
      {
        id: "issueType",
        accessorKey: "issueType",
        header: "Issue Type",
        cell: ({ row }) => (
          <Badge
            variant={
              row.getValue("issueType") === "criteria"
                ? "destructive"
                : "secondary"
            }
            className="font-medium whitespace-nowrap"
          >
            {row.getValue("issueType") === "criteria" ? "Criteria" : "Expired"}
          </Badge>
        ),
      },
      {
        id: "issueDetail",
        accessorKey: "issueDetail",
        header: "Issue Detail",
        cell: ({ row }) => (
          <div className="whitespace-nowrap">{row.getValue("issueDetail")}</div>
        ),
      },
    ],
    []
  );

  // Memoize global filter function
  const globalFilterFn = useCallback(
    (row: TableRow, _columnId: string, filterValue: string) => {
      const searchValue = filterValue.toLowerCase();
      const vrm = String(row.getValue("vrm")).toLowerCase();
      const vehicle = row.getValue("vehicle") as {
        make: string;
        model: string;
        variant: string;
        year: number;
      };
      const vehicleText =
        `${vehicle.make} ${vehicle.model} ${vehicle.variant}`.toLowerCase();

      return vrm.includes(searchValue) || vehicleText.includes(searchValue);
    },
    []
  );

  // Memoize issues filter function
  const issuesFilterFn = useCallback(
    (row: TableRow, _columnId: string, filterValue: string) => {
      const searchValue = filterValue.toLowerCase();
      const vrm = String(row.getValue("vrm")).toLowerCase();
      return vrm.includes(searchValue);
    },
    []
  );

  // Memoize issue rows transformation
  const issueRows = useMemo<IssueTableRow[]>(
    () =>
      Array.from(vehicleIssues.values()).flatMap((issue) => {
        const rows: IssueTableRow[] = [];

        if (issue.criteria) {
          rows.push({
            vrm: issue.vehicleId,
            issueType: "criteria",
            issueDetail: Array.isArray(issue.criteria)
              ? issue.criteria.join(", ")
              : issue.criteria,
          });
        }

        if (issue.lastSeen) {
          rows.push({
            vrm: issue.vehicleId,
            issueType: "lastSeen",
            issueDetail: `Last seen: ${new Date(
              issue.lastSeen
            ).toLocaleString()}`,
          });
        }

        return rows;
      }),
    [vehicleIssues]
  );

  // Update filteredIssueRows only for the issues table (not used for writeoff)
  const filteredIssueRows = useMemo(() => {
    if (activeIssueTab === "writeoff") return issueRows;
    return issueRows.filter((row) =>
      activeIssueTab === "criteria"
        ? row.issueType === "criteria"
        : row.issueType === "lastSeen"
    );
  }, [issueRows, activeIssueTab]);

  // Create table instances outside of memo
  const tableInstance = useReactTable({
    data: vehicles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
  });

  // Create the issues table instance only for non-writeoff cases
  const issuesTableInstance = useReactTable({
    data: activeIssueTab !== "writeoff" ? filteredIssueRows : [],
    columns: issueColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: issuesGlobalFilter,
    },
    onGlobalFilterChange: setIssuesGlobalFilter,
    globalFilterFn: issuesFilterFn,
  });

  // Memoize table instances
  const table = useMemo(() => tableInstance, [tableInstance]);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      router.push(`?dealer=${dealer.marketcheckDealerId}&tab=${tab}`);
    },
    [dealer.marketcheckDealerId, router]
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] bg-gray-50 p-0 w-[95vw]">
        <div className="h-full overflow-y-auto">
          <DialogHeader className="px-4 sm:px-6 py-4 bg-gray-900 text-white border-b border-gray-800">
            <DialogTitle className="text-xl font-semibold tracking-tight flex items-center gap-2">
              {dealer.dealer.name}
              {dealer.dealer.website && (
                <button
                  onClick={() =>
                    window.open(
                      `https://${dealer.dealer.website}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </DialogTitle>
            <div className="text-sm font-normal text-gray-400 mt-1">
              {dealer.dealer.street}, {dealer.dealer.city},{" "}
              {dealer.dealer.zipcode}
            </div>
          </DialogHeader>

          <div className="px-6 pt-6">
            <div className="flex gap-4">
              <Button
                onClick={() => handleTabChange("issues")}
                variant={activeTab === "issues" ? "default" : "secondary"}
                className={`font-medium transition-colors ${
                  activeTab === "issues"
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "hover:bg-gray-200"
                }`}
              >
                Issues
              </Button>
              <Button
                onClick={() => handleTabChange("reports")}
                variant={activeTab === "reports" ? "default" : "secondary"}
                className={`font-medium transition-colors ${
                  activeTab === "reports"
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "hover:bg-gray-200"
                }`}
              >
                Reports
              </Button>

              <Button
                onClick={() => handleTabChange("vehicles")}
                variant={activeTab === "vehicles" ? "default" : "secondary"}
                className={`font-medium transition-colors ${
                  activeTab === "vehicles"
                    ? "bg-gray-800 text-white hover:bg-gray-700"
                    : "hover:bg-gray-200"
                }`}
              >
                All Vehicles
              </Button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === "issues" && (
              <>
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                        Total Stock(MC)
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="border-gray-700 text-gray-100 font-medium"
                      >
                        {dealer.listingOverview?.marketcheckTotalStock || 0}
                      </Badge>
                      <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                        Total Stock(DB)
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="border-gray-700 text-gray-100 font-medium"
                      >
                        {dealer.listingOverview?.totalDatabaseStock || 0}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-100">
                        Currently advertising:
                      </div>
                      <Badge
                        variant="outline"
                        className="border-gray-700 text-gray-100 font-medium"
                      >
                        {dealer.listingOverview?.advertisedStockQty || 0}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                        Vehicles with Issues
                      </CardTitle>
                      <Badge variant="destructive" className="font-medium">
                        {dealer.listingOverview?.notAdvertisedCriteria.count ||
                          0}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-100">
                        Not seen in 48h+:
                      </div>
                      <Badge variant="destructive" className="font-medium">
                        {dealer.listingOverview?.notAdvertisedExpired.count ||
                          0}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                    onClick={() => {
                      const params = new URLSearchParams({
                        type: "dealer-vehicles",
                        dealerId: dealer.marketcheckDealerId,
                      });
                      window.location.href = `/api/export?${params.toString()}`;
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export All Vehicles
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-700 hover:text-gray-900 border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                    onClick={() => {
                      const params = new URLSearchParams({
                        type: "dealer-issues",
                        dealerId: dealer.marketcheckDealerId,
                      });
                      window.location.href = `/api/export?${params.toString()}`;
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Issues
                  </Button>
                </div>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setActiveIssueTab("criteria")}
                    className={`font-medium px-4 py-2 rounded ${
                      activeIssueTab === "criteria"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Criteria
                  </button>
                  <button
                    onClick={() => setActiveIssueTab("expired")}
                    className={`font-medium px-4 py-2 rounded ${
                      activeIssueTab === "expired"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Expired
                  </button>
                  <button
                    onClick={() => setActiveIssueTab("writeoff")}
                    className={`font-medium px-4 py-2 rounded ${
                      activeIssueTab === "writeoff"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Writeoff
                  </button>
                </div>
                {activeIssueTab === "writeoff" ? (
                  <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-semibold tracking-tight">
                        Writeoff Category Vehicles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              <TableHead>Vehicle ID</TableHead>
                              <TableHead>Category</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dealer.listingOverview?.categorizedVehicles?.map(
                              (vehicle) => (
                                <TableRow key={vehicle.vehicleId}>
                                  <TableCell>{vehicle.vehicleId}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="secondary"
                                      className="font-medium"
                                    >
                                      CAT {vehicle.writeOffCategory}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-gray-200">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-semibold tracking-tight">
                        Vehicle Issues
                      </CardTitle>
                      <div className="relative max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search VRM..."
                          value={issuesGlobalFilter}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setIssuesGlobalFilter(e.target.value)
                          }
                          className="pl-8 w-[200px]"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-gray-50">
                            <TableRow>
                              {issuesTableInstance
                                ?.getHeaderGroups()
                                .map((headerGroup) =>
                                  headerGroup.headers.map((header) => (
                                    <TableHead
                                      key={header.id}
                                      className="font-semibold whitespace-nowrap"
                                    >
                                      {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                    </TableHead>
                                  ))
                                )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {issuesTableInstance
                              ?.getRowModel()
                              .rows.map((row) => (
                                <TableRow
                                  key={row.id}
                                  className="hover:bg-gray-50"
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
            {activeTab === "vehicles" && (
              <>
                {isLoading ? (
                  <VehiclesTableSkeleton />
                ) : error ? (
                  <div className="bg-white rounded-md border border-gray-200 shadow-sm min-h-[600px] flex items-center justify-center">
                    <div className="text-red-600 font-medium">
                      {error instanceof Error
                        ? error.message
                        : "Failed to fetch vehicles"}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search VRM or vehicle..."
                          value={globalFilter}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setGlobalFilter(e.target.value)
                          }
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm min-h-[600px] overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            {table.getHeaderGroups().map((headerGroup) =>
                              headerGroup.headers.map((header) => (
                                <TableHead
                                  key={header.id}
                                  className="font-semibold whitespace-nowrap"
                                >
                                  {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                      )}
                                </TableHead>
                              ))
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              className={cn(
                                "hover:bg-gray-50",
                                row.original.status !== "active" &&
                                  "bg-gray-50/50"
                              )}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </>
            )}
            {/* {activeTab === "reports" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-medium">
                        {dealerReport?.weeklyTarget || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leads So Far:</span>
                      <span className="font-medium">
                        {dealerReport?.weeklyLeadsSoFar || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rolling Leads:</span>
                      <span className="font-medium">
                        {dealerReport?.rollingWeeklyLeads || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="font-medium">
                        {dealerReport?.weeklyLeadsRemaining || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Reset:</span>
                      <span className="font-medium">
                        {dealerReport?.lastWeeklyReset
                          ? new Date(
                              dealerReport.lastWeeklyReset
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-medium">
                        {dealerReport?.monthlyTarget || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leads So Far:</span>
                      <span className="font-medium">
                        {dealerReport?.monthlyLeadsSoFar || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rolling Leads:</span>
                      <span className="font-medium">
                        {dealerReport?.rollingMonthlyLeads || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining:</span>
                      <span className="font-medium">
                        {dealerReport?.monthlyLeadsRemaining || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Reset:</span>
                      <span className="font-medium">
                        {dealerReport?.lastMonthlyReset
                          ? new Date(
                              dealerReport.lastMonthlyReset
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

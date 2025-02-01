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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Download } from "lucide-react";
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
  criteria?: string[];
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
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [issuesGlobalFilter, setIssuesGlobalFilter] = useState("");

  const {
    data: vehicles = [],
    isLoading,
    error,
  } = useDealerVehicles(dealer.marketcheckDealerId, activeTab === "vehicles");

  // Memoize vehicle issues transformation
  const vehicleIssues = useMemo(() => {
    const issues = new Map<string, VehicleIssue>();

    // Add criteria warnings
    dealer.listingOverview?.[
      "Vehicles not advertised due to specific criteria"
    ].warnings?.forEach((warning) => {
      issues.set(warning.vehicleId, {
        vehicleId: warning.vehicleId,
        criteria: warning.warningMsg,
      });
    });

    // Add last seen issues and merge with existing criteria if any
    dealer.listingOverview?.[
      "Vehicles not advertised due to last seen time more than 48 hours"
    ].details?.forEach((detail) => {
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
          <div className="font-mono text-sm whitespace-nowrap">
            {row.getValue("vrm")}
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
            issueDetail: issue.criteria.join(", "),
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

  const issuesTableInstance = useReactTable({
    data: issueRows,
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
  const issuesTable = useMemo(() => issuesTableInstance, [issuesTableInstance]);

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      router.push(`?dealer=${dealer.marketcheckDealerId}&tab=${tab}`);
    },
    [dealer.marketcheckDealerId, router]
  );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50 p-0 w-[95vw]">
        <DialogHeader className="px-4 sm:px-6 py-4 bg-gray-900 text-white border-b border-gray-800">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {dealer.dealer.name}
            <div className="text-sm font-normal text-gray-400 mt-1">
              {dealer.dealer.street}, {dealer.dealer.city},{" "}
              {dealer.dealer.zipcode}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="px-4 sm:px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="issues" className="font-medium">
                Issues
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="font-medium">
                All Vehicles
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="issues" className="space-y-4 mt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                      Total Vehicle Stock
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-gray-700 text-gray-100 font-medium"
                    >
                      {dealer.listingOverview?.[
                        "Total number of stocks in marketcheck"
                      ] || 0}
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
                      {dealer.listingOverview?.[
                        "Total number of vehicles currently advertised"
                      ] || 0}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-100 tracking-tight">
                      Vehicles with Issues
                    </CardTitle>
                    <Badge variant="destructive" className="font-medium">
                      {dealer.listingOverview?.[
                        "Vehicles not advertised due to specific criteria"
                      ].count || 0}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-100">
                      Not seen in 48h+:
                    </div>
                    <Badge variant="destructive" className="font-medium">
                      {dealer.listingOverview?.[
                        "Vehicles not advertised due to last seen time more than 48 hours"
                      ].count || 0}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center gap-4 overflow-x-auto pb-2">
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
                          {issuesTable.getHeaderGroups().map((headerGroup) =>
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
                        {issuesTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} className="hover:bg-gray-50">
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
            </TabsContent>

            <TabsContent value="vehicles" className="mt-0">
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
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

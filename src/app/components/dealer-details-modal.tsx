"use client";

import {
  type DealerWithStats,
  type DealerVehicle,
} from "@/lib/marketplace-api";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

interface DealerDetailsModalProps {
  dealer: DealerWithStats;
  onClose: () => void;
  open: boolean;
}

interface VehicleIssue {
  vehicleId: string;
  criteria?: string[];
  lastSeen?: string;
}

export function DealerDetailsModal({
  dealer,
  onClose,
  open,
}: DealerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("issues");

  const {
    data: vehicles = [],
    isLoading,
    error,
  } = useDealerVehicles(dealer.marketcheckDealerId, activeTab === "vehicles");

  // Aggregate issues by vehicle ID
  const vehicleIssues = new Map<string, VehicleIssue>();

  // Add criteria warnings
  dealer.listingOverview?.[
    "Vehicles not advertised due to specific criteria"
  ].warnings?.forEach((warning) => {
    vehicleIssues.set(warning.vehicleId, {
      vehicleId: warning.vehicleId,
      criteria: warning.warningMsg,
    });
  });

  // Add last seen issues and merge with existing criteria if any
  dealer.listingOverview?.[
    "Vehicles not advertised due to last seen time more than 48 hours"
  ].details?.forEach((detail) => {
    const existing = vehicleIssues.get(detail.vehicleId);
    vehicleIssues.set(detail.vehicleId, {
      vehicleId: detail.vehicleId,
      criteria: existing?.criteria,
      lastSeen: detail.lastSeen,
    });
  });

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gray-50 p-0">
        <DialogHeader className="px-6 py-4 bg-gray-900 text-white border-b border-gray-800">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {dealer.dealer.name}
            <div className="text-sm font-normal text-gray-400 mt-1">
              {dealer.dealer.street}, {dealer.dealer.city},{" "}
              {dealer.dealer.zipcode}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger value="issues" className="font-medium">
                Issues
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="font-medium">
                All Vehicles
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
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

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold tracking-tight">
                    Vehicle Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(vehicleIssues.values()).map((issue) => (
                      <div
                        key={issue.vehicleId}
                        className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <p className="font-medium tracking-tight">
                          {issue.vehicleId}
                        </p>
                        <div className="space-y-2 mt-2">
                          {issue.criteria && (
                            <Badge
                              variant="destructive"
                              className="font-medium"
                            >
                              {issue.criteria.join(", ")}
                            </Badge>
                          )}
                          {issue.lastSeen && (
                            <Badge variant="secondary" className="font-medium">
                              Last seen:{" "}
                              {new Date(issue.lastSeen).toLocaleString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles" className="mt-0">
              {isLoading ? (
                <div className="text-center py-8 text-gray-600 font-medium">
                  Loading vehicles...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 font-medium">
                  {error instanceof Error
                    ? error.message
                    : "Failed to fetch vehicles"}
                </div>
              ) : (
                <div className="bg-white rounded-md border border-gray-200 shadow-sm">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">VRM</TableHead>
                        <TableHead className="font-semibold">Vehicle</TableHead>
                        <TableHead className="font-semibold text-right">
                          Price
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Mileage
                        </TableHead>
                        <TableHead className="font-semibold text-center">
                          Images
                        </TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle) => {
                        const imageCount =
                          vehicle.vehicle.media.photoLinks?.length || 0;
                        const hasEnoughImages = imageCount >= 5;
                        const isActive = vehicle.status === "active";
                        const lastSeenDays = Math.floor(
                          (Date.now() -
                            new Date(
                              vehicle.vehicle.lastSeenAtDate
                            ).getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        const hasLastSeenIssue = lastSeenDays > 2;

                        return (
                          <TableRow
                            key={vehicle._id}
                            className={cn(
                              "hover:bg-gray-50",
                              !isActive && "bg-gray-50/50"
                            )}
                          >
                            <TableCell className="font-mono text-sm">
                              {vehicle.vehicle.vehicleRegistrationMark}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium tracking-tight">
                                {vehicle.vehicle.build.make}{" "}
                                {vehicle.vehicle.build.model}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle.vehicle.build.year} •{" "}
                                {vehicle.vehicle.build.variant}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              £{vehicle.vehicle.price.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {vehicle.vehicle.miles.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  hasEnoughImages ? "outline" : "destructive"
                                }
                                className="font-medium"
                              >
                                {imageCount}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge
                                  variant={isActive ? "default" : "secondary"}
                                  className="font-medium"
                                >
                                  {vehicle.status}
                                </Badge>
                                {hasLastSeenIssue && (
                                  <Badge
                                    variant="destructive"
                                    className="font-medium"
                                  >
                                    Not seen {lastSeenDays}d
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

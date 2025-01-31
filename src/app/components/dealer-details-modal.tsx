"use client";

import { type DealerWithStats } from "@/lib/marketplace-api";
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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dealer.dealer.name} - Vehicle Details</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="vehicles">All Vehicles</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p>
                      Total Stock:{" "}
                      {dealer.listingOverview?.[
                        "Total number of stocks in marketcheck"
                      ] || 0}
                    </p>
                    <p>
                      Currently Advertised:{" "}
                      {dealer.listingOverview?.[
                        "Total number of vehicles currently advertised"
                      ] || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      Not Advertised (Criteria):{" "}
                      {dealer.listingOverview?.[
                        "Vehicles not advertised due to specific criteria"
                      ].count || 0}
                    </p>
                    <p>
                      Not Advertised (48h):{" "}
                      {dealer.listingOverview?.[
                        "Vehicles not advertised due to last seen time more than 48 hours"
                      ].count || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(vehicleIssues.values()).map((issue) => (
                    <div
                      key={issue.vehicleId}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <p className="font-medium">{issue.vehicleId}</p>
                      <div className="space-y-2 mt-2">
                        {issue.criteria && (
                          <Badge variant="destructive" className="mr-2">
                            {issue.criteria.join(", ")}
                          </Badge>
                        )}
                        {issue.lastSeen && (
                          <Badge variant="secondary">
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

          <TabsContent value="vehicles">
            {isLoading ? (
              <div className="text-center py-4">Loading vehicles...</div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Failed to fetch vehicles"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>VRM</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Mileage</TableHead>
                    <TableHead className="text-center">Images</TableHead>
                    <TableHead>Status</TableHead>
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
                        new Date(vehicle.vehicle.lastSeenAtDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    const hasLastSeenIssue = lastSeenDays > 2;

                    return (
                      <TableRow
                        key={vehicle._id}
                        className={cn(
                          "cursor-pointer",
                          !isActive && "bg-muted/50"
                        )}
                      >
                        <TableCell className="font-medium">
                          {vehicle.vehicle.vehicleRegistrationMark}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {vehicle.vehicle.build.make}{" "}
                            {vehicle.vehicle.build.model}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.vehicle.build.year} •{" "}
                            {vehicle.vehicle.build.variant}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">
                            £{vehicle.vehicle.price.toLocaleString()}
                          </div>
                          {vehicle.vehicle.priceChangePercent !== 0 &&
                            vehicle.vehicle.priceChangePercent !== null && (
                              <div
                                className={cn(
                                  "text-sm",
                                  vehicle.vehicle.priceChangePercent > 0
                                    ? "text-red-500"
                                    : "text-green-500"
                                )}
                              >
                                {vehicle.vehicle.priceChangePercent > 0
                                  ? "+"
                                  : ""}
                                {vehicle.vehicle.priceChangePercent.toFixed(1)}%
                              </div>
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                          {vehicle.vehicle.miles.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              hasEnoughImages ? "outline" : "destructive"
                            }
                          >
                            {imageCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={isActive ? "default" : "secondary"}>
                              {vehicle.status}
                            </Badge>
                            {hasLastSeenIssue && (
                              <Badge variant="destructive" className="ml-1">
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
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

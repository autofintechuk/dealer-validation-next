"use client";

import {
  type DealerWithStats,
  type DealerVehicle,
} from "@/lib/marketplace-api";
import { useState, useEffect } from "react";
import { getDealerVehicles } from "@/lib/marketplace-api/actions";
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
  const [vehicles, setVehicles] = useState<DealerVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchVehicles() {
      if (activeTab === "vehicles") {
        setLoading(true);
        setError(null);
        try {
          const response = await getDealerVehicles(dealer.marketcheckDealerId);
          setVehicles(response.data);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch vehicles"
          );
        } finally {
          setLoading(false);
        }
      }
    }

    fetchVehicles();
  }, [activeTab, dealer.marketcheckDealerId]);

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
            {loading ? (
              <div className="text-center py-4">Loading vehicles...</div>
            ) : error ? (
              <div className="text-center py-4 text-destructive">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg</TableHead>
                    <TableHead>Make/Model</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Miles</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        {vehicle.vehicle.vehicleRegistrationMark}
                      </TableCell>
                      <TableCell>
                        {vehicle.vehicle.build.make}{" "}
                        {vehicle.vehicle.build.model}
                      </TableCell>
                      <TableCell>
                        £{vehicle.vehicle.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {vehicle.vehicle.miles.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            vehicle.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {vehicle.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

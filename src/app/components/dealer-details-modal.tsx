"use client";

import { type DealerWithStats } from "@/lib/marketplace-api";

interface DealerDetailsModalProps {
  dealer: DealerWithStats;
  onClose: () => void;
}

interface VehicleIssue {
  vehicleId: string;
  criteria?: string[];
  lastSeen?: string;
}

export function DealerDetailsModal({
  dealer,
  onClose,
}: DealerDetailsModalProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {dealer.dealer.name} - Not Advertised Vehicles
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-900">
              <div>
                <p className="mb-1">
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
              <div>
                <p className="mb-1">
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
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Vehicle Details</h3>
            <div className="divide-y divide-gray-200">
              {Array.from(vehicleIssues.values()).map((issue) => (
                <div key={issue.vehicleId} className="py-3">
                  <p className="font-medium text-gray-900">{issue.vehicleId}</p>
                  <div className="space-y-1 mt-1">
                    {issue.criteria && (
                      <p className="text-sm text-red-600">
                        Reason: {issue.criteria.join(", ")}
                      </p>
                    )}
                    {issue.lastSeen && (
                      <p className="text-sm text-orange-600">
                        Last seen: {new Date(issue.lastSeen).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { type DealerWithStats } from "@/lib/marketplace-api";
import { DealerDetailsModal } from "./components/dealer-details-modal";
import { useState } from "react";
import { handleLogout } from "./actions";

function DealersTable({ dealers }: { dealers: DealerWithStats[] }) {
  const [selectedDealer, setSelectedDealer] = useState<DealerWithStats | null>(
    null
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dealer Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Dealer ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Postcode
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Stock
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Advertised
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Not Advertised
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dealers.map((dealer) => (
              <tr
                key={dealer.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedDealer(dealer)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {dealer.dealer.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {dealer.dealer.website}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {dealer.marketcheckDealerId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {dealer.dealer.zipcode}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Total number of stocks in marketcheck"
                      ]
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Total number of vehicles currently advertised"
                      ]
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dealer.listingOverview
                    ? dealer.listingOverview[
                        "Vehicles not advertised due to specific criteria"
                      ].count
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dealer.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {dealer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDealer && (
        <DealerDetailsModal
          dealer={selectedDealer}
          onClose={() => setSelectedDealer(null)}
        />
      )}
    </>
  );
}

interface ClientPageProps {
  initialDealers: DealerWithStats[];
}

export function ClientPage({ initialDealers }: ClientPageProps) {
  return (
    <div className="bg-white min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <form action={handleLogout}>
            <button
              type="submit"
              className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        <DealersTable dealers={initialDealers} />
      </main>
    </div>
  );
}

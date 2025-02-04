"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { DealerWithStats } from "@/lib/marketplace-api";
import { DealerDetailsModal } from "./dealer-details-modal";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";

function DealersTable({ dealers }: { dealers: DealerWithStats[] }) {
  const [selectedDealer, setSelectedDealer] = useState<DealerWithStats | null>(
    null
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const dealerId = searchParams.get("dealer");
    const dealer = dealerId
      ? dealers.find((d) => d.marketcheckDealerId === dealerId)
      : null;
    if (dealer) {
      setSelectedDealer(dealer);
    }
  }, [dealers, searchParams]);

  const handleDealerClick = useCallback(
    (dealer: DealerWithStats) => {
      if (window.getSelection()?.toString()) return;
      setSelectedDealer(dealer);
      router.push(`?dealer=${dealer.marketcheckDealerId}`);
    },
    [router]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedDealer(null);
    router.push("/");
  }, [router]);

  const columns = useMemo<ColumnDef<DealerWithStats>[]>(
    () => [
      {
        accessorKey: "dealer.name",
        header: ({ column }) => (
          <div className="text-left">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Dealer Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="font-medium tracking-tight">
            {row.original.dealer.name || "-"}
          </div>
        ),
      },
      {
        accessorKey: "dealer.website",
        header: "Website",
        cell: ({ row }) => (
          <a
            href={
              row.original.dealer.website
                ? `https://${row.original.dealer.website}`
                : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {row.original.dealer.website || "-"}
          </a>
        ),
      },
      {
        accessorKey: "marketcheckDealerId",
        header: "Dealer ID",
        cell: ({ row }) => (
          <div className="font-mono text-sm">
            {row.original.marketcheckDealerId}
          </div>
        ),
      },
      {
        accessorKey: "dealer.zipcode",
        header: "Postcode",
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.dealer.zipcode || "-"}
          </div>
        ),
      },
      {
        accessorKey: "listingOverview.marketcheckTotalStock",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Total Stock
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {row.original.listingOverview?.marketcheckTotalStock || "-"}
          </div>
        ),
      },
      {
        accessorKey: "listingOverview.advertisedStockQty",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Advertised
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {row.original.listingOverview?.advertisedStockQty || "-"}
          </div>
        ),
      },
      {
        accessorKey: "listingOverview.notAdvertisedCriteria.count",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Not Advertised
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-medium">
            {row.original.listingOverview?.notAdvertisedCriteria.count || "-"}
          </div>
        ),
      },
      {
        accessorKey: "listingOverview.notAdvertisedExpired.count",
        header: ({ column }) => (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Expired (48h+)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right">
            <Badge variant="destructive" className="font-medium">
              {row.original.listingOverview?.notAdvertisedExpired.count || "0"}
            </Badge>
          </div>
        ),
      },
    ],
    []
  );

  const tableInstance = useReactTable({
    data: dealers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: { sorting, globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });
  const table = useMemo(() => tableInstance, [tableInstance]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setGlobalFilter(e.target.value);
    },
    []
  );

  return (
    <>
      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search dealers..."
            value={globalFilter}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
      </div>
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
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
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleDealerClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedDealer && (
        <DealerDetailsModal
          dealer={selectedDealer}
          onClose={handleCloseModal}
          open={!!selectedDealer}
          defaultTab={searchParams.get("tab") || "issues"}
        />
      )}
    </>
  );
}

export { DealersTable };

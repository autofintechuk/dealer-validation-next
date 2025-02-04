"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StatsCardSkeleton: React.FC = React.memo(() => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24 bg-gray-800" />
        <Skeleton className="h-5 w-8 bg-gray-800" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-32 bg-gray-800" />
      </CardContent>
    </Card>
  );
});

StatsCardSkeleton.displayName = "StatsCardSkeleton";

export { StatsCardSkeleton };

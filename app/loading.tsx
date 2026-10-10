import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main className="min-h-screen bg-muted/40 px-3 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in-50 duration-300">
        
        {/* Header Skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 sm:w-64" />
            <Skeleton className="h-4 w-64 sm:w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-full sm:w-48" />
            <Skeleton className="h-8 w-24 hidden sm:block" />
          </div>
        </div>

        {/* Stats Grid Skeleton (Dashboard / Metrics) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>

        {/* Content / Table Card Skeleton */}
        <Card className="shadow-sm">
          <CardHeader className="border-b px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3.5 w-44" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>

          <CardContent className="p-0 divide-y">
            {/* Table Header Row (Desktop) */}
            <div className="hidden md:flex items-center justify-between border-b bg-muted/30 px-6 py-3.5">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>

            {/* Skeleton List Items (Simulating Table Rows or Cards) */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:px-6 gap-4"
              >
                {/* Left Side: Image + Title */}
                <div className="flex items-center gap-3.5 flex-1">
                  <Skeleton className="size-12 shrink-0 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 max-w-[240px]" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>

                {/* Middle Info */}
                <div className="flex items-center gap-8 justify-between md:justify-start">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>

                {/* Right Action Button */}
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
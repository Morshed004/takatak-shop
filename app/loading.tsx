import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground animate-in fade-in-50 duration-500">
      
      {/* 1. Top Navbar Skeleton */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-5 w-28 hidden xs:block" />
          </div>

          {/* Search bar (Center/Right) */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md mx-8">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-md sm:hidden" /> {/* Mobile Menu Icon */}
            <Skeleton className="h-9 w-20 rounded-md hidden sm:block" />
          </div>
        </div>
      </header>

      {/* 2. Main Page Layout */}
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 md:px-8 space-y-6">
        
        {/* Page Header (Title + Breadcrumbs + Action Buttons) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" /> {/* Breadcrumb */}
            <Skeleton className="h-8 w-48 sm:w-64" /> {/* Main Page Title */}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-9 w-full sm:w-32 rounded-md" />
            <Skeleton className="h-9 w-24 shrink-0 rounded-md" />
          </div>
        </div>

        {/* Top Summary / Metrics Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-36" />
            </Card>
          ))}
        </div>

        {/* Content Section (Table / Cards Section) */}
        <Card className="shadow-sm border">
          {/* Card Filter / Actions Header */}
          <CardHeader className="border-b px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3.5 w-52" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          </CardHeader>

          {/* Content List / Table Placeholder */}
          <CardContent className="p-0 divide-y">
            {/* Desktop Table Header */}
            <div className="hidden md:flex items-center justify-between border-b bg-muted/40 px-6 py-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>

            {/* List Items */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:px-6 gap-4"
              >
                {/* Image / Avatar + Title & Subtitle */}
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <Skeleton className="size-10 sm:size-11 shrink-0 rounded-lg" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="h-4 w-full max-w-55" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>

                {/* Additional Info / Status */}
                <div className="flex items-center gap-6 justify-between md:justify-start w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border/40">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" /> {/* Badge Placeholder */}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 w-full md:w-auto">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
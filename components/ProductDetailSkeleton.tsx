export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Top Grid: Image Gallery & Checkout Form */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 items-start">
        
        {/* Left Side: Product Image & Thumbnails Skeleton */}
        <div className="flex flex-col-reverse gap-3 md:flex-row">
          {/* Thumbnails Skeleton */}
          <div className="flex gap-2.5 sm:gap-3 md:flex-col">
            <div className="size-16 sm:size-20 rounded-xl bg-muted shrink-0" />
            <div className="size-16 sm:size-20 rounded-xl bg-muted shrink-0" />
            <div className="size-16 sm:size-20 rounded-xl bg-muted shrink-0" />
          </div>
          {/* Main Image Skeleton */}
          <div className="relative w-full aspect-square sm:aspect-4/5 max-h-112.5 rounded-2xl bg-muted" />
        </div>

        {/* Right Side: Product Info & Form Skeleton */}
        <div className="space-y-5">
          {/* Product ID & Title Skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-7 w-3/4 rounded-lg bg-muted" />
            <div className="h-7 w-1/2 rounded-lg bg-muted" />
          </div>

          {/* Pricing Highlight Box Skeleton */}
          <div className="rounded-2xl border p-4 sm:p-5 space-y-3 bg-card/50">
            <div className="flex justify-between items-center">
              <div className="h-8 w-32 rounded-lg bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
            <div className="h-3 w-48 rounded bg-muted" />
          </div>

          {/* Customer Info Form Card Skeleton */}
          <div className="rounded-2xl border p-4 space-y-4 bg-card/50">
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-10 rounded-xl bg-muted" />
              <div className="h-10 rounded-xl bg-muted" />
            </div>
          </div>

          {/* Address & Shipping Card Skeleton */}
          <div className="rounded-2xl border p-4 space-y-4 bg-card/50">
            <div className="h-4 w-36 rounded bg-muted" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-10 rounded-xl bg-muted" />
              <div className="h-10 rounded-xl bg-muted" />
            </div>
            <div className="h-10 rounded-xl bg-muted" />
          </div>

          {/* Delivery Payment Box Skeleton */}
          <div className="rounded-2xl border p-4 space-y-3 bg-card/50">
            <div className="h-4 w-44 rounded bg-muted" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-10 rounded-xl bg-muted" />
              <div className="h-10 rounded-xl bg-muted" />
              <div className="h-10 rounded-xl bg-muted" />
            </div>
            <div className="h-20 rounded-xl bg-muted" />
          </div>

          {/* Order Button Skeleton */}
          <div className="h-12 w-full rounded-xl bg-muted" />
        </div>
      </div>

      {/* Bottom Description Section Skeleton */}
      <div className="mt-12 max-w-4xl space-y-4">
        <div className="h-6 w-40 bg-muted rounded-lg" />
        <div className="h-36 w-full bg-muted rounded-2xl" />
      </div>
    </div>
  );
}
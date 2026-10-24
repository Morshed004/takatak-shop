import { Metadata } from "next";
import ProductClient from "./ProductClient";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

// Revalidate the page every 900 seconds (15 minutes) in the background
export const revalidate = 900;

// Generate dynamic metadata for SEO and OpenGraph sharing using Redis/Prisma
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const cacheKey = `product_${id}`;
    let product: any = await redis.get(cacheKey);

    if (!product) {
      product = await prisma.product.findUnique({
        where: { id },
        include: { images: true, variants: true },
      });

      if (product) {
        await redis.set(cacheKey, product);
      }
    }

    if (product) {
      const images = product.images;
      const imageUrl = Array.isArray(images) && images.length > 0 ? images[0]?.url || "" : "";
      
      return {
        title: `${product.name} | Takatak Shop`,
        description: product.description ? product.description.substring(0, 160) : "Order with cash on delivery at the best price.",
        openGraph: {
          title: product.name,
          description: product.description ? product.description.substring(0, 160) : "",
          images: imageUrl ? [{ url: imageUrl }] : [],
          type: "website",
        },
      };
    }
  } catch (error) {
    console.error("Error generating metadata from Redis/DB:", error);
  }

  // Fallback metadata if product is not found or an error occurs
  return {
    title: "Product Details | Takatak Shop",
    description: "Buy products online with cash on delivery.",
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-32 pt-4 sm:pt-6 lg:pb-16 text-foreground bg-background">
      {/* Breadcrumb Navigation - Instant Static Shell */}
      <nav
        aria-label="breadcrumb"
        className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-1"
      >
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="font-medium text-foreground">Product Details</span>
      </nav>

      {/* Custom Exact Layout Skeleton Fallback with Streaming */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailSection id={id} />
      </Suspense>
    </main>
  );
}

// Separate asynchronous component to fetch product data via Redis with DB fallback
async function ProductDetailSection({ id }: { id: string }) {
  const cacheKey = `product_${id}`;

  // 1. Try to fetch product from Redis cache first
  let product: any = await redis.get(cacheKey);

  // 2. If not found in Redis, fetch from Database and store in Redis
  if (!product) {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
      },
    });

    if (product) {
      await redis.set(cacheKey, product);
    }
  }

  // If product doesn't exist, trigger 404
  if (!product) {
    notFound();
  }

  // Serialize product data (e.g., converting Prisma Decimal to Number)
  const serializedProduct = {
    ...product,
    price: Number(product.price),
  };

  // Pass the initial product down to the client component
  return <ProductClient initialProduct={serializedProduct} />;
}

// Exact layout skeleton loader component matching the product page design
function ProductDetailSkeleton() {
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
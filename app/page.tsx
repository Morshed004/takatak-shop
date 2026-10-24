import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma"; // Direct Prisma import
import { redis } from "@/lib/redis"; // Import Redis client
import {
  Banknote,
  Eye,
  RotateCcw,
  ShieldCheck,
  Truck,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import Image from "next/image";
import { FaFacebook } from "react-icons/fa";
import { Suspense } from "react";

interface ProductImage {
  id: string;
  url: string;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  images: ProductImage[];
}

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

const ITEMS_PER_PAGE = 16;

const perks = [
  {
    icon: Truck,
    title: "দ্রুত ডেলিভারি",
    text: "সারাদেশে ২–৪ দিন",
  },
  {
    icon: Banknote,
    title: "ক্যাশ অন ডেলিভারি",
    text: "পণ্য হাতে পেয়ে টাকা দিন",
  },
  {
    icon: RotateCcw,
    title: "রিটার্ন",
    text: "পছন্দ না হলে সহজে ফেরত",
  },
  {
    icon: ShieldCheck,
    title: "১০০% অরিজিনাল",
    text: "নিজে যাচাই করা পণ্য, সরাসরি আমাদের কাছ থেকে",
  },
];

const taka = (n?: number | null) => {
  if (n === undefined || n === null || isNaN(n)) {
    return "৳0";
  }
  return `৳${n.toLocaleString("bn-BD")}`;
};

// Revalidate page every 15 minutes (900 seconds) to cache data and reduce DB hits
export const revalidate = 900;

// Fetch products using Redis cache with fallback to database
async function getProductsData(page: number) {
  try {
    const cacheKey = "cached_products_v2"; // Changed key to avoid old invalid cache

    // 1. Try to fetch products from Redis cache first
    let products: any = await redis.get(cacheKey);

    // 2. If cache is empty or not an array, fetch from Database and set to Redis
    if (!products || !Array.isArray(products) || products.length === 0) {
      products = await prisma.product.findMany({
        include: {
          images: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (products && products.length > 0) {
        await redis.set(cacheKey, products);
      }
    }

    // Ensure products is always an array to prevent .slice() crash
    const safeProducts = Array.isArray(products) ? products : [];
    const totalProducts = safeProducts.length;
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE) || 1;

    // 3. Handle pagination and shuffling on the fetched products array
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const paginatedProducts = safeProducts.slice(skip, skip + ITEMS_PER_PAGE);
    const shuffledProducts = paginatedProducts.sort(() => Math.random() - 0.5);

    const serializedProducts = shuffledProducts.map((p: any) => ({
      ...p,
      price: Number(p.price),
    }));

    return {
      products: serializedProducts,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching products with Redis/DB:", error);
    return { products: [], totalPages: 1, currentPage: page };
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = Number(resolvedParams?.page) || 1;
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Announcement Bar */}
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground md:text-sm">
        <p>🎉 সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা উপলব্ধ!</p>
      </div>

      {/* 2. Simplified Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-3 group">
            {/* Logo Image */}
            <div className="relative w-9 h-9 overflow-hidden rounded-xl shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                fill
                sizes="36"
                alt="Takatak Logo"
                className="object-cover"
              />
            </div>
            {/* Text */}
            <span className="text-2xl font-black tracking-tight">
              Takatak<span className="text-primary">.</span>
            </span>
          </Link>
        </div>
      </header>

      <main>
        {/* 3. Hero Carousel Section */}
        <section className="mx-auto max-w-7xl px-4 pt-6">
          <HeroCarousel />
        </section>

        {/* 4. Trust Badges Section */}
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 lg:grid-cols-4">
            {perks.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Product Grid Showcase Section with Suspense Streaming & Pagination */}
        <section id="products" className="mx-auto max-w-7xl px-4 pb-12">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">সকল প্রোডাক্টস</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                আমাদের সংগৃহীত সেরা পণ্যসমূহ দেখুন
              </p>
            </div>
          </div>

          <Suspense key={currentPage} fallback={<ProductGridSkeleton />}>
            <ProductSection page={currentPage} />
          </Suspense>
        </section>

        {/* 6. Promotional Banners */}
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 p-8 text-white">
              <h3 className="text-2xl font-bold">আজই আপনার পছন্দ বেছে নিন</h3>
              <p className="mt-2 text-sm text-slate-300">
                সহজে অর্ডার করুন এবং ঘরে বসেই ডেলিভারি পান।
              </p>
              <a href="#products">
                <Button
                  variant="secondary"
                  className="mt-6 rounded-full font-semibold"
                >
                  ব্রাউজ করুন
                </Button>
              </a>
            </div>

            <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
              <h3 className="text-2xl font-bold">ক্যাশ অন ডেলিভারি</h3>
              <p className="mt-2 text-sm opacity-90">
                যেকোনো স্থান থেকে আজই আপনার পছন্দের প্রোডাক্ট বেছে নিন।
              </p>
              <a href="#products">
                <Button
                  variant="secondary"
                  className="mt-6 rounded-full font-semibold"
                >
                  অর্ডার করুন
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer Section */}
      <footer className="bg-card border-t text-card-foreground pt-16 pb-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 md:grid-cols-4">
          {/* 1. Brand Info Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-md transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  fill
                  sizes="40"
                  alt="Takatak Logo"
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Takatak<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              আমরা আপনাকে দিচ্ছি সর্বোচ্চ কোয়ালিটি ও সঠিক মূল্যের নিশ্চয়তা।
              সারাদেশে ক্যাশ অন ডেলিভারি।
            </p>
          </div>

          {/* 2. Quick Links Column */}
          <div>
            <h5 className="font-bold mb-4 text-sm tracking-wider uppercase text-foreground">
              কুইক লিংকস
            </h5>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  হোম পেজ
                </Link>
              </li>
              <li>
                <Link
                  href="/#products"
                  className="hover:text-primary transition-colors"
                >
                  সকল প্রোডাক্টস
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Customer Care Column */}
          <div>
            <h5 className="font-bold mb-4 text-sm tracking-wider uppercase text-foreground">
              গ্রাহক সেবা
            </h5>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/return-policy"
                  className="hover:text-primary transition-colors"
                >
                  রিটার্ন ও রিফান্ড নীতি
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Contact & Social Column */}
          <div className="space-y-3">
            <h5 className="font-bold mb-4 text-sm tracking-wider uppercase text-foreground">
              যোগাযোগ
            </h5>
            <div className="text-sm text-muted-foreground space-y-1.5">
              <p>
                ইমেইল:{" "}
                <span className="text-foreground font-medium">
                  support@takatak.shop
                </span>
              </p>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                আমাদের সাথে যুক্ত থাকুন:
              </p>
              <a
                href="https://www.facebook.com/profile.php?id=61595063524452"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center size-10 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all"
                aria-label="Facebook Page"
              >
                <FaFacebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <Separator className="my-8" />
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          © {year} Takatak.shop। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>
    </div>
  );
}

/* ---------- Separate Dynamic Product Section Component with Pagination ---------- */
async function ProductSection({ page }: { page: number }) {
  const { products, totalPages, currentPage } = await getProductsData(page);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border p-12 text-center text-muted-foreground">
        <p>কোনো প্রোডাক্ট পাওয়া যায়নি!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Link
            href={`/?page=${currentPage - 1}`}
            className={`${currentPage <= 1 ? "pointer-events-none opacity-50" : ""}`}
          >
            <Button variant="outline" size="sm" disabled={currentPage <= 1}>
              <ChevronLeft className="size-4 mr-1" /> Previous
            </Button>
          </Link>

          <span className="text-sm font-medium px-4">
            Page {currentPage} of {totalPages}
          </span>

          <Link
            href={`/?page=${currentPage + 1}`}
            className={`${currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}`}
          >
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
            >
              Next <ChevronRightIcon className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

/* ---------- Product Grid Skeleton Loader Component (16 items for full page match) ---------- */
function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border bg-card p-4 space-y-4"
        >
          <div className="aspect-square w-full bg-muted rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
          <div className="h-9 bg-muted rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Server-rendered Product Card ---------- */
function ProductCard({ p }: { p: Product }) {
  const imageUrl = p.images && p.images.length > 0 ? p.images[0].url : null;

  return (
    <Card className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md p-0">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={p.name}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            [ছবি পাওয়া যায়নি]
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {p.name}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {taka(p.price)}
          </span>
        </div>

        <Link href={`/product/${p.id}`} className="mt-3 block">
          <Button
            variant="outline"
            className="w-full rounded-lg gap-2 text-xs"
            size="sm"
          >
            <Eye className="size-3.5" /> View More
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
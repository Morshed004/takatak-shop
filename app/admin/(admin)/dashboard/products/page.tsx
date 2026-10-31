import { formatPrice } from "@/lib/formatPrice";
import {
  ImageIcon,
  Package,
  PackageX,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";

import { PaginationControl } from "@/components/pagination-control";
import { ProductSearch } from "@/components/product-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = {
  title: "My Product Listings",
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

// Function to fetch products from the internal API route using APP_SECRET header
async function fetchProductsFromApi() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    const appSecret = process.env.APP_SECRET || "";

    const response = await fetch(`${baseUrl}/api/products`, {
      headers: {
        "x-app-secret": appSecret,
      },
      cache: "no-store", // Always fetch fresh state or rely on Redis cache inside the API
    });

    const result = await response.json();

    if (result.success && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch products from API:", error);
    return [];
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.search?.toLowerCase() || "";

  // Fetch products from API route (which uses Redis cache)
  const allProducts = await fetchProductsFromApi();

  // Filter products based on search query
  const filteredProducts = allProducts.filter((product: any) =>
    product.name.toLowerCase().includes(searchQuery)
  );

  // Pagination Logic (10 items per page)
  const ITEMS_PER_PAGE = 10;
  const currentPage = Number(resolvedParams?.page) || 1;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const products = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function truncateTitle(title: string, maxLength = 35) {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength).trimEnd() + "...";
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                My Product Listings
              </h1>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Manage and explore your created product collection.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProductSearch />
            <Badge
              variant="outline"
              className="hidden gap-1.5 border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex"
            >
              <ShoppingBag className="size-3.5" />
              <span>Catalog</span>
            </Badge>
          </div>
        </div>

        {/* Card Container */}
        <Card className="overflow-hidden rounded-xl border-border/60 shadow-sm">
          <CardHeader className="flex-row items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-4 sm:px-6">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                All Products
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Showing {products.length} of {filteredProducts.length} products
                {searchQuery && ` (filtered from ${allProducts.length} total)`}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* DESKTOP VIEW */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 bg-muted/40 hover:bg-muted/40">
                    <TableHead className="min-w-70 pl-6 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Product
                    </TableHead>
                    <TableHead className="min-w-42.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Variants
                    </TableHead>
                    <TableHead className="min-w-37.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Price
                    </TableHead>
                    <TableHead className="pr-6 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.map((product: any) => {
                    const firstImage = product.images?.[0]?.url;

                    // Extract unique colors & sizes
                    const colors = Array.from(
                      new Set(product.variants?.map((v: any) => v.color).filter(Boolean))
                    );
                    const sizes = Array.from(
                      new Set(product.variants?.map((v: any) => v.size).filter(Boolean))
                    );

                    return (
                      <TableRow
                        key={product.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-3.5">
                            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/50 ring-1 ring-border/60">
                              {firstImage ? (
                                <img
                                  src={firstImage}
                                  alt={product.name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="size-5 text-muted-foreground/60" />
                              )}
                            </div>

                            <div className="min-w-0 space-y-1.5">
                              <p
                                className="cursor-pointer text-sm font-medium leading-snug text-foreground hover:underline"
                                title={product.name}
                              >
                                {truncateTitle(product.name, 35)}
                              </p>

                              <div>
                                {product.inStock ? (
                                  <Badge
                                    variant="secondary"
                                    className="gap-1 border-emerald-500/20 bg-emerald-50 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  >
                                    <span className="size-1.5 rounded-full bg-emerald-500" />
                                    In Stock
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="gap-1 text-[10px] font-medium"
                                  >
                                    <PackageX className="size-3" />
                                    Out of Stock
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Updated Variant Column */}
                        <TableCell>
                          <div className="flex flex-col space-y-1 text-xs">
                            {colors.length > 0 || sizes.length > 0 ? (
                              <>
                                {colors.length > 0 && (
                                  <span className="text-muted-foreground">
                                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                                      Color:
                                    </span>{" "}
                                    <span className="text-foreground">{colors.join(", ")}</span>
                                  </span>
                                )}
                                {sizes.length > 0 && (
                                  <span className="text-muted-foreground">
                                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                                      Size:
                                    </span>{" "}
                                    <span className="text-foreground">{sizes.join(", ")}</span>
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="italic text-muted-foreground/60">
                                No Variants
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold tabular-nums text-primary">
                            {formatPrice ? formatPrice(product.price) : `৳${product.price}`}
                          </span>
                        </TableCell>

                        <TableCell className="pr-6 text-right">
                          <Button size="sm" variant="outline" className="hover:bg-muted">
                            <Link
                              href={`/admin/dashboard/products/edit/${product.id}`}
                              className="gap-1.5"
                            >
                              <span>Edit Product</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE VIEW */}
            <div className="divide-y divide-border/60 md:hidden">
              {products.map((product: any) => {
                const firstImage = product.images?.[0]?.url;

                const colors = Array.from(
                  new Set(product.variants?.map((v: any) => v.color).filter(Boolean))
                );
                const sizes = Array.from(
                  new Set(product.variants?.map((v: any) => v.size).filter(Boolean))
                );

                return (
                  <div key={product.id} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/50 ring-1 ring-border/60">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="size-6 text-muted-foreground/60" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1.5">
                        <p
                          className="line-clamp-2 text-sm font-medium leading-snug text-foreground"
                          title={product.name}
                        >
                          {product.name}
                        </p>

                        <div>
                          {product.inStock ? (
                            <Badge
                              variant="secondary"
                              className="gap-1 border-emerald-500/20 bg-emerald-50 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            >
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              In Stock
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="gap-1 text-[10px] font-medium"
                            >
                              <PackageX className="size-3" />
                              Out of Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/40 bg-muted/30 p-3 text-xs">
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                          Variants
                        </span>
                        <div className="space-y-0.5 font-medium text-foreground">
                          {colors.length > 0 && <div>Color: {colors.join(", ")}</div>}
                          {sizes.length > 0 && <div>Size: {sizes.join(", ")}</div>}
                          {colors.length === 0 && sizes.length === 0 && (
                            <span className="italic text-muted-foreground">None</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">
                          Price
                        </span>
                        <span className="font-semibold tabular-nums text-primary">
                          {formatPrice ? formatPrice(product.price) : `৳${product.price}`}
                        </span>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="w-full hover:bg-muted">
                      <Link
                        href={`/admin/dashboard/products/edit/${product.id}`}
                        className="justify-center gap-1.5"
                      >
                        <span>Edit Product</span>
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="flex min-h-70 flex-col items-center justify-center space-y-3 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/60">
                  <Package className="size-6 stroke-[1.5] text-muted-foreground/70" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    No products found
                  </p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    {searchQuery
                      ? `No results match "${searchQuery}".`
                      : "Your product catalog is currently empty."}
                  </p>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && (
              <div className="border-t border-border/60 px-4 py-3 sm:px-6">
                <PaginationControl
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
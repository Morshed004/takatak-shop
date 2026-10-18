import { formatPrice } from "@/lib/businesskoro";
import { prisma } from "@/lib/prisma";
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

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams?.search?.toLowerCase() || "";

  // Fetch products from database
  const allProducts = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Filter products based on search query
  const filteredProducts = allProducts.filter((product) =>
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
    <main className="min-h-screen bg-muted/40 px-3 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              My Product Listings
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Manage and explore your created product collection.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProductSearch />
            <Badge variant="outline" className="hidden sm:flex gap-1.5 px-3 py-1.5 text-xs">
              <ShoppingBag className="size-3.5 text-muted-foreground" />
              <span>Catalog</span>
            </Badge>
          </div>
        </div>

        {/* Card Container */}
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between border-b px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold sm:text-base">
                All Products
              </CardTitle>
              <CardDescription className="text-xs">
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
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="min-w-70 pl-6">Product</TableHead>
                    <TableHead className="min-w-42.5">Variants</TableHead>
                    <TableHead className="min-w-37.5">Price</TableHead>
                    <TableHead className="pr-6 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.map((product) => {
                    const firstImage = product.images?.[0]?.url;

                    // Extract unique colors & sizes
                    const colors = Array.from(
                      new Set(product.variants?.map((v) => v.color).filter(Boolean))
                    );
                    const sizes = Array.from(
                      new Set(product.variants?.map((v) => v.size).filter(Boolean))
                    );

                    return (
                      <TableRow
                        key={product.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3.5">
                            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/50">
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

                            <div className="min-w-0 space-y-1">
                              <p
                                className="font-medium text-foreground leading-none hover:underline cursor-pointer"
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
                          <div className="flex flex-col text-xs space-y-0.5">
                            {colors.length > 0 || sizes.length > 0 ? (
                              <>
                                {colors.length > 0 && (
                                  <span className="text-muted-foreground">
                                    <strong className="text-foreground font-medium">Color:</strong>{" "}
                                    {colors.join(", ")}
                                  </span>
                                )}
                                {sizes.length > 0 && (
                                  <span className="text-muted-foreground">
                                    <strong className="text-foreground font-medium">Size:</strong>{" "}
                                    {sizes.join(", ")}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-muted-foreground/60 italic">No Variants</span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-semibold text-primary">
                            {formatPrice ? formatPrice(product.price) : `৳${product.price}`}
                          </span>
                        </TableCell>

                        <TableCell className="pr-6 text-right">
                          <Button size="sm" variant="outline">
                            <Link href={`/dashboard/products/edit/${product.id}`} className="gap-1.5">
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
            <div className="divide-y md:hidden">
              {products.map((product) => {
                const firstImage = product.images?.[0]?.url;

                const colors = Array.from(
                  new Set(product.variants?.map((v) => v.color).filter(Boolean))
                );
                const sizes = Array.from(
                  new Set(product.variants?.map((v) => v.size).filter(Boolean))
                );

                return (
                  <div key={product.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/50">
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

                      <div className="min-w-0 flex-1 space-y-1">
                        <p
                          className="font-medium text-sm text-foreground line-clamp-2 leading-snug"
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

                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-2.5 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px] font-medium">
                          Variants
                        </span>
                        <div className="text-slate-700 dark:text-slate-300 font-medium space-y-0.5">
                          {colors.length > 0 && <div>Color: {colors.join(", ")}</div>}
                          {sizes.length > 0 && <div>Size: {sizes.join(", ")}</div>}
                          {colors.length === 0 && sizes.length === 0 && (
                            <span className="text-muted-foreground italic">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-muted-foreground block text-[11px] font-medium">
                          Price
                        </span>
                        <span className="font-semibold text-primary">
                          {formatPrice ? formatPrice(product.price) : `৳${product.price}`}
                        </span>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="w-full">
                      <Link href={`/dashboard/products/edit/${product.id}`} className="justify-center gap-1.5">
                        <span>Edit Product</span>
                      </Link>
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-muted-foreground min-h-50">
                <Package className="size-8 stroke-[1.5]" />
                <p className="text-sm font-medium">No products found</p>
                <p className="text-xs text-muted-foreground/80">
                  {searchQuery
                    ? `No results match "${searchQuery}".`
                    : "Your product catalog is currently empty."}
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && (
              <PaginationControl
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getProducts,
  formatPrice,
} from "@/lib/businesskoro";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({
  params,
}: Props) {
  const { id } = await params;
  const { data: products } = await getProducts();

  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button variant="outline" size="sm">
          <Link href="/dashboard/products">← Back to Products</Link>
        </Button>

        <Card className="overflow-hidden">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex min-h-72 items-center justify-center bg-muted p-6">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="max-h-105 w-full rounded-xl object-contain"
                />
              ) : (
                <div className="text-muted-foreground">
                  No image available
                </div>
              )}
            </div>

            <div className="p-5 md:p-6">
              <CardHeader className="p-0">
                <div className="mb-3">
                  <Badge
                    variant={
                      product.inStock ? "secondary" : "destructive"
                    }
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <CardTitle className="text-2xl">
                  {product.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5 p-0 pt-5">
                <p className="text-sm leading-6 text-muted-foreground">
                  {product.description || "No description available."}
                </p>

                <div className="rounded-xl border p-4">
                  <p className="text-sm text-muted-foreground">
                    Suggested Price
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {formatPrice(product.suggestedPrice)}
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Customer pays delivery
                    </span>
                    <strong>
                      {formatPrice(
                        product.minimumSellingPrice.customerPaysDelivery
                      )}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Reseller — Inside Dhaka
                    </span>
                    <strong>
                      {formatPrice(
                        product.minimumSellingPrice.resellerPaysDeliveryInsideDhaka
                      )}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Reseller — Outside Dhaka
                    </span>
                    <strong>
                      {formatPrice(
                        product.minimumSellingPrice.resellerPaysDeliveryOutsideDhaka
                      )}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4 border-t pt-3">
                    <span className="text-muted-foreground">
                      Product cost
                    </span>
                    <strong>{formatPrice(product.costPrice)}</strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      Packaging cost
                    </span>
                    <strong>
                      {formatPrice(product.packagingCost)}
                    </strong>
                  </div>
                </div>

                {product.variants &&
                  product.variants.length > 0 && (
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="font-semibold">Variants</h3>

                      {product.variants.map((variant, index) => (
                        <div
                          key={`${variant.color}-${variant.size ?? ""}-${index}`}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <span>
                            {variant.color}
                            {variant.size
                              ? ` / ${variant.size}`
                              : ""}
                          </span>

                          <Badge
                            variant={
                              variant.inStock
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {variant.inStock
                              ? "Available"
                              : "Unavailable"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
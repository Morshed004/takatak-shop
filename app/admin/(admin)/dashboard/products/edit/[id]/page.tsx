import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { ProductUpdateForm } from "@/components/product-update-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
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

  return (
    <main className="min-h-screen bg-muted/40 px-3 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-4xl">
        <ProductUpdateForm product={product} />
      </div>
    </main>
  );
}
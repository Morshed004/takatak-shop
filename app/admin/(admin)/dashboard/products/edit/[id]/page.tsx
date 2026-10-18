import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductUpdateForm } from "@/components/product-update-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: true,
    },
  });

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
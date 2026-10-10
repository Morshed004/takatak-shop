import { notFound } from "next/navigation";
import { getProducts } from "@/lib/businesskoro";
import { ProductEditForm } from "@/components/product-edit-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsPage({ params }: Props) {
  const { id } = await params;
  const { data: products } = await getProducts();

  const product = products.find((item) => item.id === id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-muted/40 px-3 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <ProductEditForm product={product} />
      </div>
    </main>
  );
}
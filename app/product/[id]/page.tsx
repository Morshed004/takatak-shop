import { Metadata } from "next";
import ProductClient from "./ProductClient";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

// Revalidate the page every 300 seconds (5 minutes) in the background
export const revalidate = 300;

// Generate dynamic metadata for SEO and OpenGraph sharing using Prisma directly at build/runtime
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch product directly from the database to avoid build-time fetch errors (ECONNREFUSED)
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (product) {
      // Safe check for images array or JSON structure
      const images = (product as any).images;
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
    console.error("Error generating metadata from DB:", error);
  }

  // Fallback metadata if product is not found or an error occurs
  return {
    title: "Product Details | Takatak Shop",
    description: "Buy products online with cash on delivery.",
  };
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  
  // Pass the id prop down to the client component
  return <ProductClient  />;
}
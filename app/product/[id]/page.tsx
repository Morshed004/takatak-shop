import { Metadata } from "next";
import ProductClient from "./ProductClient";

interface Props {
  params: Promise<{ id: string }>;
}

// 1. Generate static params for all 100+ product IDs at build time
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products`, {
      headers: {
        'x-app-secret': process.env.NEXT_PUBLIC_APP_SECRET || '',
      },
    });

    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      return result.data.map((product: any) => ({
        id: product.id.toString(),
      }));
    }
  } catch (error) {
    console.error("Error generating static params:", error);
  }

  return [];
}

// 2. Revalidate the page every 300 seconds (5 minutes) in the background
export const revalidate = 300;

// Generate dynamic metadata for SEO and OpenGraph sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products`, {
      headers: {
        'x-app-secret': process.env.NEXT_PUBLIC_APP_SECRET || '',
      },
      next: { revalidate: 300 }
    });

    const result = await response.json();
    if (result.success && Array.isArray(result.data)) {
      const product = result.data.find((p: any) => p.id === id) || result.data[0];
      
      if (product) {
        const imageUrl = product.images?.[0]?.url || "";
        return {
          title: `${product.name} | Your Shop Name`,
          description: product.description ? product.description.substring(0, 160) : "Order with cash on delivery at the best price.",
          openGraph: {
            title: product.name,
            description: product.description ? product.description.substring(0, 160) : "",
            images: imageUrl ? [{ url: imageUrl }] : [],
            type: "website",
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: "Product Details | Your Shop Name",
    description: "Buy products online with cash on delivery.",
  };
}

export default function Page() {
  return <ProductClient />;
}

const API_BASE_URL =
  "https://api.businesskoro.com/api/v1/storefront";

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  images?: string[];
  suggestedPrice: number;
  costPrice: number;
  packagingCost: number;
  minimumSellingPrice: {
    customerPaysDelivery: number;
    resellerPaysDeliveryInsideDhaka: number;
    resellerPaysDeliveryOutsideDhaka: number;
  };
  inStock: boolean;
  variants?: {
    color: string;
    size: string | null;
    inStock: boolean;
  }[];
};

export type ProductsResponse = {
  data: Product[];
  deliveryCharges: {
    insideDhaka: number;
    outsideDhaka: number;
  };
};

export async function getProducts(): Promise<ProductsResponse> {
  const apiKey = process.env.BUSINESSKORO_API_KEY;
  const domain = process.env.BUSINESSKORO_DOMAIN?.trim();

  if (!apiKey) {
    throw new Error("Missing BUSINESSKORO_API_KEY");
  }

  const headers: Record<string, string> = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  if (domain) {
    headers["x-domain"] = domain;
  }

  const response = await fetch(`${API_BASE_URL}/products`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`BusinessKoro API error: ${response.status}`);
  }

  return response.json();
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(price);
}
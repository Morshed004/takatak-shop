import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Noto_Sans_Bengali } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const font = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});
export const metadata: Metadata = {
  title: {
    default: "Takatak - Modern E-Commerce Platform",
    template: "%s | Takatak",
  },
  description:
    "Takatak - Online shopping e cash on delivery ebong fast delivery service. Advance delivery charge diye order confirm korun ebong delivery man er samne product check kore nin.",
  keywords: [
    "Takatak",
    "E-commerce",
    "Online Shopping Bangladesh",
    "Cash on Delivery",
    "Return Policy",
    "Fast Delivery",
    "Takatak BD",
  ],
  authors: [{ name: "Takatak Team" }],
  creator: "Takatak",
  publisher: "Takatak",
  metadataBase: new URL("https://takatak.shop"), // Apnar exact domain ekhane diben
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Takatak - Modern E-Commerce Platform",
    description:
      "Takatak e Cash on Delivery te shopping করুন। Delivery man er samne product check korar subidha.",
    url: "https://takatak.shop",
    siteName: "Takatak",
    images: [
      {
        url: "/og-image.webp", // public/og-image.webp folder e rakhte hobe
        width: 1200,
        height: 630,
        alt: "Takatak E-Commerce Banner",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Takatak - Modern E-Commerce Platform",
    description:
      "Takatak e Cash on Delivery te shopping করুন। Advance delivery charge system ebong easy return option.",
    images: ["/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={cn("h-full", "antialiased", "font-sans")}
    >
      <body className={font.className}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

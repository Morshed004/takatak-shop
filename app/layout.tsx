import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Noto_Sans_Bengali } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import Script from "next/script";
import FacebookPixel from "@/components/FacebookPixel";

const font = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Takatak Shop",
    template: "%s | Takatak",
  },
  description:
    "Takatak - Shop online with Cash on Delivery and fast delivery service. Confirm your order by paying an advance delivery charge and check your product in front of the delivery person.",
  keywords: [
    "Takatak",
    "Takatak Shop",
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
  metadataBase: new URL("https://takatak.shop"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Takatak Shop",
    description:
      "Shop at Takatak with Cash on Delivery. Enjoy the convenience of checking your product in front of the delivery person.",
    url: "https://takatak.shop",
    siteName: "Takatak",
    images: [
      {
        url: "/og-image.webp",
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
    title: "Takatak Shop",
    description:
      "Shop at Takatak with Cash on Delivery, an advance delivery charge system, and an easy return option.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={cn("h-full", "antialiased", "font-sans")}
    >
      <head>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WHBXEN8K58"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WHBXEN8K58');
          `}
        </Script>
      </head>
      <body className={font.className}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster position="top-center" />
        <FacebookPixel />

        {/* Facebook Pixel Script */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!n._s)n._s=!0;n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2951254778543440');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2951254778543440&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}

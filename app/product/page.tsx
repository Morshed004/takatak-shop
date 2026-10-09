"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart, Share2, Minus, Plus, Truck, RotateCcw,
  ShieldCheck, Banknote, ChevronRight, ImageIcon, Check, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------- API Types ---------- */
interface Variant {
  color?: string | null;
  size?: string | null;
  inStock: boolean;
}

interface MinimumSellingPrice {
  customerPaysDelivery: number;
  resellerPaysDeliveryInsideDhaka: number;
  resellerPaysDeliveryOutsideDhaka: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  suggestedPrice: number;
  costPrice: number;
  packagingCost: number;
  minimumSellingPrice: MinimumSellingPrice;
  inStock: boolean;
  variants: Variant[];
}

interface ApiResponse {
  data: Product[];
  deliveryCharges: {
    insideDhaka: number;
    outsideDhaka: number;
  };
}

/* ---------- Dummy API Response Data ---------- */
const apiData: ApiResponse = {
  data: [
    {
      id: "prod-101",
      name: "পুরুষদের প্রিমিয়াম কটন পাঞ্জাবি",
      description:
        "১০০% খাঁটি কটন ফেব্রিক দিয়ে তৈরি। গরমে অত্যন্ত আরামদায়ক এবং যেকোনো উৎসব বা অনুষ্ঠানে পরার জন্য মানানসই। এতে রয়েছে সূক্ষ্ম ফিনিশিং ও প্রিমিয়াম লুকিং স্টিচ যা আপনাকে দেবে চমৎকার একটি আভিজাত্য।",
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80",
      ],
      suggestedPrice: 1200,
      costPrice: 380,
      packagingCost: 25,
      minimumSellingPrice: {
        customerPaysDelivery: 405,
        resellerPaysDeliveryInsideDhaka: 475,
        resellerPaysDeliveryOutsideDhaka: 535,
      },
      inStock: true,
      variants: [
        { color: "Black", size: "M", inStock: true },
        { color: "Black", size: "L", inStock: true },
        { color: "Navy Blue", size: "L", inStock: false },
        { color: "Off White", size: "XL", inStock: true },
      ],
    },
  ],
  deliveryCharges: {
    insideDhaka: 70,
    outsideDhaka: 130,
  },
};

const related = [
  { name: "এমব্রয়ডারি পাঞ্জাবি", price: 1790 },
  { name: "কটন পায়জামা", price: 690 },
  { name: "লেদার স্যান্ডেল", price: 1250 },
  { name: "ফতুয়া (কটন)", price: 990 },
];

const bn = (n: number) => n.toLocaleString("bn-BD");
const taka = (n: number) => `৳${bn(n)}`;

export default function ProductPage() {
  const product = apiData.data[0];
  const deliveryCharges = apiData.deliveryCharges;

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [zone, setZone] = useState<"inside" | "outside">("inside");
  const [wished, setWished] = useState(false);

  // Extract Unique Colors and Sizes
  const availableColors = Array.from(
    new Set(product.variants.map((v) => v.color).filter(Boolean))
  ) as string[];

  const availableSizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter(Boolean))
  ) as string[];

  const [selectedColor, setSelectedColor] = useState<string | null>(
    availableColors[0] || null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    availableSizes[0] || null
  );

  const shipping =
    zone === "inside" ? deliveryCharges.insideDhaka : deliveryCharges.outsideDhaka;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 lg:pb-16">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-foreground">হোম</Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 font-medium text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ---------- Image Gallery ---------- */}
        <div className="flex flex-col-reverse gap-3 md:flex-row">
          {product.images.length > 1 && (
            <div className="flex gap-3 md:flex-col">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`ছবি ${bn(i + 1)}`}
                  className={`relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted transition ${
                    activeImg === i ? "border-primary ring-2 ring-primary/20" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="relative flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 shadow-sm">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[activeImg] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-all duration-300 hover:scale-105"
                priority
              />
            ) : (
              <ImageIcon className="size-16 text-muted-foreground/40" />
            )}

            {!product.inStock ? (
              <Badge variant="destructive" className="absolute left-4 top-4 text-xs font-semibold uppercase">
                স্টক আউট
              </Badge>
            ) : (
              <Badge className="absolute left-4 top-4 bg-emerald-600 hover:bg-emerald-700 text-xs font-medium">
                স্টকে আছে
              </Badge>
            )}

            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="size-9 rounded-full shadow-md backdrop-blur-sm"
                aria-label="উইশলিস্ট"
                onClick={() => setWished(!wished)}
              >
                <Heart className={`size-4 ${wished ? "fill-destructive text-destructive" : ""}`} />
              </Button>
              <Button size="icon" variant="secondary" className="size-9 rounded-full shadow-md backdrop-blur-sm" aria-label="শেয়ার">
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- Product Info & Checkout Box ---------- */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-mono tracking-wider text-muted-foreground">পণ্য আইডি: #{product.id}</span>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-4xl">{product.name}</h1>

          {/* Pricing Highlight Box */}
          <div className="mt-5 rounded-2xl border bg-linear-to-br from-muted/50 to-muted/10 p-5 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-foreground">{taka(product.suggestedPrice)}</span>
              <span className="text-sm font-medium text-muted-foreground">/ প্রতি পিস</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">ক্যাশ অন ডেলিভারি সুবিধা প্রদান করা হয়</p>
          </div>

          {/* Variant Selectors */}
          <div className="mt-6 space-y-5">
            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div>
                <p className="mb-2.5 text-sm font-semibold">
                  রং সিলেক্ট করুন: <span className="font-normal text-muted-foreground">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
                        selectedColor === col
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-input hover:bg-muted/50"
                      }`}
                    >
                      {selectedColor === col && <Check className="size-3.5" />}
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div>
                <p className="mb-2.5 text-sm font-semibold">
                  সাইজ সিলেক্ট করুন: <span className="font-normal text-muted-foreground">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {availableSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-12 rounded-lg border py-1.5 text-center text-sm font-semibold transition ${
                        selectedSize === s
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-input hover:bg-muted/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Controller */}
            <div>
              <p className="mb-2.5 text-sm font-semibold">পরিমাণ</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border bg-background p-1 shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    disabled={!product.inStock}
                  >
                    <Minus className="size-3.5" />
                  </Button>
                  <span className="w-10 text-center text-sm font-semibold tabular-nums">{bn(qty)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg"
                    onClick={() => setQty(qty + 1)}
                    disabled={!product.inStock}
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Buy CTA */}
          <div className="mt-8">
            <Button
              size="lg"
              className="h-13 w-full rounded-xl bg-primary text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:opacity-95"
              disabled={!product.inStock}
            >
              এখনই অর্ডার করুন
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>

          {/* Delivery & Guarantees */}
          <Card className="mt-6 overflow-hidden border-muted bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Truck className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">ডেলিভারি এলাকা</p>
                    <p className="text-xs text-muted-foreground">চার্জ বেছে নিন</p>
                  </div>
                </div>

                <div className="flex rounded-lg border bg-muted/30 p-1">
                  {[
                    ["inside", "ঢাকা শহর"],
                    ["outside", "ঢাকার বাইরে"],
                  ].map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setZone(k as "inside" | "outside")}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                        zone === k
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
                শিপিং চার্জ: <span className="font-bold text-foreground">{taka(shipping)}</span>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-2"><Banknote className="size-4 text-emerald-600" /> ক্যাশ অন ডেলিভারি</div>
                <div className="flex items-center gap-2"><RotateCcw className="size-4 text-emerald-600" /> ৭ দিনে রিটার্ন সুবিধা</div>
                <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-emerald-600" /> ১০০% অরিজিনাল প্রোডাক্ট</div>
                <div className="flex items-center gap-2"><Check className="size-4 text-emerald-600" /> কোয়ালিটি গ্যারান্টি</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ---------- Description Tabs ---------- */}
      <Tabs defaultValue="desc" className="mt-12">
        <TabsList className="bg-transparent p-0 border-b w-full justify-start rounded-none h-auto gap-6">
          <TabsTrigger
            value="desc"
            className="border-b-2 border-transparent px-1 pb-3 pt-0 rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-base"
          >
            পণ্যের বিবরণ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desc" className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          <p>{product.description}</p>
        </TabsContent>
      </Tabs>
      {/* ---------- Mobile Sticky CTA ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur-md sm:hidden shadow-lg">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <span className="text-xs text-muted-foreground">মোট দাম:</span>
            <p className="text-lg font-extrabold text-foreground">{taka(product.suggestedPrice * qty)}</p>
          </div>
          <Button
            className="flex-1 rounded-xl font-semibold shadow-md"
            disabled={!product.inStock}
          >
            এখনই অর্ডার করুন
          </Button>
        </div>
      </div>
    </main>
  );
}
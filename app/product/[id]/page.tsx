"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import {
  Heart,
  Share2,
  Minus,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Banknote,
  ChevronRight,
  ImageIcon,
  Check,
  ArrowRight,
  Search,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import bangladeshDistrictsData from "../../../lib/bangladeshDistrictsData";

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
        "**১০০% খাঁটি কটন ফেব্রিক** দিয়ে তৈরি। গরমে অত্যন্ত আরামদায়ক এবং যেকোনো উৎসব বা অনুষ্ঠানে পরার জন্য মানানসই।\n\n- সূক্ষ্ম ফিনিশিং ও প্রিমিয়াম লুকিং স্টিচ\n- চমৎকার আভিজাত্য\n- সহজ যত্ন ও ধরণীয়",
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
    outsideDhaka: 120,
  },
};

const bn = (n: number) => n.toLocaleString("bn-BD");
const taka = (n: number) => `৳${bn(n)}`;

export default function ProductPage() {
  const product = apiData.data[0];
  const deliveryCharges = apiData.deliveryCharges;

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);

  // Magnify zoom states
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Customer Information states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  // Address and District filter states
  const [selectedZila, setSelectedZila] = useState<string | null>("ঢাকা");
  const [selectedThana, setSelectedThana] = useState<string | null>("");
  const [zilaSearch, setZilaSearch] = useState<string>("");
  const [thanaSearch, setThanaSearch] = useState<string>("");
  const [fullAddress, setFullAddress] = useState<string>("");

  // Extract Unique Colors and Sizes
  const availableColors = Array.from(
    new Set(product.variants.map((v) => v.color).filter(Boolean)),
  ) as string[];

  const availableSizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter(Boolean)),
  ) as string[];

  const [selectedColor, setSelectedColor] = useState<string | null>(
    availableColors[0] || null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    availableSizes[0] || null,
  );

  // Delivery charge calculation based on Zila
  const isInsideDhaka = selectedZila === "ঢাকা";
  const shipping = isInsideDhaka
    ? deliveryCharges.insideDhaka
    : deliveryCharges.outsideDhaka;

  // Filtered districts & thanas for search
  const filteredZilas = useMemo(() => {
    return bangladeshDistrictsData.filter((z) =>
      z.name.toLowerCase().includes(zilaSearch.toLowerCase()),
    );
  }, [zilaSearch]);

  const currentThanas = useMemo(() => {
    const zilaObj = bangladeshDistrictsData.find(
      (z) => z.name === selectedZila,
    );
    if (!zilaObj) return [];
    return zilaObj.thanas.filter((t) =>
      t.toLowerCase().includes(thanaSearch.toLowerCase()),
    );
  }, [selectedZila, thanaSearch]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 lg:pb-16 text-foreground bg-background">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Link href="/" className="transition hover:text-foreground">
          হোম
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 font-medium text-foreground">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-start">
        {/* ---------- Image Gallery (Fixed mobile scroll issue by changing sticky to lg:sticky) ---------- */}
        <div className="flex flex-col-reverse gap-3 md:flex-row lg:sticky lg:top-6">
          {product.images.length > 1 && (
            <div className="flex gap-3 md:flex-col overflow-x-auto md:overflow-visible">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  aria-label={`ছবি ${bn(i + 1)}`}
                  className={`relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted transition ${
                    activeImg === i
                      ? "border-primary ring-2 ring-primary/20"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Fixed aspect ratio container */}
          <div
            className="relative w-full aspect-4/5 max-h-125 flex items-center justify-center overflow-hidden rounded-2xl border bg-muted/30 shadow-sm cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[activeImg] || product.images[0]}
                alt={product.name}
                fill
                className={`object-cover transition-transform duration-100 ${
                  isZoomed ? "scale-150" : "scale-100"
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      }
                    : undefined
                }
                priority
              />
            ) : (
              <ImageIcon className="size-16 text-muted-foreground/40" />
            )}

            {!product.inStock ? (
              <Badge
                variant="destructive"
                className="absolute left-4 top-4 text-xs font-semibold uppercase"
              >
                স্টক আউট
              </Badge>
            ) : (
              <Badge className="absolute left-4 top-4 bg-emerald-600 hover:bg-emerald-700 text-xs font-medium text-white">
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
                <Heart
                  className={`size-4 ${wished ? "fill-destructive text-destructive" : ""}`}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="size-9 rounded-full shadow-md backdrop-blur-sm"
                aria-label="শেয়ার"
              >
                <Share2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- Product Info & Checkout Form ---------- */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-mono tracking-wider text-muted-foreground">
            পণ্য আইডি: #{product.id}
          </span>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-4xl">
            {product.name}
          </h1>

          {/* Pricing Highlight Box (Redesigned for better look) */}
          <div className="mt-5 rounded-2xl border bg-primary/5 p-5 shadow-sm border-primary/20">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-extrabold text-primary">
                  {taka(product.suggestedPrice)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  / পিস
                </span>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary bg-background font-medium">
                ডিসকাউন্ট মূল্য
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <Check className="size-3.5 text-emerald-600" /> ক্যাশ অন ডেলিভারি এবং সহজ রিটার্ন সুবিধা
            </p>
          </div>

          {/* Variant Selectors */}
          <div className="mt-6 space-y-5">
            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div>
                <p className="mb-2.5 text-sm font-semibold">
                  রং সিলেক্ট করুন:{" "}
                  <span className="font-normal text-muted-foreground">
                    {selectedColor}
                  </span>
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
                  সাইজ সিলেক্ট করুন:{" "}
                  <span className="font-normal text-muted-foreground">
                    {selectedSize}
                  </span>
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
                  <span className="w-10 text-center text-sm font-semibold tabular-nums">
                    {bn(qty)}
                  </span>
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

            {/* Customer Information Form Section */}
            <div className="space-y-4 rounded-2xl border p-4 bg-muted/20">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="size-4 text-primary" /> ক্রেতার তথ্য (Customer Information)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">আপনার নাম *</Label>
                  <Input
                    placeholder="পূর্ণ নাম লিখুন"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">মোবাইল নম্বর *</Label>
                  <Input
                    placeholder="01XXXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">ইমেইল (ঐচ্ছিক / Optional)</Label>
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Shipping & Address Form Section */}
            <div className="space-y-4 rounded-2xl border p-4 bg-muted/20">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="size-4 text-primary" /> শিপিং ও ঠিকানা (Shipping Address)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zila Dropdown with Search */}
                <div className="space-y-1.5">
                  <Label className="text-xs">জেলা (Zila) *</Label>
                  <Select
                    value={selectedZila}
                    onValueChange={(val) => setSelectedZila(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="জেলা সিলেক্ট করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                          <Input
                            placeholder="জেলা খুঁজুন..."
                            value={zilaSearch}
                            onChange={(e) => setZilaSearch(e.target.value)}
                            className="pl-8 h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredZilas.map((zila) => (
                          <SelectItem key={zila.id} value={zila.name}>
                            {zila.name}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {/* Thana/District Dropdown with Search */}
                <div className="space-y-1.5">
                  <Label className="text-xs">থানা / উপজেলা (Thana)</Label>
                  <Select
                    value={selectedThana}
                    onValueChange={(val) => setSelectedThana(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="থানা সিলেক্ট করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                          <Input
                            placeholder="থানা খুঁজুন..."
                            value={thanaSearch}
                            onChange={(e) => setThanaSearch(e.target.value)}
                            className="pl-8 h-8 text-xs"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {currentThanas.map((thana, idx) => (
                          <SelectItem key={idx} value={thana}>
                            {thana}
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Full Address Field */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  সম্পূর্ণ ঠিকানা (Full Address) *
                </Label>
                <Input
                  placeholder="বাসা নং, রোড নং, এলাকা বা গ্রাম..."
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Customer Note Field */}
              <div className="space-y-1.5">
                <Label className="text-xs">
                  অর্ডার নোট (Customer Note - ঐচ্ছিক)
                </Label>
                <Textarea
                  placeholder="পণ্য সম্পর্কে বিশেষ কোনো নির্দেশনা থাকলে এখানে লিখুন..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="text-xs resize-none h-16"
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1 border-t">
                <span className="text-muted-foreground">
                  ডেলিভারি চার্জ ({selectedZila}):
                </span>
                <span className="font-bold text-foreground">
                  {taka(shipping)}
                </span>
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
              এখনই অর্ডার করুন ({taka(product.suggestedPrice * qty + shipping)})
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>

          {/* Delivery & Guarantees */}
          <Card className="mt-6 overflow-hidden border-muted bg-card">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Banknote className="size-4 text-emerald-600" /> ক্যাশ অন ডেলিভারি
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="size-4 text-emerald-600" /> ৭ দিনে রিটার্ন সুবিধা
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-600" /> ১০০% অরিজিনাল প্রোডাক্ট
                </div>
                <div className="flex items-center gap-2">
                  <Check className="size-4 text-emerald-600" /> কোয়ালিটি গ্যারান্টি
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ---------- Description Tabs with Enhanced Styling (Fixed styling issue) ---------- */}
      <Tabs defaultValue="desc" className="mt-16">
        <TabsList className="bg-transparent p-0 border-b w-full justify-start rounded-none h-auto gap-6">
          <TabsTrigger
            value="desc"
            className="border-b-2 border-transparent px-1 pb-3 pt-0 rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-bold text-base"
          >
            পণ্যের বিবরণ
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="desc"
          className="mt-6 rounded-2xl border bg-card p-6 md:p-8 shadow-sm max-w-4xl text-sm md:text-base leading-relaxed text-foreground prose dark:prose-invert"
        >
          <ReactMarkdown>{product.description}</ReactMarkdown>
        </TabsContent>
      </Tabs>

      {/* ---------- Mobile Sticky CTA ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur-md sm:hidden shadow-lg">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <span className="text-xs text-muted-foreground">মোট দাম:</span>
            <p className="text-base font-extrabold text-foreground">
              {taka(product.suggestedPrice * qty + shipping)}
            </p>
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
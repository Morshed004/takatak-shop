"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image"; // Renamed to avoid TS conflict with HTML Image
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Heart,
  Share2,
  Minus,
  Plus,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
interface ProductImage {
  id: string;
  url: string;
}

interface Variant {
  id: string;
  color?: string | null;
  size?: string | null;
  inStock: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  inStock: boolean;
  images: ProductImage[];
  variants: Variant[];
}

const bn = (n: number) => n.toLocaleString("bn-BD");
const taka = (n: number) => `৳${bn(n)}`;

const deliveryCharges = {
  insideDhaka: 70,
  outsideDhaka: 120,
};

export default function ProductPage() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zoom states
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Customer Information states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  // Address states
  const [selectedZila, setSelectedZila] = useState<string | null>("ঢাকা");
  const [selectedThana, setSelectedThana] = useState<string | null>("");
  const [zilaSearch, setZilaSearch] = useState<string>("");
  const [thanaSearch, setThanaSearch] = useState<string>("");
  const [fullAddress, setFullAddress] = useState<string>("");

  // Variants states
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/products`, {
          method: 'GET',
          headers: {
            'x-app-secret': process.env.NEXT_PUBLIC_APP_SECRET || '',
          },
          next: { revalidate: 600 }
        });

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const found = result.data.find((p: Product) => p.id === productId) || result.data[0];
          setProduct(found || null);

          if (found && found.variants && found.variants.length > 0) {
            const colors = Array.from(new Set(found.variants.map((v: Variant) => v.color).filter(Boolean)));
            const sizes = Array.from(new Set(found.variants.map((v: Variant) => v.size).filter(Boolean)));
            if (colors.length > 0) setSelectedColor(colors[0] as string);
            if (sizes.length > 0) setSelectedSize(sizes[0] as string);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[];
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean))) as string[];
  }, [product]);

  const isInsideDhaka = selectedZila === "ঢাকা";
  const shipping = isInsideDhaka ? deliveryCharges.insideDhaka : deliveryCharges.outsideDhaka;

  const filteredZilas = useMemo(() => {
    return bangladeshDistrictsData.filter((z) =>
      z.name.toLowerCase().includes(zilaSearch.toLowerCase()),
    );
  }, [zilaSearch]);

  const currentThanas = useMemo(() => {
    const zilaObj = bangladeshDistrictsData.find((z) => z.name === selectedZila);
    if (!zilaObj) return [];
    return zilaObj.thanas.filter((t) =>
      t.toLowerCase().includes(thanaSearch.toLowerCase()),
    );
  }, [selectedZila, thanaSearch]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  // Form Validation and Order Handler
  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Check Name
    if (!customerName.trim()) {
      alert("দয়া করে আপনার নাম লিখুন।");
      return;
    }

    // 2. Check Phone Number (11 digits Bangladeshi format)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      alert("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)।");
      return;
    }

    // 3. Check Zila
    if (!selectedZila) {
      alert("দয়া করে আপনার জেলা সিলেক্ট করুন।");
      return;
    }

    // 4. Check Full Address
    if (!fullAddress.trim()) {
      alert("দয়া করে আপনার সম্পূর্ণ ঠিকানা (বাসা নং, রোড, এলাকা) লিখুন।");
      return;
    }

    // 5. Check Color Variant if available
    if (availableColors.length > 0 && !selectedColor) {
      alert("দয়া করে প্রোডাক্টের রং (Color) সিলেক্ট করুন।");
      return;
    }

    // 6. Check Size Variant if available
    if (availableSizes.length > 0 && !selectedSize) {
      alert("দয়া করে প্রোডাক্টের সাইজ (Size) সিলেক্ট করুন।");
      return;
    }

    // All validations passed! Proceed with Order submission
    setIsSubmitting(true);
    
    // Order payload data
    const orderData = {
      productId: product?.id,
      productName: product?.name,
      price: product?.price,
      quantity: qty,
      color: selectedColor,
      size: selectedSize,
      customerName,
      customerPhone,
      customerEmail,
      zila: selectedZila,
      thana: selectedThana,
      fullAddress,
      customerNote,
      shippingCost: shipping,
      totalAmount: (product?.price || 0) * qty + shipping,
    };

    console.log("Order Submitted Data:", orderData);
    
    setTimeout(() => {
      alert("আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে! ধন্যবাদ।");
      setIsSubmitting(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <p>লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold text-muted-foreground">প্রোডাক্টটি খুঁজে পাওয়া যায়নি!</p>
        <Link href="/">
          <Button>হোম পেজে ফিরে যান</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-32 pt-4 sm:pt-6 lg:pb-16 text-foreground bg-background">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-1"
      >
        <Link href="/" className="transition hover:text-foreground">
          হোম
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="line-clamp-1 font-medium text-foreground">
          {product.name}
        </span>
      </nav>

      {/* Wrap everything in form for validation */}
      <form onSubmit={handleOrderSubmit}>
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 items-start">
          {/* ---------- Image Gallery ---------- */}
          <div className="flex flex-col-reverse gap-3 md:flex-row lg:sticky lg:top-6">
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
                {product.images.map((img, i) => (
                  <button
                    key={img.id || i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`ছবি ${bn(i + 1)}`}
                    className={`relative flex size-16 sm:size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted transition ${
                      activeImg === i
                        ? "border-primary ring-2 ring-primary/20"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <NextImage
                      src={img.url}
                      alt={`Thumbnail ${i + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Display Image */}
            <div
              className="relative w-full aspect-square sm:aspect-4/5 max-h-[450px] sm:max-h-[500px] flex items-center justify-center overflow-hidden rounded-2xl border bg-card/50 shadow-sm cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {product.images && product.images.length > 0 ? (
                <NextImage
                  src={product.images[activeImg]?.url || product.images[0].url}
                  alt={product.name}
                  fill
                  className={`object-contain p-2 transition-transform duration-100 ${
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
            </div>
          </div>

          {/* ---------- Product Info & Checkout Form ---------- */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-mono tracking-wider text-muted-foreground">
              পণ্য আইডি: #{product.id}
            </span>
            <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Pricing Highlight Box */}
            <div className="mt-4 sm:mt-5 rounded-2xl border bg-primary/5 p-4 sm:p-5 border-primary/20">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary">
                    {taka(product.price)}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                    / পিস
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary bg-background font-medium text-xs"
                >
                  মূল্য
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600 shrink-0" /> ক্যাশ অন ডেলিভারি
                এবং সহজ রিটার্ন সুবিধা
              </p>
            </div>

            {/* Variant Selectors */}
            <div className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">
              {/* Color Selector */}
              {availableColors.length > 0 && (
                <div>
                  <p className="mb-2 text-xs sm:text-sm font-semibold">
                    রং সিলেক্ট করুন <span className="text-destructive">*</span>:{" "}
                    <span className="font-normal text-muted-foreground">
                      {selectedColor || "সিলেক্ট করা হয়নি"}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 bg-card text-xs sm:text-sm font-medium transition ${
                          selectedColor === col
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                            : "border-input hover:bg-muted/50"
                        }`}
                      >
                        {selectedColor === col && <Check className="size-3" />}
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {availableSizes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs sm:text-sm font-semibold">
                    সাইজ সিলেক্ট করুন <span className="text-destructive">*</span>:{" "}
                    <span className="font-normal text-muted-foreground">
                      {selectedSize || "সিলেক্ট করা হয়নি"}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-10 sm:min-w-12 rounded-lg bg-card border py-1.5 px-3 text-center text-xs sm:text-sm font-semibold transition ${
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
                <p className="mb-2 text-xs sm:text-sm font-semibold">পরিমাণ</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border bg-card p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 sm:size-8 rounded-lg"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={!product.inStock}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-semibold tabular-nums">
                      {bn(qty)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 sm:size-8 rounded-lg"
                      onClick={() => setQty(qty + 1)}
                      disabled={!product.inStock}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Customer Information Form */}
              <div className="space-y-3 sm:space-y-4 rounded-2xl border p-3.5 sm:p-4 bg-card">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <User className="size-4 text-primary shrink-0" /> ক্রেতার তথ্য (Customer Information)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">আপনার নাম <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="পূর্ণ নাম লিখুন"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="text-xs h-9 sm:h-10"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">মোবাইল নম্বর <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="01XXXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="text-xs h-9 sm:h-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">ইমেইল (ঐচ্ছিক)</Label>
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="text-xs h-9 sm:h-10"
                  />
                </div>
              </div>

              {/* Shipping & Address Form */}
              <div className="space-y-3 sm:space-y-4 rounded-2xl border p-3.5 sm:p-4 bg-card">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <MapPin className="size-4 text-primary shrink-0" /> শিপিং ও ঠিকানা (Shipping Address)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Zila Dropdown */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">জেলা (Zila) <span className="text-destructive">*</span></Label>
                    <Select
                      value={selectedZila || ""}
                      onValueChange={(val) => setSelectedZila(val)}
                    >
                      <SelectTrigger className="w-full h-9 sm:h-10 text-xs">
                        <SelectValue placeholder="জেলা সিলেক্ট করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                            <Input
                              placeholder="জেলা খুঁজুন..."
                              value={zilaSearch}
                              onChange={(e) => setZilaSearch(e.target.value)}
                              className="pl-7 h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredZilas.map((zila) => (
                            <SelectItem key={zila.id} value={zila.name} className="text-xs">
                              {zila.name}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Thana Dropdown */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">থানা / উপজেলা (Thana)</Label>
                    <Select
                      value={selectedThana || ""}
                      onValueChange={(val) => setSelectedThana(val)}
                    >
                      <SelectTrigger className="w-full h-9 sm:h-10 text-xs">
                        <SelectValue placeholder="থানা সিলেক্ট করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                            <Input
                              placeholder="থানা খুঁজুন..."
                              value={thanaSearch}
                              onChange={(e) => setThanaSearch(e.target.value)}
                              className="pl-7 h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {currentThanas.map((thana, idx) => (
                            <SelectItem key={idx} value={thana} className="text-xs">
                              {thana}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Full Address */}
                <div className="space-y-1.5">
                  <Label className="text-xs">সম্পূর্ণ ঠিকানা (Full Address) <span className="text-destructive">*</span></Label>
                  <Input
                    placeholder="বাসা নং, রোড নং, এলাকা বা গ্রাম..."
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="text-xs h-9 sm:h-10"
                    required
                  />
                </div>

                {/* Customer Note */}
                <div className="space-y-1.5">
                  <Label className="text-xs">অর্ডার নোট (ঐচ্ছিক)</Label>
                  <Textarea
                    placeholder="বিশেষ নির্দেশনা..."
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="text-xs resize-none h-16"
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t">
                  <span className="text-muted-foreground">ডেলিভারি চার্জ ({selectedZila}):</span>
                  <span className="font-bold text-foreground">{taka(shipping)}</span>
                </div>
              </div>
            </div>

            {/* Desktop Buy Button */}
            <div className="mt-6 hidden sm:block">
              <Button
                type="submit"
                size="lg"
                className="h-12 w-full rounded-xl bg-primary text-base font-semibold transition-all hover:shadow-xl hover:opacity-95"
                disabled={!product.inStock || isSubmitting}
              >
                {isSubmitting ? "প্রসেসিং হচ্ছে..." : `এখনই অর্ডার করুন (${taka(product.price * qty + shipping)})`}
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>

            {/* Guarantees Grid */}
            <Card className="mt-6 overflow-hidden border-muted bg-card">
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Banknote className="size-4 text-emerald-600 shrink-0" /> ক্যাশ অন ডেলিভারি
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="size-4 text-emerald-600 shrink-0" /> ৭ দিনে রিটার্ন
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" /> ১০০% অরিজিনাল
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600 shrink-0" /> কোয়ালিটি গ্যারান্টি
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ---------- Description Section ---------- */}
        {product.description && (
          <div className="mt-12 sm:mt-16 max-w-4xl">
            <div className="pb-3">
              <h3 className="font-bold text-sm sm:text-base text-foreground border-b-2 border-primary inline-block pb-2.5">
                পণ্যের বিবরণ
              </h3>
            </div>

            <div className="mt-4 sm:mt-6 rounded-2xl border bg-card p-4 sm:p-6 md:p-8 text-xs sm:text-sm md:text-base leading-relaxed text-foreground whitespace-pre-line prose dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {product.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* ---------- Mobile Sticky CTA Footer ---------- */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur-md sm:hidden shadow-lg">
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <span className="text-[10px] text-muted-foreground block">মোট দাম:</span>
              <span className="text-sm font-extrabold text-foreground">
                {taka(product.price * qty + shipping)}
              </span>
            </div>
            <Button
              type="submit"
              className="flex-1 rounded-xl font-semibold h-10 text-xs shadow-md"
              disabled={!product.inStock || isSubmitting}
            >
              {isSubmitting ? "প্রসেসিং..." : "এখনই অর্ডার করুন"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
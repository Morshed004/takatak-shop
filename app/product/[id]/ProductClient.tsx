"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  CreditCard,
  ImageIcon,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { z } from "zod";

import bangladeshDistrictsData from "../../../lib/bangladeshDistrictsData";

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

// Merchant or personal numbers for receiving delivery charge advance
const merchantNumbers = {
  bkash: "01927537990",
  nagad: "01609090571",
  rocket: "016090905714",
};

// Zod Validation Schema definition
const phoneRegex = /^01[3-9]\d{8}$/;
const orderFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters."),
  customerPhone: z
    .string()
    .regex(phoneRegex, "Invalid 11-digit mobile number."),
  customerEmail: z.email("Invalid email address.").optional().or(z.literal("")),
  selectedZila: z.string().min(1, "Zila is required."),
  selectedThana: z.string().optional(),
  fullAddress: z.string().min(5, "Full address is required."),
  customerNote: z.string().optional(),
  paymentMethod: z.enum(["bkash", "nagad", "rocket"]),
  senderNumber: z.string().regex(phoneRegex, "Invalid sender mobile number."),
  trxId: z.string().min(3, "Transaction ID is required."),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

export default function ProductClient() {
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Order Success States
  const [isSuccess, setIsSuccess] = useState(false);
  const [successOrderInfo, setSuccessOrderInfo] = useState<{
    orderNumber: string;
    total: number;
  } | null>(null);

  // Zoom states
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Variants states
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Address search states
  const [zilaSearch, setZilaSearch] = useState<string>("");
  const [thanaSearch, setThanaSearch] = useState<string>("");

  // React Hook Form Setup with Zod Resolver
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      selectedZila: "ঢাকা",
      paymentMethod: "bkash",
    },
  });

  const selectedZila = watch("selectedZila");
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const response = await fetch(`${baseUrl}/api/products`, {
          method: "GET",
          headers: {
            "x-app-secret": process.env.NEXT_PUBLIC_APP_SECRET || "",
          },
          next: { revalidate: 300 },
        });

        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const found =
            result.data.find((p: Product) => p.id === productId) ||
            result.data[0];
          setProduct(found || null);

          if (found && found.variants && found.variants.length > 0) {
            const colors = Array.from(
              new Set(
                found.variants.map((v: Variant) => v.color).filter(Boolean),
              ),
            );
            const sizes = Array.from(
              new Set(
                found.variants.map((v: Variant) => v.size).filter(Boolean),
              ),
            );
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
    return Array.from(
      new Set(product.variants.map((v) => v.color).filter(Boolean)),
    ) as string[];
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(
      new Set(product.variants.map((v) => v.size).filter(Boolean)),
    ) as string[];
  }, [product]);

  const isInsideDhaka = selectedZila === "ঢাকা";
  const shipping = isInsideDhaka
    ? deliveryCharges.insideDhaka
    : deliveryCharges.outsideDhaka;

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

  // Form Submit Handler
  const onSubmit = async (data: OrderFormValues) => {
    // Variant checks
    if (availableColors.length > 0 && !selectedColor) {
      alert("Please select a product color.");
      return;
    }

    if (availableSizes.length > 0 && !selectedSize) {
      alert("Please select a product size.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        productId: product?.id,
        productName: product?.name,
        price: product?.price,
        quantity: qty,
        color: selectedColor,
        size: selectedSize,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        zila: data.selectedZila,
        thana: data.selectedThana,
        fullAddress: data.fullAddress,
        customerNote: data.customerNote,
        shippingCost: shipping,
        paymentMethod: data.paymentMethod.toUpperCase(), // BKASH, NAGAD, ROCKET
        senderNumber: data.senderNumber,
        trxId: data.trxId,
        totalAmount: (product?.price || 0) * qty + shipping,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-secret": process.env.NEXT_PUBLIC_APP_SECRET || "",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to place order.");
      }

      // Success: Save order details, show success screen & reset form
      setSuccessOrderInfo({
        orderNumber: result.data.orderNumber,
        total: (product?.price || 0) * qty + shipping,
      });
      setIsSuccess(true);
      reset(); // Reset form fields
      setQty(1); // Reset quantity

    } catch (error: any) {
      console.error("Error:", error);
      alert(error.message || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-lg font-semibold text-muted-foreground">
          Product not found!
        </p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  // Success Screen View
  if (isSuccess && successOrderInfo) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center bg-background text-foreground">
        <div className="rounded-3xl border bg-card p-8 shadow-sm space-y-6">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check className="size-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Order Placed Successfully!</h1>
            <p className="text-sm text-muted-foreground">
              Thank you for your order. We have received your payment information and will verify your TrxID shortly.
            </p>
          </div>

          <div className="rounded-2xl bg-muted/50 p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Number:</span>
              <span className="font-mono font-bold text-foreground">{successOrderInfo.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold text-primary">{taka(successOrderInfo.total)}</span>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl">
                Return Home
              </Button>
            </Link>
            <Button
              className="flex-1 rounded-xl"
              onClick={() => {
                setIsSuccess(false);
                setSuccessOrderInfo(null);
              }}
            >
              Order Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-32 pt-4 sm:pt-6 lg:pb-16 text-foreground bg-background">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="breadcrumb"
        className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap pb-1"
      >
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="line-clamp-1 font-medium text-foreground">
          {product.name}
        </span>
      </nav>

      {/* React Hook Form handleSubmit */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 items-start">
          {/* Image Gallery Section */}
          <div className="flex flex-col-reverse gap-3 md:flex-row lg:sticky lg:top-6">
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
                {product.images.map((img, i) => (
                  <button
                    key={img.id || i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`Image ${bn(i + 1)}`}
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
              className="relative w-full aspect-square sm:aspect-4/5 max-h-112.5 sm:max-h-125 flex items-center justify-center overflow-hidden rounded-2xl border bg-card/50 shadow-sm cursor-zoom-in"
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

          {/* Product Info & Checkout Form Section */}
          <div className="flex flex-col justify-center">
            <span className="text-xs font-mono tracking-wider text-muted-foreground">
              Product ID: #{product.id}
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
                    / piece
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="border-primary/30 text-primary bg-background font-medium text-xs"
                >
                  Price
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                <Check className="size-3.5 text-emerald-600 shrink-0" /> Product
                price is Cash on Delivery (COD), delivery charge is advance
                payable
              </p>
            </div>

            {/* Variant Selectors */}
            <div className="mt-5 sm:mt-6 space-y-4 sm:space-y-5">
              {/* Color Selector */}
              {availableColors.length > 0 && (
                <div>
                  <p className="mb-2 text-xs sm:text-sm font-semibold">
                    Select Color <span className="text-destructive">*</span>:{" "}
                    <span className="font-normal text-muted-foreground">
                      {selectedColor || "Not selected"}
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
                    Select Size <span className="text-destructive">*</span>:{" "}
                    <span className="font-normal text-muted-foreground">
                      {selectedSize || "Not selected"}
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
                <p className="mb-2 text-xs sm:text-sm font-semibold">
                  Quantity
                </p>
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
                  <User className="size-4 text-primary shrink-0" /> Customer
                  Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Your Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Enter full name"
                      {...register("customerName")}
                      className="text-xs h-9 sm:h-10"
                    />
                    {errors.customerName && (
                      <p className="text-[10px] text-destructive">
                        {errors.customerName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="01XXXXXXXXX"
                      {...register("customerPhone")}
                      className="text-xs h-9 sm:h-10"
                    />
                    {errors.customerPhone && (
                      <p className="text-[10px] text-destructive">
                        {errors.customerPhone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="example@gmail.com"
                    {...register("customerEmail")}
                    className="text-xs h-9 sm:h-10"
                  />
                  {errors.customerEmail && (
                    <p className="text-[10px] text-destructive">
                      {errors.customerEmail.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping & Address Form */}
              <div className="space-y-3 sm:space-y-4 rounded-2xl border p-3.5 sm:p-4 bg-card">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <MapPin className="size-4 text-primary shrink-0" /> Shipping &
                  Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Zila Dropdown */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Zila <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={selectedZila || ""}
                      onValueChange={(val) =>
                        setValue("selectedZila", val!, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="w-full h-9 sm:h-10 text-xs">
                        <SelectValue placeholder="Select zila" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Search zila..."
                              value={zilaSearch}
                              onChange={(e) => setZilaSearch(e.target.value)}
                              className="pl-7 h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredZilas.map((zila) => (
                            <SelectItem
                              key={zila.id}
                              value={zila.name}
                              className="text-xs"
                            >
                              {zila.name}
                            </SelectItem>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                    {errors.selectedZila && (
                      <p className="text-[10px] text-destructive">
                        {errors.selectedZila.message}
                      </p>
                    )}
                  </div>

                  {/* Thana Dropdown */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Thana / Upazila</Label>
                    <Select
                      onValueChange={(val) =>
                        setValue("selectedThana", val as string, {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger className="w-full h-9 sm:h-10 text-xs">
                        <SelectValue placeholder="Select thana" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                            <Input
                              placeholder="Search thana..."
                              value={thanaSearch}
                              onChange={(e) => setThanaSearch(e.target.value)}
                              className="pl-7 h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {currentThanas.map((thana, idx) => (
                            <SelectItem
                              key={idx}
                              value={thana}
                              className="text-xs"
                            >
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
                  <Label className="text-xs">
                    Full Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="House no, road, area or village..."
                    {...register("fullAddress")}
                    className="text-xs h-9 sm:h-10"
                  />
                  {errors.fullAddress && (
                    <p className="text-[10px] text-destructive">
                      {errors.fullAddress.message}
                    </p>
                  )}
                </div>

                {/* Customer Note */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Order Note (Optional)</Label>
                  <Textarea
                    placeholder="Special instructions..."
                    {...register("customerNote")}
                    className="text-xs resize-none h-16"
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t">
                  <span className="text-muted-foreground">
                    Delivery Charge ({selectedZila}):
                  </span>
                  <span className="font-bold text-foreground">
                    {taka(shipping)}
                  </span>
                </div>
              </div>

              {/* Payment Gateway Selection Section */}
              <div className="space-y-3 sm:space-y-4 rounded-2xl border p-3.5 sm:p-4 bg-card">
                <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="size-4 text-primary shrink-0" />{" "}
                  Delivery Charge Payment{" "}
                  <span className="text-destructive">*</span>
                </h3>

                <p className="text-xs text-muted-foreground">
                  Please pay the delivery charge (
                  <span className="font-semibold text-foreground">
                    {taka(shipping)}
                  </span>
                  ) via one of the payment methods below and provide your
                  details. Product price is Cash on Delivery (COD).
                </p>

                {/* Payment Option Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setValue("paymentMethod", "bkash", {
                        shouldValidate: true,
                      })
                    }
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition ${
                      paymentMethod === "bkash"
                        ? "border-[#E2136E] bg-[#E2136E]/10 text-[#E2136E] ring-2 ring-[#E2136E]/20"
                        : "border-input bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="tracking-wide">bKash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setValue("paymentMethod", "nagad", {
                        shouldValidate: true,
                      })
                    }
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition ${
                      paymentMethod === "nagad"
                        ? "border-[#EC1C24] bg-[#EC1C24]/10 text-[#EC1C24] ring-2 ring-[#EC1C24]/20"
                        : "border-input bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="tracking-wide">Nagad</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setValue("paymentMethod", "rocket", {
                        shouldValidate: true,
                      })
                    }
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition ${
                      paymentMethod === "rocket"
                        ? "border-[#8C349B] bg-[#8C349B]/10 text-[#8C349B] ring-2 ring-[#8C349B]/20"
                        : "border-input bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className="tracking-wide">Rocket</span>
                  </button>
                </div>

                {/* Dynamic Instructions & Input Fields */}
                <div
                  className="rounded-xl p-3 text-xs space-y-3 transition-all border"
                  style={{
                    backgroundColor:
                      paymentMethod === "bkash"
                        ? "#E2136E08"
                        : paymentMethod === "nagad"
                          ? "#EC1C2408"
                          : "#8C349B08",
                    borderColor:
                      paymentMethod === "bkash"
                        ? "#E2136E40"
                        : paymentMethod === "nagad"
                          ? "#EC1C2440"
                          : "#8C349B40",
                  }}
                >
                  <div className="font-medium leading-relaxed">
                    <p
                      className="font-bold mb-1"
                      style={{
                        color:
                          paymentMethod === "bkash"
                            ? "#E2136E"
                            : paymentMethod === "nagad"
                              ? "#EC1C24"
                              : "#8C349B",
                      }}
                    >
                      {paymentMethod.toUpperCase()} Send Money Instructions:
                    </p>
                    1. Go to your {paymentMethod.toUpperCase()} app or dial
                    *247# to select Send Money.
                    <br />
                    2. Send Money the exact delivery charge{" "}
                    <span className="font-bold underline">
                      {taka(shipping)}
                    </span>{" "}
                    to personal number:
                    <br />
                    <span className="font-mono font-bold text-sm bg-background/80 px-2 py-0.5 rounded border inline-block mt-1">
                      {merchantNumbers[paymentMethod]}
                    </span>
                    <br />
                    3. After successful payment, provide your{" "}
                    {paymentMethod.toUpperCase()} sender number and transaction
                    ID (TrxID) below.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/50">
                    <div className="space-y-1">
                      <Label className="text-[11px]">
                        Sender Mobile Number{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="01XXXXXXXXX"
                        {...register("senderNumber")}
                        className="text-xs h-9 bg-background"
                      />
                      {errors.senderNumber && (
                        <p className="text-[10px] text-destructive">
                          {errors.senderNumber.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">
                        Transaction ID (TrxID){" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="e.g. 9H87G6F5E4"
                        {...register("trxId", {
                          onChange: (e) => {
                            e.target.value = e.target.value.toUpperCase();
                          },
                        })}
                        className="text-xs h-9 font-mono uppercase bg-background"
                      />
                      {errors.trxId && (
                        <p className="text-[10px] text-destructive">
                          {errors.trxId.message}
                        </p>
                      )}
                    </div>
                  </div>
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
                {isSubmitting
                  ? "Processing..."
                  : `Confirm Order (Pay Delivery Charge ${taka(shipping)})`}
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>

            {/* Guarantees Grid */}
            <Card className="mt-6 overflow-hidden border-muted bg-card">
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Banknote className="size-4 text-emerald-600 shrink-0" />{" "}
                    Cash on Delivery (Product Price)
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="size-4 text-emerald-600 shrink-0" />{" "}
                    Check on Delivery – Return for Defects
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />{" "}
                    100% Original
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-4 text-emerald-600 shrink-0" />{" "}
                    Quality Guarantee
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Description Section */}
        {product.description && (
          <div className="mt-12 sm:mt-16 max-w-4xl">
            <div className="pb-3">
              <h3 className="font-bold text-sm sm:text-base text-foreground border-b-2 border-primary inline-block pb-2.5">
                Product Description
              </h3>
            </div>

            <div className="mt-4 sm:mt-6 rounded-2xl border bg-card p-4 sm:p-6 md:p-8 text-xs sm:text-sm md:text-base leading-relaxed text-foreground whitespace-pre-line prose dark:prose-invert">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {product.description}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Mobile Sticky CTA Footer */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur-md sm:hidden shadow-lg">
          <div className="flex items-center gap-3">
            <div className="leading-tight">
              <span className="text-[10px] text-muted-foreground block">
                Delivery Charge:
              </span>
              <span className="text-sm font-extrabold text-foreground">
                {taka(shipping)}
              </span>
            </div>
            <Button
              type="submit"
              className="flex-1 rounded-xl font-semibold h-10 text-xs shadow-md"
              disabled={!product.inStock || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm Order"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
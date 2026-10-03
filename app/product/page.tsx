"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star, Heart, Share2, ShoppingCart, Minus, Plus, Truck, RotateCcw,
  ShieldCheck, Banknote, MessageCircle, ChevronRight, ImageIcon, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ---------- Dummy data (replace with DB / API using params.slug) ---------- */
const product = {
  name: "পুরুষদের প্রিমিয়াম কটন পাঞ্জাবি",
  category: "ফ্যাশন",
  sku: "PNJ-204",
  price: 1450,
  old: 1990,
  rating: 4.7,
  reviews: 328,
  sold: 1240,
  stock: 12,
  colors: [
    { name: "অফ হোয়াইট", value: "#efeadf" },
    { name: "নেভি ব্লু", value: "#1f2a44" },
    { name: "মেরুন", value: "#6b1f2a" },
  ],
  sizes: ["M", "L", "XL", "XXL"],
  highlights: [
    "১০০% খাঁটি কটন, গরমে আরামদায়ক",
    "হাতে করা সুতার এমব্রয়ডারি",
    "ঈদ ও বিয়ের অনুষ্ঠানে মানানসই",
    "প্রথম ধোয়ায় রং উঠবে না",
  ],
  specs: [
    ["ফেব্রিক", "কটন (১০০%)"],
    ["ফিটিং", "রেগুলার ফিট"],
    ["হাতা", "ফুল স্লিভ"],
    ["ধোয়ার নিয়ম", "হালকা ঠান্ডা পানিতে হাতে ধোয়া ভালো"],
    ["উৎপাদন", "বাংলাদেশ"],
  ],
};

const ratingBars = [
  { star: 5, pct: 76 }, { star: 4, pct: 16 }, { star: 3, pct: 5 }, { star: 2, pct: 2 }, { star: 1, pct: 1 },
];

const reviews = [
  { name: "রাফিউল ইসলাম", city: "ঢাকা", rating: 5, date: "১২ মার্চ", text: "কাপড়ের মান অসাধারণ, ছবির সাথে হুবহু মিল। সাইজ ঠিকঠাক এসেছে।" },
  { name: "তানভীর আহমেদ", city: "চট্টগ্রাম", rating: 4, date: "৮ মার্চ", text: "৩ দিনে ডেলিভারি পেয়েছি। প্যাকেজিং ভালো ছিল, রং একটু হালকা মনে হয়েছে।" },
  { name: "সাজ্জাদ হোসেন", city: "সিলেট", rating: 5, date: "২ মার্চ", text: "ঈদের জন্য নিয়েছিলাম, সবাই প্রশংসা করেছে। আবার অর্ডার করব।" },
];

const related = [
  { name: "এমব্রয়ডারি পাঞ্জাবি", price: 1790 },
  { name: "কটন পায়জামা", price: 690 },
  { name: "লেদার স্যান্ডেল", price: 1250 },
  { name: "ফতুয়া (কটন)", price: 990 },
];

const bn = (n: number) => n.toLocaleString("bn-BD");
const taka = (n: number) => `৳${bn(n)}`;

/* ---------- Page ---------- */
export default function ProductPage() {
  const [active, setActive] = useState(0);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [zone, setZone] = useState<"inside" | "outside">("inside");
  const [wished, setWished] = useState(false);

  const off = Math.round(((product.old - product.price) / product.old) * 100);
  const shipping = zone === "inside" ? 60 : 120;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 lg:pb-16">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">হোম</Link>
        <ChevronRight className="size-3.5" />
        <Link href="#" className="hover:text-foreground">{product.category}</Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ---------- Gallery ---------- */}
        <div className="flex flex-col-reverse gap-3 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`ছবি ${bn(i + 1)}`}
                className={`flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted transition md:size-20 ${
                  active === i ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
                }`}
              >
                <ImageIcon className="size-5 text-muted-foreground" />
              </button>
            ))}
          </div>

          <div className="relative flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-xl bg-muted">
            {/* Replace with: <Image src={images[active]} alt={product.name} fill className="object-cover" priority /> */}
            <ImageIcon className="size-16 text-muted-foreground/40" />
            <Badge className="absolute left-4 top-4 text-sm">-{bn(off)}%</Badge>
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <Button
                size="icon" variant="secondary" className="rounded-full"
                aria-label="উইশলিস্ট" onClick={() => setWished(!wished)}
              >
                <Heart className={wished ? "fill-primary text-primary" : ""} />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full" aria-label="শেয়ার"><Share2 /></Button>
            </div>
          </div>
        </div>

        {/* ---------- Buy box ---------- */}
        <div>
          <h1 className="text-2xl font-bold leading-snug md:text-3xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-current text-foreground" />
              <span className="font-semibold text-foreground">{bn(product.rating)}</span>
              ({bn(product.reviews)} রিভিউ)
            </span>
            <span>{bn(product.sold)}+ বিক্রি হয়েছে</span>
            <span>কোড: {product.sku}</span>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-bold">{taka(product.price)}</span>
            <span className="text-lg text-muted-foreground line-through">{taka(product.old)}</span>
            <Badge variant="secondary">আপনার সাশ্রয় {taka(product.old - product.price)}</Badge>
          </div>

          <Separator className="my-6" />

          {/* Color */}
          <div>
            <p className="mb-3 text-sm font-medium">রং: <span className="text-muted-foreground">{product.colors[color].name}</span></p>
            <div className="flex gap-3">
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setColor(i)}
                  aria-label={c.name}
                  style={{ backgroundColor: c.value }}
                  className={`flex size-10 items-center justify-center rounded-full border transition ${
                    color === i ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                >
                  {color === i && <Check className="size-4 text-white mix-blend-difference" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">সাইজ</p>
              <button className="text-sm text-primary hover:underline">সাইজ চার্ট</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <Button
                  key={s}
                  variant={size === s ? "default" : "outline"}
                  className="min-w-14"
                  onClick={() => setSize(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity + stock */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-md border">
              <Button variant="ghost" size="icon" aria-label="কমান" onClick={() => setQty(Math.max(1, qty - 1))}><Minus /></Button>
              <span className="w-10 text-center font-medium tabular-nums">{bn(qty)}</span>
              <Button variant="ghost" size="icon" aria-label="বাড়ান" onClick={() => setQty(Math.min(product.stock, qty + 1))}><Plus /></Button>
            </div>
            <p className="text-sm font-medium text-primary">মাত্র {bn(product.stock)}টি স্টকে আছে</p>
          </div>

          {/* CTA (desktop) */}
          <div className="mt-7 hidden gap-3 sm:flex">
            <Button size="lg" variant="outline" className="flex-1"><ShoppingCart /> কার্টে যোগ করুন</Button>
            <Button size="lg" className="flex-1">এখনই অর্ডার করুন</Button>
          </div>
          {!size && <p className="mt-2 hidden text-xs text-muted-foreground sm:block">অর্ডারের আগে সাইজ বেছে নিন</p>}

          <Button variant="outline" className="mt-3 w-full">
            <MessageCircle /> হোয়াটসঅ্যাপে অর্ডার বা প্রশ্ন করুন
          </Button>

          {/* Delivery */}
          <Card className="mt-6 gap-0 py-0">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-medium"><Truck className="size-4" /> ডেলিভারি</p>
                <div className="flex rounded-md border p-0.5 text-sm">
                  {[["inside", "ঢাকার ভেতরে"], ["outside", "ঢাকার বাইরে"]].map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setZone(k as "inside" | "outside")}
                      className={`rounded px-3 py-1.5 transition ${zone === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {zone === "inside" ? "১–২ কার্যদিবসে পৌঁছাবে" : "৩–৫ কার্যদিবসে পৌঁছাবে"} · ডেলিভারি চার্জ{" "}
                <span className="font-semibold text-foreground">{taka(shipping)}</span>
              </p>
              <Separator />
              <ul className="grid gap-3 text-sm sm:grid-cols-2">
                <li className="flex items-center gap-2"><Banknote className="size-4 text-primary" /> ক্যাশ অন ডেলিভারি</li>
                <li className="flex items-center gap-2"><RotateCcw className="size-4 text-primary" /> ৭ দিনে রিটার্ন</li>
                <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> ১০০% অরিজিনাল</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-primary" /> বিকাশ / নগদ পেমেন্ট</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ---------- Tabs ---------- */}
      <Tabs defaultValue="desc" className="mt-14">
        <TabsList>
          <TabsTrigger value="desc">বিবরণ</TabsTrigger>
          <TabsTrigger value="specs">স্পেসিফিকেশন</TabsTrigger>
          <TabsTrigger value="reviews">রিভিউ ({bn(product.reviews)})</TabsTrigger>
        </TabsList>

        <TabsContent value="desc" className="mt-6 max-w-2xl">
          <ul className="space-y-3">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" /> <span>{h}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="specs" className="mt-6 max-w-2xl">
          <dl className="divide-y rounded-lg border">
            {product.specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-4 p-4 text-sm odd:bg-muted/40">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="col-span-2">{v}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <p className="text-5xl font-bold">{bn(product.rating)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{bn(product.reviews)}টি রিভিউ</p>
              <div className="mt-5 space-y-2">
                {ratingBars.map((r) => (
                  <div key={r.star} className="flex items-center gap-3 text-sm">
                    <span className="flex w-8 items-center gap-1">{bn(r.star)}<Star className="size-3" /></span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="w-10 text-right text-muted-foreground">{bn(r.pct)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 md:col-span-2">
              {reviews.map((r) => (
                <article key={r.name} className="border-b pb-6 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.name} <span className="text-sm font-normal text-muted-foreground">· {r.city}</span></p>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <div className="mt-1 flex gap-0.5" aria-label={`${r.rating} স্টার`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-current" : "text-muted-foreground/40"}`} />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{r.text}</p>
                  <Badge variant="outline" className="mt-3 font-normal">ক্রয় করা ক্রেতা</Badge>
                </article>
              ))}
              <Button variant="outline">আরও রিভিউ দেখুন</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ---------- Related ---------- */}
      <section className="mt-16">
        <h2 className="mb-5 text-xl font-bold md:text-2xl">এগুলোও পছন্দ হতে পারে</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {related.map((r) => (
            <Link key={r.name} href="#" className="group">
              <div className="flex aspect-square items-center justify-center rounded-xl bg-muted">
                <ImageIcon className="size-8 text-muted-foreground/40" />
              </div>
              <p className="mt-3 line-clamp-1 text-sm font-medium group-hover:text-primary">{r.name}</p>
              <p className="font-bold">{taka(r.price)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Mobile sticky bar ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <div className="leading-tight">
            <p className="text-lg font-bold">{taka(product.price * qty)}</p>
            <p className="text-xs text-muted-foreground line-through">{taka(product.old * qty)}</p>
          </div>
          <Button variant="outline" size="icon" className="ml-auto" aria-label="কার্টে যোগ করুন"><ShoppingCart /></Button>
          <Button className="flex-1">অর্ডার করুন</Button>
        </div>
      </div>
    </main>
  );
}
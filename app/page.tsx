"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Eye,
  Headphones,
  Heart,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Link from "next/link";

/* ---------- Hero Carousel Data ---------- */
const heroSlides = [
  {
    id: 1,
    title: "নতুন সিজনের সেরা কালেকশন",
    subtitle: "ফ্যাশন ও গ্যাজেটের বিশাল সমাহার নিয়ে আমরা হাজির।",
    bg: "from-emerald-600 to-teal-800",
  },
  {
    id: 2,
    title: "অভিজাত লাইফস্টাইল প্রডাক্টস",
    subtitle: "আপনার দৈনন্দিন জীবনের জন্য সেরা প্রিমিয়াম কোয়ালিটি।",
    bg: "from-emerald-600 to-teal-800",
  },
  {
    id: 3,
    title: "বিশেষ আকর্ষণীয় অফার",
    subtitle: "সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা সহ দ্রুততম ডেলিভারি।",
    bg: "from-emerald-600 to-teal-800",
  },
];

/* ---------- Dummy Products (No Badge, No Rating) ---------- */
const products = [
  {
    id: 1,
    name: "পুরুষদের কটন পাঞ্জাবি",
    price: 1450,
    old: 1990,
  },
  {
    id: 2,
    name: "ওয়্যারলেস ব্লুটুথ ইয়ারবাড",
    price: 1290,
    old: 1890,
  },
  {
    id: 3,
    name: "জামদানি শাড়ি (হ্যান্ডলুম)",
    price: 4850,
    old: 5500,
  },
  {
    id: 4,
    name: "স্টেইনলেস স্টিল ওয়াটার বোতল",
    price: 690,
    old: 950,
  },
  {
    id: 5,
    name: "স্মার্ট ফিটনেস ব্যান্ড",
    price: 2190,
    old: 2990,
  },
  {
    id: 6,
    name: "অর্গানিক সরিষার তেল (৫ লিটার)",
    price: 1180,
    old: 1350,
  },
  {
    id: 7,
    name: "মহিলাদের লেদার হ্যান্ডব্যাগ",
    price: 1890,
    old: 2600,
  },
  {
    id: 8,
    name: "নন-স্টিক কুকওয়্যার সেট",
    price: 3290,
    old: 4200,
  },
];

const perks = [
  {
    icon: Truck,
    title: "দ্রুত ডেলিভারি",
    text: "সারাদেশে ২–৪ দিন",
  },
  {
    icon: Banknote,
    title: "ক্যাশ অন ডেলিভারি",
    text: "পণ্য হাতে পেয়ে টাকা দিন",
  },
  { icon: RotateCcw, title: "রিটার্ন", text: "পছন্দ না হলে সহজে ফেরত" },
  {
    icon: ShieldCheck,
    title: "১০০% অরিজিনাল",
    text: "নিজে যাচাই করা পণ্য, সরাসরি আমাদের কাছ থেকে",
  },
];

const taka = (n: number) => `৳${n.toLocaleString("bn-BD")}`;

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. Announcement Bar */}
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground md:text-sm">
        <p>🎉 সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা উপলব্ধ!</p>
      </div>

      {/* 2. Simplified Navbar (No Search, No Cart, No User) */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="text-2xl font-black tracking-tight">
            তাকাটাক<span className="text-primary">.</span>
          </Link>
        </div>
      </header>

      <main>
        {/* 3. Hero Carousel Section */}
        <section className="mx-auto max-w-7xl px-4 pt-6">
          <div className="relative overflow-hidden rounded-2xl bg-muted h-80 md:h-105">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                /* px-12 (mobile) এবং md:px-16 (desktop) ব্যবহার করা হয়েছে যাতে বাটন টেক্সটের ওপর না আসে */
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-center px-12 py-8 md:p-16 bg-linear-to-r ${
                  slide.bg
                } text-white ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div className="max-w-xl">
                  <h1 className="text-2xl font-extrabold sm:text-3xl md:text-5xl leading-tight">
                    {slide.title}
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm md:text-lg opacity-90 line-clamp-2 md:line-clamp-none">
                    {slide.subtitle}
                  </p>
                  <a href="#products">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="mt-4 md:mt-6 rounded-full font-semibold gap-2 text-xs md:text-sm h-9 md:h-11 px-4 md:px-6"
                    >
                      এক্সপ্লোর করুন{" "}
                      <ArrowRight className="size-3.5 md:size-4" />
                    </Button>
                  </a>
                </div>
              </div>
            ))}

            {/* Carousel Controls - Mobile specific adjustments */}
            <button
              onClick={prevSlide}
              className="absolute left-2 md:left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-1.5 md:p-2 text-white backdrop-blur hover:bg-black/50 transition-colors"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="size-5 md:size-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-1.5 md:p-2 text-white backdrop-blur hover:bg-black/50 transition-colors"
              aria-label="Next Slide"
            >
              <ChevronRight className="size-5 md:size-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-3 md:bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 md:h-2 rounded-full transition-all ${
                    i === currentSlide
                      ? "w-5 md:w-6 bg-white"
                      : "w-1.5 md:w-2 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 4. Trust Badges Section */}
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 lg:grid-cols-4">
            {perks.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Product Grid Showcase Section (No Badges, No Ratings, View More Button) */}
        <section id="products" className="mx-auto max-w-7xl px-4 pb-12">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">সকল প্রোডাক্টস</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                আমাদের সংগৃহীত সেরা পণ্যসমূহ দেখুন
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>

        {/* 6. Promotional Banners */}
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 p-8 text-white">
              <h3 className="text-2xl font-bold">বিশেষ ছাড়ের অফার</h3>
              <p className="mt-2 text-sm text-slate-300">
                নির্দিষ্ট পণ্যে পাচ্ছেন আকর্ষণীয় মূল্যছাড়।
              </p>
              <a href="#products">
                <Button
                  variant="secondary"
                  className="mt-6 rounded-full font-semibold"
                >
                  বিস্তারিত দেখুন
                </Button>
              </a>
            </div>

            <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
              <h3 className="text-2xl font-bold">ফ্রি হোম ডেলিভারি</h3>
              <p className="mt-2 text-sm opacity-90">
                যেকোনো স্থান থেকে আজই আপনার পছন্দের প্রোডাক্ট বেছে নিন।
              </p>
              <a href="#products">
                <Button
                  variant="secondary"
                  className="mt-6 rounded-full font-semibold"
                >
                  অর্ডার করুন
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer Section */}
      <footer className="bg-card border-t text-card-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-black tracking-tight">
              তাকাটাক<span className="text-primary">.</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              আমরা আপনাকে দিচ্ছি সর্বোচ্চ কোয়ালিটি ও সঠিক মূল্যের নিশ্চয়তা।
            </p>
          </div>

          <div>
            <h5 className="font-bold mb-4 text-sm">সহায়ক লিংক</h5>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  অর্ডার ট্র্যাক করুন
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  শপ ক্যাটালগ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-4 text-sm">গ্রাহক সেবা</h5>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  রিটার্ন নীতি
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  ডেলিভারি তথ্য
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  যোগাযোগ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-4 text-sm">যোগাযোগ</h5>
            <p className="text-sm text-muted-foreground">
              ইমেইল: support@takatak.shop <br />
            </p>
          </div>
        </div>

        <Separator />

        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-muted-foreground">
          © {year} তাকাটাক ডট শপ। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>
    </div>
  );
}

/* ---------- Simplified Product Card (No Badge, No Rating, View More CTA) ---------- */
function ProductCard({ p }: { p: (typeof products)[number] }) {
  return (
    <Card className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md">
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          [প্রোডাক্ট ছবি]
        </div>
      </div>

      {/* Product Details */}
      <CardContent className="p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {p.name}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-foreground">
            {taka(p.price)}
          </span>
        </div>

        {/* View More Button Replacing Add To Cart */}
        <Link href={`/product/${p.id}`} className="mt-3 block">
          <Button
            variant="outline"
            className="w-full rounded-lg gap-2 text-xs"
            size="sm"
          >
            <Eye className="size-3.5" /> View More
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

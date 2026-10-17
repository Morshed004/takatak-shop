"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

/* ---------- Hero Carousel Data ---------- */
const heroSlides = [
  {
    id: 1,
    title: "নতুন সিজনের সেরা কালেকশন",
    subtitle: "ফ্যাশন ও গ্যাজেটের বিশাল সমাহার নিয়ে আমরা হাজির।",
    bg: "from-emerald-600 to-teal-800",
  },
  {
    id: 2,
    title: "অভিজাত লাইফস্টাইল প্রডাক্টস",
    subtitle: "আপনার দৈনন্দিন জীবনের জন্য সেরা প্রিমিয়াম কোয়ালিটি।",
    bg: "from-emerald-600 to-teal-800",
  },
  {
    id: 3,
    title: "বিশেষ আকর্ষণীয় অফার",
    subtitle: "সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা সহ দ্রুততম ডেলিভারি।",
    bg: "from-emerald-600 to-teal-800",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

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
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-muted h-80 md:h-105">
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
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
                এক্সপ্লোর করুন <ArrowRight className="size-3.5 md:size-4" />
              </Button>
            </a>
          </div>
        </div>
      ))}

      {/* Carousel Controls */}
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
  );
}
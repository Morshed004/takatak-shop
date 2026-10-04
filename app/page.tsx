import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Banknote,
  Heart,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";

/* ---------- Dummy data (replace with your API / DB) ---------- */

const products = [
  {
    id: 1,
    name: "পুরুষদের কটন পাঞ্জাবি",
    price: 1450,
    old: 1990,
    rating: 4.7,
    reviews: 328,
    tag: "-27%",
  },
  {
    id: 2,
    name: "ওয়্যারলেস ব্লুটুথ ইয়ারবাড",
    price: 1290,
    old: 1890,
    rating: 4.5,
    reviews: 912,
    tag: "-32%",
  },
  {
    id: 3,
    name: "জামদানি শাড়ি (হ্যান্ডলুম)",
    price: 4850,
    old: 5500,
    rating: 4.9,
    reviews: 147,
    tag: "নতুন",
  },
  {
    id: 4,
    name: "স্টেইনলেস স্টিল ওয়াটার বোতল",
    price: 690,
    old: 950,
    rating: 4.4,
    reviews: 560,
    tag: "-27%",
  },
  {
    id: 5,
    name: "স্মার্ট ফিটনেস ব্যান্ড",
    price: 2190,
    old: 2990,
    rating: 4.6,
    reviews: 704,
    tag: "-26%",
  },
  {
    id: 6,
    name: "অর্গানিক সরিষার তেল (৫ লিটার)",
    price: 1180,
    old: 1350,
    rating: 4.8,
    reviews: 221,
    tag: "বেস্ট সেলার",
  },
  {
    id: 7,
    name: "মহিলাদের লেদার হ্যান্ডব্যাগ",
    price: 1890,
    old: 2600,
    rating: 4.5,
    reviews: 389,
    tag: "-27%",
  },
  {
    id: 8,
    name: "নন-স্টিক কুকওয়্যার সেট",
    price: 3290,
    old: 4200,
    rating: 4.6,
    reviews: 98,
    tag: "-22%",
  },
];

const perks = [
  {
    icon: Truck,
    title: "দ্রুত ডেলিভারি",
    text: "ঢাকায় ২৪ ঘণ্টা, সারাদেশে ২–৪ দিন",
  },
  {
    icon: Banknote,
    title: "ক্যাশ অন ডেলিভারি",
    text: "পণ্য হাতে পেয়ে টাকা দিন",
  },
  { icon: RotateCcw, title: "৭ দিনে রিটার্ন", text: "পছন্দ না হলে সহজে ফেরত" },
  {
    icon: ShieldCheck,
    title: "১০০% অরিজিনাল",
    text: "নিজে যাচাই করা পণ্য, সরাসরি আমাদের কাছ থেকে",
  },
];

const taka = (n: number) => `৳${n.toLocaleString("bn-BD")}`;

/* ---------- Page ---------- */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Announcement bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 text-sm">
          <p>
            <span className="font-bold">৳২,০০০</span> এর উপরে অর্ডারে ফ্রি
            ডেলিভারি
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            তাকাটাক<span className="text-primary">.</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <Link href={"/carts"}>
              <Button
                variant="outline"
                className="relative gap-2 cursor-pointer"
              >
                <ShoppingCart className="size-4" />
                <span className="hidden sm:inline">কার্ট</span>
                <Badge className="absolute -right-2 -top-2 size-5 justify-center rounded-full p-0">
                  3
                </Badge>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-6 lg:grid-cols-1">
          <div className="relative flex min-h-85 flex-col justify-center overflow-hidden rounded-xl bg-secondary p-8 md:p-12 lg:col-span-2">
            <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
              পছন্দের সবকিছু, এক জায়গায়। <br /> দাম থাকুক হাতের নাগালে।
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              ফ্যাশন, গ্যাজেট আর ঘরের জিনিস — আমাদের নিজের বাছাই করা কালেকশন,
              সারাদেশে ডেলিভারি।
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg">এখনই কিনুন</Button>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-primary/10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 right-24 size-56 rounded-full bg-primary/5"
            />
          </div>
        </section>

        {/* Perks */}
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

        {/* Flash sale */}
        <section className="mx-auto max-w-7xl px-4 pb-10">
          <SectionHead
            title="ফ্ল্যাশ সেল"
            action="সব দেখুন"
            extra={
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">শেষ হতে বাকি</span>
                {["০৫", "৩২", "১৮"].map((t, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-primary px-2 py-1 font-semibold tabular-nums text-primary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <Link href={"/product"}>
                <ProductCard key={p.id} p={p} />
              </Link>
            ))}
          </div>
        </section>

        {/* Promo banners */}
        <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:grid-cols-1">
          <div className="rounded-xl bg-card p-8">
            <h3 className="text-2xl font-bold">
              বিকাশ পেমেন্টে ১০% ক্যাশব্যাক
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              বিকাশ, নগদ বা কার্ডে পেমেন্ট করুন — সর্বোচ্চ ৳৩০০ পর্যন্ত।
            </p>
            <Button className="mt-5">অফার নিন</Button>
          </div>
        </section>

        {/* Popular */}
        <section className="mx-auto max-w-7xl px-4 pb-14">
          <SectionHead title="আপনার জন্য বাছাই" action="আরও দেখুন" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products
              .slice(4)
              .concat(products.slice(0, 4))
              .map((p, i) => (
                <ProductCard key={`${p.id}-${i}`} p={p} />
              ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              আরও পণ্য লোড করুন
            </Button>
          </div>
        </section>

        {/* Newsletter */}
        <section className="border-y bg-secondary">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 py-10 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-bold">
                নতুন অফারের খবর সবার আগে পান
              </h3>
              <p className="text-sm text-muted-foreground">
                ইমেইল বা ফোন নম্বর দিন, স্প্যাম করব না।
              </p>
            </div>
            <div className="flex w-full max-w-md gap-2">
              <Input
                className="h-11 bg-background"
                placeholder="ইমেইল বা মোবাইল নম্বর"
              />
              <Button size="lg">সাবস্ক্রাইব</Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
          <div>
            <p className="text-xl font-bold">
              তাকাটাক<span className="text-primary">.</span>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              বাংলাদেশের নির্ভরযোগ্য অনলাইন শপ। ঢাকা, চট্টগ্রাম, সিলেটসহ
              সারাদেশে ডেলিভারি।
            </p>
          </div>
          {[
            {
              h: "কাস্টমার সার্ভিস",
              l: [
                "অর্ডার ট্র্যাক করুন",
                "রিটার্ন পলিসি",
                "ডেলিভারি তথ্য",
                "সাহায্য কেন্দ্র",
              ],
            },
            {
              h: "কোম্পানি",
              l: [
                "আমাদের সম্পর্কে",
                "আমাদের শোরুম",
                "গোপনীয়তা নীতি",
                "যোগাযোগ",
              ],
            },
            {
              h: "পেমেন্ট মাধ্যম",
              l: ["বিকাশ", "নগদ", "রকেট", "ক্যাশ অন ডেলিভারি"],
            },
          ].map((c) => (
            <div key={c.h}>
              <p className="font-semibold">{c.h}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {c.l.map((x) => (
                  <li key={x}>
                    <Link href="#" className="hover:text-foreground">
                      {x}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator />
        <p className="px-4 py-5 text-center text-xs text-muted-foreground">
          © ২০২৬ তাকাটাক। সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </div>
  );
}

/* ---------- Small components ---------- */
function SectionHead({
  title,
  action,
  extra,
}: {
  title: string;
  action?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
        {extra}
      </div>
      {action && (
        <Link
          href="#"
          className="text-sm font-medium text-primary hover:underline"
        >
          {action}
        </Link>
      )}
    </div>
  );
}

function ProductCard({ p }: { p: (typeof products)[number] }) {
  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <div className="relative aspect-square bg-muted">
        {/* Replace with: <Image src={...} alt={p.name} fill className="object-cover" /> */}
        <Badge className="absolute left-3 top-3">{p.tag}</Badge>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 size-8 rounded-full"
          aria-label="উইশলিস্টে রাখুন"
        >
          <Heart className="size-4" />
        </Button>
      </div>
      <CardContent className="space-y-2 p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium">{p.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-current text-foreground" />
          <span className="font-medium text-foreground">{p.rating}</span>
          <span>({p.reviews.toLocaleString("bn-BD")})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{taka(p.price)}</span>
          <span className="text-xs text-muted-foreground line-through">
            {taka(p.old)}
          </span>
        </div>
        <Button className="w-full" size="sm">
          <ShoppingCart className="size-4" /> কার্টে যোগ করুন
        </Button>
      </CardContent>
    </Card>
  );
}

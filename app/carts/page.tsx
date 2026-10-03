"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Minus, Plus, Trash2, Heart, ImageIcon, ShoppingBag, Truck, Tag,
  ShieldCheck, Banknote, ChevronRight, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

/* ---------- Config ---------- */
const FREE_SHIPPING_MIN = 2000; // ৳২,০০০ এর উপরে ফ্রি ডেলিভারি
const SHIPPING = { inside: 60, outside: 120 };
const COUPONS: Record<string, number> = { WELCOME200: 200, EID100: 100 };

/* ---------- Dummy cart (replace with your cart store / API) ---------- */
type Item = {
  id: number; name: string; color: string; size: string;
  price: number; old: number; qty: number; stock: number;
};

const initialItems: Item[] = [
  { id: 1, name: "পুরুষদের প্রিমিয়াম কটন পাঞ্জাবি", color: "নেভি ব্লু", size: "L", price: 1450, old: 1990, qty: 1, stock: 12 },
  { id: 2, name: "ওয়্যারলেস ব্লুটুথ ইয়ারবাড", color: "ব্ল্যাক", size: "", price: 1290, old: 1890, qty: 2, stock: 30 },
  { id: 3, name: "স্টেইনলেস স্টিল ওয়াটার বোতল", color: "সিলভার", size: "৭৫০ মি.লি.", price: 690, old: 950, qty: 1, stock: 4 },
];

const bn = (n: number) => n.toLocaleString("bn-BD");
const taka = (n: number) => `৳${bn(n)}`;

/* ---------- Page ---------- */
export default function CartPage() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [zone, setZone] = useState<"inside" | "outside">("inside");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState("");

  const setQty = (id: number, qty: number) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, qty: Math.min(x.stock, Math.max(1, qty)) } : x)));
  const remove = (id: number) => setItems((xs) => xs.filter((x) => x.id !== id));

  const applyCoupon = () => {
    const c = code.trim().toUpperCase();
    if (COUPONS[c]) { setApplied(c); setError(""); }
    else { setApplied(null); setError("কুপন কোডটি সঠিক নয়। আবার চেষ্টা করুন।"); }
  };

  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
  const saved = items.reduce((s, x) => s + (x.old - x.price) * x.qty, 0);
  const discount = applied ? COUPONS[applied] : 0;
  const isFree = subtotal >= FREE_SHIPPING_MIN;
  const shipping = items.length === 0 || isFree ? 0 : SHIPPING[zone];
  const total = subtotal - discount + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_MIN - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_MIN) * 100);
  const count = items.reduce((s, x) => s + x.qty, 0);

  /* ----- Empty state ----- */
  if (items.length === 0) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-9 text-muted-foreground" />
        </span>
        <h1 className="mt-6 text-2xl font-bold">আপনার কার্ট খালি</h1>
        <p className="mt-2 text-muted-foreground">পছন্দের পণ্য কার্টে যোগ করুন, তারপর এখানে এসে অর্ডার সম্পন্ন করুন।</p>
        <Button size="lg" className="mt-7"><Link href="/">কেনাকাটা শুরু করুন</Link></Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-6 lg:pb-16">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">হোম</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">শপিং কার্ট</span>
      </nav>

      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-2xl font-bold md:text-3xl">শপিং কার্ট</h1>
        <span className="text-muted-foreground">{bn(count)}টি পণ্য</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ---------- Items ---------- */}
        <div className="space-y-4 lg:col-span-2">
          {/* Free shipping progress */}
          <Card className="gap-0 py-0">
            <CardContent className="p-5">
              <p className="flex items-center gap-2 text-sm">
                <Truck className="size-4 text-primary" />
                {isFree ? (
                  <span className="font-medium">অভিনন্দন! আপনার অর্ডারে ডেলিভারি চার্জ ফ্রি</span>
                ) : (
                  <span>
                    আর <span className="font-semibold">{taka(remaining)}</span> এর পণ্য যোগ করলে ডেলিভারি ফ্রি
                  </span>
                )}
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </CardContent>
          </Card>

          {items.map((item) => (
            <Card key={item.id} className="gap-0 py-0">
              <CardContent className="flex gap-4 p-4 md:p-5">
                <Link href="#" className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-muted md:size-28">
                  {/* Replace with: <Image src={item.image} alt={item.name} fill className="object-cover" /> */}
                  <ImageIcon className="size-7 text-muted-foreground/40" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href="#" className="line-clamp-2 font-medium hover:text-primary">{item.name}</Link>
                      <p className="mt-1 text-sm text-muted-foreground">
                        রং: {item.color}{item.size && ` · সাইজ: ${item.size}`}
                      </p>
                      {item.stock <= 5 && (
                        <Badge variant="secondary" className="mt-2 font-normal">মাত্র {bn(item.stock)}টি বাকি</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{taka(item.price * item.qty)}</p>
                      <p className="text-xs text-muted-foreground line-through">{taka(item.old * item.qty)}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="flex items-center rounded-md border">
                      <Button variant="ghost" size="icon" className="size-8" aria-label="কমান" onClick={() => setQty(item.id, item.qty - 1)}><Minus /></Button>
                      <span className="w-9 text-center text-sm font-medium tabular-nums">{bn(item.qty)}</span>
                      <Button variant="ghost" size="icon" className="size-8" aria-label="বাড়ান" onClick={() => setQty(item.id, item.qty + 1)}><Plus /></Button>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-muted-foreground"><Heart /> <span className="hidden sm:inline">পরে কিনব</span></Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => remove(item.id)}>
                        <Trash2 /> <span className="hidden sm:inline">মুছুন</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="ghost" className="px-0 text-primary hover:bg-transparent hover:underline">
            <Link href="/">← কেনাকাটা চালিয়ে যান</Link>
          </Button>
        </div>

        {/* ---------- Summary ---------- */}
        <aside className="lg:col-span-1">
          <Card className="gap-0 py-0 lg:sticky lg:top-28">
            <CardContent className="space-y-5 p-5 md:p-6">
              <h2 className="text-lg font-bold">অর্ডার সামারি</h2>

              {/* Coupon */}
              <div>
                <label htmlFor="coupon" className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Tag className="size-4" /> কুপন কোড
                </label>
                {applied ? (
                  <div className="flex items-center justify-between rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 font-medium"><Check className="size-4 text-primary" /> {applied} প্রয়োগ হয়েছে</span>
                    <button aria-label="কুপন সরান" onClick={() => { setApplied(null); setCode(""); }}><X className="size-4 text-muted-foreground" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME200" className="uppercase" />
                      <Button variant="outline" onClick={applyCoupon} disabled={!code.trim()}>প্রয়োগ</Button>
                    </div>
                    {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
                  </>
                )}
              </div>

              <Separator />

              {/* Delivery zone */}
              <div>
                <p className="mb-2 text-sm font-medium">ডেলিভারি এলাকা</p>
                <div className="grid grid-cols-2 gap-1 rounded-md border p-1 text-sm">
                  {([["inside", "ঢাকার ভেতরে"], ["outside", "ঢাকার বাইরে"]] as const).map(([k, l]) => (
                    <button
                      key={k}
                      onClick={() => setZone(k)}
                      className={`rounded py-1.5 transition ${zone === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">সাবটোটাল</dt><dd>{taka(subtotal)}</dd></div>
                {discount > 0 && (
                  <div className="flex justify-between"><dt className="text-muted-foreground">কুপন ছাড়</dt><dd className="text-primary">-{taka(discount)}</dd></div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
                  <dd>{shipping === 0 ? <span className="font-medium text-primary">ফ্রি</span> : taka(shipping)}</dd>
                </div>
              </dl>

              <Separator />

              <div className="flex items-baseline justify-between">
                <span className="font-semibold">সর্বমোট</span>
                <span className="text-2xl font-bold">{taka(total)}</span>
              </div>
              <p className="-mt-2 text-xs text-primary">এই অর্ডারে আপনি মোট {taka(saved + discount)} সাশ্রয় করছেন</p>

              <Button size="lg" className="hidden w-full lg:inline-flex">
                <Link href="/checkout">চেকআউট করুন</Link>
              </Button>

              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Banknote className="size-4" /> ক্যাশ অন ডেলিভারি, বিকাশ ও নগদ</li>
                <li className="flex items-center gap-2"><ShieldCheck className="size-4" /> ৭ দিনের মধ্যে রিটার্ন সুবিধা</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* ---------- Mobile sticky checkout ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-4">
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">সর্বমোট</p>
            <p className="text-xl font-bold">{taka(total)}</p>
          </div>
          <Button size="lg" className="flex-1"><Link href="/checkout">চেকআউট করুন</Link></Button>
        </div>
      </div>
    </main>
  );
}
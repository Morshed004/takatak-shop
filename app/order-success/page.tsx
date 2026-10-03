"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2, Copy, Check, MapPin, CalendarClock, Banknote, Phone,
  ImageIcon, PackageCheck, Truck, Home, MessageCircle, Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Invoice } from "@/components/invoice";

/* ---------- Dummy order (replace with data fetched by order ID) ---------- */
const order = {
  id: "DK-240915-7384",
  placedAt: "১৫ সেপ্টেম্বর ২০২৬, রাত ৮:৩২",
  payment: "ক্যাশ অন ডেলিভারি",
  estimated: "১৮ – ২০ সেপ্টেম্বর",
  customer: { name: "রাফিউল ইসলাম", phone: "০১৭১২-৩৪৫৬৭৮" },
  address: "বাড়ি ১২, রোড ৫, সেক্টর ৭, উত্তরা, ঢাকা – ১২৩০",
  items: [
    { name: "পুরুষদের প্রিমিয়াম কটন পাঞ্জাবি", variant: "নেভি ব্লু · L", qty: 1, price: 1450 },
    { name: "ওয়্যারলেস ব্লুটুথ ইয়ারবাড", variant: "ব্ল্যাক", qty: 2, price: 1290 },
  ],
  discount: 200,
  shipping: 0,
};

const steps = [
  { icon: CheckCircle2, label: "অর্ডার গ্রহণ", done: true },
  { icon: PackageCheck, label: "কনফার্মেশন", done: false },
  { icon: Truck, label: "শিপমেন্ট", done: false },
  { icon: Home, label: "ডেলিভারি", done: false },
];

const bn = (n: number) => n.toLocaleString("bn-BD");
const taka = (n: number) => `৳${bn(n)}`;

export default function OrderSuccessPage() {
  const [copied, setCopied] = useState(false);

  const subtotal = order.items.reduce((s, x) => s + x.price * x.qty, 0);
  const total = subtotal - order.discount + order.shipping;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const printInvoice = () => window.print();

  // প্রিন্ট/PDF সেভ করার সময় ফাইলের নাম হবে Invoice-<অর্ডার আইডি>
  useEffect(() => {
    const prev = document.title;
    const before = () => (document.title = `Invoice-${order.id}`);
    const after = () => (document.title = prev);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  return (
    <>
    <main className="mx-auto max-w-3xl px-4 py-10 md:py-14 print:hidden">
      {/* ---------- Success header ---------- */}
      <section className="text-center">
        <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-11 text-primary" />
        </span>
        <h1 className="mt-6 text-2xl font-bold md:text-3xl">আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে</h1>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          ধন্যবাদ, {order.customer.name}! অর্ডার কনফার্ম করতে আমরা শীঘ্রই <span className="font-medium text-foreground">{order.customer.phone}</span> নম্বরে কল বা মেসেজ করব।
        </p>
      </section>

      {/* ---------- Order ID + estimated delivery ---------- */}
      <Card className="mt-8 gap-0 py-0">
        <CardContent className="grid gap-6 p-5 sm:grid-cols-2 md:p-6">
          <div>
            <p className="text-sm text-muted-foreground">অর্ডার আইডি</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xl font-bold tracking-wide">{order.id}</p>
              <Button variant="ghost" size="icon" className="size-8" onClick={copyId} aria-label="অর্ডার আইডি কপি করুন">
                {copied ? <Check className="text-primary" /> : <Copy />}
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{order.placedAt}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">সম্ভাব্য ডেলিভারি</p>
            <p className="mt-1 flex items-center gap-2 text-xl font-bold">
              <CalendarClock className="size-5 text-primary" /> {order.estimated}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">কার্যদিবস অনুযায়ী</p>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Progress ---------- */}
      <ol className="mt-8 grid grid-cols-4 gap-2">
        {steps.map(({ icon: Icon, label, done }, i) => (
          <li key={label} className="flex flex-col items-center gap-2 text-center">
            <div className="relative flex w-full items-center justify-center">
              {i > 0 && <span className={`absolute right-1/2 top-1/2 h-0.5 w-full -translate-y-1/2 ${done ? "bg-primary" : "bg-border"}`} />}
              <span className={`relative z-10 flex size-10 items-center justify-center rounded-full border-2 bg-background ${done ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                <Icon className="size-4" />
              </span>
            </div>
            <span className={`text-xs md:text-sm ${done ? "font-medium" : "text-muted-foreground"}`}>{label}</span>
          </li>
        ))}
      </ol>

      {/* ---------- Order details ---------- */}
      <Card className="mt-8 gap-0 py-0">
        <CardContent className="p-5 md:p-6">
          <h2 className="font-bold">অর্ডারকৃত পণ্য</h2>
          <ul className="mt-4 divide-y">
            {order.items.map((it) => (
              <li key={it.name} className="flex items-center gap-4 py-4 first:pt-0">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <ImageIcon className="size-5 text-muted-foreground/40" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{it.name}</p>
                  <p className="text-xs text-muted-foreground">{it.variant} · পরিমাণ: {bn(it.qty)}</p>
                </div>
                <p className="font-semibold">{taka(it.price * it.qty)}</p>
              </li>
            ))}
          </ul>

          <Separator />

          <dl className="space-y-3 py-5 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">সাবটোটাল</dt><dd>{taka(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">কুপন ছাড়</dt><dd className="text-primary">-{taka(order.discount)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">ডেলিভারি চার্জ</dt><dd className="font-medium text-primary">ফ্রি</dd></div>
          </dl>

          <Separator />

          <div className="flex items-baseline justify-between pt-5">
            <span className="font-semibold">সর্বমোট</span>
            <span className="text-2xl font-bold">{taka(total)}</span>
          </div>
          <Badge variant="secondary" className="mt-3 gap-1.5 font-normal">
            <Banknote className="size-3.5" /> {order.payment} — পণ্য হাতে পেয়ে {taka(total)} পরিশোধ করুন
          </Badge>
        </CardContent>
      </Card>

      {/* ---------- Address ---------- */}
      <Card className="mt-4 gap-0 py-0">
        <CardContent className="flex gap-4 p-5 md:p-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-5" />
          </span>
          <div>
            <h2 className="font-bold">ডেলিভারি ঠিকানা</h2>
            <p className="mt-2 text-sm font-medium">{order.customer.name}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="size-3.5" /> {order.customer.phone}</p>
            <p className="mt-1 text-sm text-muted-foreground">{order.address}</p>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Actions ---------- */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={printInvoice} size="lg" className="flex-1">
          <Printer className="size-4" /> ইনভয়েস ডাউনলোড করুন 
        </Button>
        <Button size="lg" variant="outline" className="flex-1">
          <Link href="/">কেনাকাটা চালিয়ে যান</Link>
        </Button>
      </div>
    </main>

    {/* শুধু প্রিন্টে দেখায় */}
    <Invoice order={order} />
    </>
  );
}
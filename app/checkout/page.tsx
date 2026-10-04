"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ImageIcon, Truck, Zap, Banknote, Smartphone, CreditCard,
  Loader2, Lock, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bn, taka } from "@/lib/format";

/* ---------- নিজের নিয়ম অনুযায়ী বদলান ---------- */
const FREE_MIN = 2000;
const SHIP = { inside: 60, outside: 120, express: 150 };
const PAY_NUMBER = { bkash: "01XXX-XXXXXX", nagad: "01XXX-XXXXXX" }; // আপনার পার্সোনাল/মার্চেন্ট নম্বর

const districts = [
  "ঢাকা","গাজীপুর","নারায়ণগঞ্জ","নরসিংদী","টাঙ্গাইল","কিশোরগঞ্জ","মানিকগঞ্জ","মুন্সিগঞ্জ","রাজবাড়ী","মাদারীপুর","গোপালগঞ্জ","ফরিদপুর","শরীয়তপুর",
  "চট্টগ্রাম","কক্সবাজার","কুমিল্লা","ফেনী","ব্রাহ্মণবাড়িয়া","রাঙ্গামাটি","নোয়াখালী","চাঁদপুর","লক্ষ্মীপুর","খাগড়াছড়ি","বান্দরবান",
  "সিলেট","মৌলভীবাজার","হবিগঞ্জ","সুনামগঞ্জ",
  "রাজশাহী","বগুড়া","পাবনা","সিরাজগঞ্জ","নাটোর","জয়পুরহাট","চাঁপাইনবাবগঞ্জ","নওগাঁ",
  "খুলনা","বাগেরহাট","সাতক্ষীরা","যশোর","ঝিনাইদহ","নড়াইল","মাগুরা","কুষ্টিয়া","চুয়াডাঙ্গা","মেহেরপুর",
  "বরিশাল","ভোলা","পটুয়াখালী","পিরোজপুর","ঝালকাঠি","বরগুনা",
  "রংপুর","দিনাজপুর","গাইবান্ধা","কুড়িগ্রাম","লালমনিরহাট","নীলফামারী","পঞ্চগড়","ঠাকুরগাঁও",
  "ময়মনসিংহ","জামালপুর","নেত্রকোণা","শেরপুর",
];

/* ---------- Dummy cart (cart store থেকে নিন) ---------- */
const items = [
  { id: 1, name: "পুরুষদের প্রিমিয়াম কটন পাঞ্জাবি", variant: "নেভি ব্লু · L", qty: 1, price: 1450 },
  { id: 2, name: "ওয়্যারলেস ব্লুটুথ ইয়ারবাড", variant: "ব্ল্যাক", qty: 2, price: 1290 },
];
const COUPON = 200;

type Pay = "cod" | "bkash" | "nagad" | "card";
type Errors = Partial<Record<"name" | "phone" | "district" | "area" | "address" | "trx", string>>;

const toEn = (s: string) => s.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
const normalizePhone = (s: string) => toEn(s).replace(/[\s-]/g, "").replace(/^(\+?88)/, "");

export default function CheckoutPage() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", phone: "", email: "", district: "", area: "", address: "", note: "", trx: "" });
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [pay, setPay] = useState<Pay>("cod");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setF((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  /* ---- হিসাব ---- */
  const isDhaka = f.district === "ঢাকা";
  const method = isDhaka ? delivery : "standard"; // ঢাকার বাইরে এক্সপ্রেস নেই
  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
  const standardFee = subtotal >= FREE_MIN ? 0 : isDhaka ? SHIP.inside : SHIP.outside;
  const shipping = method === "express" ? SHIP.express : standardFee;
  const total = subtotal - COUPON + shipping;
  const standardEta = isDhaka ? `${bn(1)}–${bn(2)} কার্যদিবস` : `${bn(3)}–${bn(5)} কার্যদিবস`;

  /* ---- ভ্যালিডেশন ---- */
  const validate = () => {
    const e: Errors = {};
    if (f.name.trim().length < 3) e.name = "আপনার পুরো নাম লিখুন";
    if (!/^01[3-9]\d{8}$/.test(normalizePhone(f.phone))) e.phone = "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন 01712345678)";
    if (!f.district) e.district = "জেলা বেছে নিন";
    if (f.area.trim().length < 2) e.area = "থানা/উপজেলা লিখুন";
    if (f.address.trim().length < 10) e.address = "বাড়ি/রোড/এলাকা সহ পূর্ণ ঠিকানা লিখুন";
    if ((pay === "bkash" || pay === "nagad") && f.trx.trim().length < 8) e.trx = "ট্রানজেকশন আইডি (TrxID) দিন";
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(first)?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById(first)?.focus();
      return;
    }
    setLoading(true);
    try {
      // TODO: এখানে আপনার API/Server Action কল করুন, তারপর অর্ডার আইডি নিয়ে redirect করুন।
      // const res = await fetch("/api/orders", { method: "POST", body: JSON.stringify({ ...f, phone: normalizePhone(f.phone), delivery: method, pay, items }) });
      await new Promise((r) => setTimeout(r, 900));
      router.push("/order-success");
    } finally {
      setLoading(false);
    }
  };

  const PlaceBtn = ({ className = "" }: { className?: string }) => (
    <Button type="submit" form="checkout" size="lg" disabled={loading} className={className}>
      {loading ? <><Loader2 className="animate-spin" /> প্রসেস হচ্ছে...</> : <><Lock /> অর্ডার কনফার্ম করুন · {taka(total)}</>}
    </Button>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-6 lg:pb-16">
      <nav aria-label="breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">হোম</Link><ChevronRight className="size-3.5" />
        <Link href="/cart" className="hover:text-foreground">কার্ট</Link><ChevronRight className="size-3.5" />
        <span className="text-foreground">চেকআউট</span>
      </nav>
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">চেকআউট</h1>

      <form id="checkout" onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* 1. Customer + address */}
          <Section n={1} title="ডেলিভারি তথ্য">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label="আপনার নাম" error={errors.name} required>
                <Input id="name" value={f.name} onChange={set("name")} placeholder="পুরো নাম" autoComplete="name" aria-invalid={!!errors.name} />
              </Field>
              <Field id="phone" label="মোবাইল নম্বর" error={errors.phone} required>
                <Input id="phone" type="tel" inputMode="numeric" value={f.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" autoComplete="tel" aria-invalid={!!errors.phone} />
              </Field>
              <Field id="district" label="জেলা" error={errors.district} required>
                <Select value={f.district} onValueChange={(v) => { setF((p) => ({ ...p, district: v })); setErrors((p) => ({ ...p, district: undefined })); }}>
                  <SelectTrigger id="district" className="w-full" aria-invalid={!!errors.district}><SelectValue placeholder="জেলা বেছে নিন" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="area" label="থানা / উপজেলা" error={errors.area} required>
                <Input id="area" value={f.area} onChange={set("area")} placeholder="যেমন: উত্তরা" aria-invalid={!!errors.area} />
              </Field>
              <div className="sm:col-span-2">
                <Field id="address" label="পূর্ণ ঠিকানা" error={errors.address} required>
                  <Textarea id="address" rows={3} value={f.address} onChange={set("address")} placeholder="বাড়ি নং, রোড, এলাকা, ল্যান্ডমার্ক" autoComplete="street-address" aria-invalid={!!errors.address} />
                </Field>
              </div>
              <Field id="email" label="ইমেইল (ঐচ্ছিক)">
                <Input id="email" type="email" value={f.email} onChange={set("email")} placeholder="name@example.com" autoComplete="email" />
              </Field>
              <Field id="note" label="অর্ডার নোট (ঐচ্ছিক)">
                <Input id="note" value={f.note} onChange={set("note")} placeholder="যেমন: বিকেলে ডেলিভারি দিন" />
              </Field>
            </div>
          </Section>

          {/* 2. Delivery method */}
          <Section n={2} title="ডেলিভারি পদ্ধতি">
            <RadioGroup value={method} onValueChange={(v) => setDelivery(v as "standard" | "express")} className="gap-3">
              <Option value="standard" current={method} icon={Truck} title="স্ট্যান্ডার্ড ডেলিভারি"
                desc={f.district ? `${standardEta} · কুরিয়ারে` : "জেলা বেছে নিলে সময় দেখাবে"}
                price={f.district ? (standardFee === 0 ? "ফ্রি" : taka(standardFee)) : `${taka(SHIP.inside)}–${taka(SHIP.outside)}`} />
              <Option value="express" current={method} icon={Zap} title="এক্সপ্রেস ডেলিভারি"
                desc={isDhaka ? "ঢাকার ভেতরে একই দিন বা পরের দিন সকালে" : "শুধু ঢাকা জেলার জন্য"}
                price={taka(SHIP.express)} disabled={!isDhaka} />
            </RadioGroup>
            {f.district && standardFee === 0 && method === "standard" && (
              <p className="mt-3 text-sm text-primary">{taka(FREE_MIN)} এর বেশি অর্ডার হওয়ায় ডেলিভারি চার্জ ফ্রি</p>
            )}
          </Section>

          {/* 3. Payment */}
          <Section n={3} title="পেমেন্ট পদ্ধতি">
            <RadioGroup value={pay} onValueChange={(v) => setPay(v as Pay)} className="gap-3">
              <Option value="cod" current={pay} icon={Banknote} title="ক্যাশ অন ডেলিভারি" desc="পণ্য হাতে পেয়ে টাকা দিন" />
              <Option value="bkash" current={pay} icon={Smartphone} title="বিকাশ" desc="Send Money করে TrxID দিন" />
              <Option value="nagad" current={pay} icon={Smartphone} title="নগদ" desc="Send Money করে TrxID দিন" />
              <Option value="card" current={pay} icon={CreditCard} title="কার্ড (Visa / Mastercard)" desc="অর্ডারের পর নিরাপদ পেমেন্ট পেজে নেওয়া হবে" />
            </RadioGroup>

            {(pay === "bkash" || pay === "nagad") && (
              <div className="mt-4 space-y-4 rounded-lg bg-muted p-4 text-sm">
                <p className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <span>
                    আপনার {pay === "bkash" ? "বিকাশ" : "নগদ"} অ্যাপ থেকে <b>{PAY_NUMBER[pay]}</b> নম্বরে <b>{taka(total)}</b> Send Money করুন, তারপর নিচে ট্রানজেকশন আইডি লিখুন।
                  </span>
                </p>
                <Field id="trx" label="ট্রানজেকশন আইডি (TrxID)" error={errors.trx} required>
                  <Input id="trx" value={f.trx} onChange={set("trx")} placeholder="যেমন: 9H7A5B3C2D" className="bg-background uppercase" aria-invalid={!!errors.trx} />
                </Field>
              </div>
            )}
          </Section>
        </div>

        {/* ---------- Summary ---------- */}
        <aside>
          <Card className="gap-0 py-0 lg:sticky lg:top-28">
            <CardContent className="space-y-5 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">অর্ডার সামারি</h2>
                <Link href="/cart" className="text-sm text-primary hover:underline">কার্ট দেখুন</Link>
              </div>

              <ul className="space-y-4">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3">
                    <span className="relative flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <ImageIcon className="size-5 text-muted-foreground/40" />
                      <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{bn(it.qty)}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{it.variant}</p>
                    </div>
                    <p className="text-sm font-semibold">{taka(it.price * it.qty)}</p>
                  </li>
                ))}
              </ul>

              <Separator />
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-muted-foreground">সাবটোটাল</dt><dd>{taka(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted-foreground">কুপন ছাড়</dt><dd className="text-primary">-{taka(COUPON)}</dd></div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
                  <dd>{!f.district ? "জেলা বাছাই করুন" : shipping === 0 ? <span className="font-medium text-primary">ফ্রি</span> : taka(shipping)}</dd>
                </div>
              </dl>
              <Separator />
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">সর্বমোট</span>
                <span className="text-2xl font-bold">{taka(total)}</span>
              </div>
              {pay === "cod" && <p className="-mt-2 text-xs text-muted-foreground">ডেলিভারির সময় {taka(total)} পরিশোধ করুন</p>}

              <PlaceBtn className="hidden w-full lg:inline-flex" />
              <p className="text-center text-xs text-muted-foreground">
                অর্ডার করার মাধ্যমে আপনি আমাদের <Link href="#" className="underline">শর্তাবলী</Link> ও <Link href="/faq" className="underline">রিটার্ন নীতি</Link> মেনে নিচ্ছেন।
              </p>
            </CardContent>
          </Card>
        </aside>
      </form>

      {/* Mobile sticky */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur lg:hidden">
        <PlaceBtn className="w-full" />
      </div>
    </main>
  );
}

/* ---------- Small components ---------- */
function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-5 md:p-6">
        <h2 className="mb-5 flex items-center gap-3 text-lg font-bold">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">{bn(n)}</span>
          {title}
        </h2>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({ id, label, error, required, children }: { id: string; label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Option({ value, current, icon: Icon, title, desc, price, disabled }: {
  value: string; current: string; icon: React.ElementType; title: string; desc: string; price?: string; disabled?: boolean;
}) {
  const on = current === value;
  return (
    <Label
      htmlFor={`opt-${value}`}
      className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 font-normal transition ${
        on ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-foreground/30"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <RadioGroupItem id={`opt-${value}`} value={value} disabled={disabled} />
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <span className="flex-1">
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-muted-foreground">{desc}</span>
      </span>
      {price && <span className="text-sm font-semibold">{price}</span>}
    </Label>
  );
}
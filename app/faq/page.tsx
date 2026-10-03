"use client";

import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bn, taka } from "@/lib/format";
import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";

/* ---------- নিজের নিয়ম অনুযায়ী এই মানগুলো বদলান ---------- */
const FREE_MIN = 2000;
const SHIP_IN = 60;
const SHIP_OUT = 120;
const RETURN_DAYS = 7;
const HOTLINE = "০৯৬৭৮-XXXXXX";

type Faq = { cat: string; q: string; a: string };

const categories = ["সব", "অর্ডার", "ডেলিভারি", "পেমেন্ট", "রিটার্ন ও রিফান্ড"];

const faqs: Faq[] = [
  /* অর্ডার */
  {
    cat: "অর্ডার", q: "কীভাবে অর্ডার করব?",
    a: `পছন্দের পণ্য খুলে রং ও সাইজ বেছে "এখনই অর্ডার করুন" বা "কার্টে যোগ করুন" চাপুন। এরপর কার্ট থেকে চেকআউটে গিয়ে নাম, মোবাইল নম্বর ও ঠিকানা দিন এবং পেমেন্ট পদ্ধতি বেছে অর্ডার কনফার্ম করুন। চাইলে হোয়াটসঅ্যাপ বা মেসেঞ্জারে মেসেজ দিয়েও অর্ডার করতে পারেন।`,
  },
  {
    cat: "অর্ডার", q: "অর্ডার করার পর কি কনফার্মেশন কল আসবে?",
    a: "হ্যাঁ। ভুল অর্ডার এড়াতে আমাদের প্রতিনিধি আপনার দেওয়া মোবাইল নম্বরে কল বা মেসেজ করে অর্ডার নিশ্চিত করবেন। তাই সঠিক ও চালু নম্বর দিন।",
  },
  {
    cat: "অর্ডার", q: "অর্ডার দেওয়ার পর কি বাতিল বা পরিবর্তন করা যাবে?",
    a: "পণ্য কুরিয়ারে হস্তান্তরের আগ পর্যন্ত অর্ডার বাতিল বা ঠিকানা/সাইজ পরিবর্তন করা যায়। দ্রুত আমাদের হটলাইন বা হোয়াটসঅ্যাপে জানান।",
  },
  {
    cat: "অর্ডার", q: "আমার অর্ডার কোথায় আছে, কীভাবে জানব?",
    a: "অর্ডার সফল হলে একটি অর্ডার আইডি পাবেন। \"অর্ডার ট্র্যাক করুন\" পেজে সেই আইডি দিয়ে অর্ডারের বর্তমান অবস্থা দেখতে পারবেন।",
  },

  /* ডেলিভারি */
  {
    cat: "ডেলিভারি", q: "ডেলিভারি কত দিনে পাব?",
    a: `ঢাকার ভেতরে সাধারণত ${bn(1)}–${bn(2)} কার্যদিবসে এবং ঢাকার বাইরে ${bn(3)}–${bn(5)} কার্যদিবসে পণ্য পৌঁছে যায়। ঈদ বা বড় অফারের সময় কিছুটা বেশি সময় লাগতে পারে।`,
  },
  {
    cat: "ডেলিভারি", q: "ডেলিভারি চার্জ কত?",
    a: `ঢাকার ভেতরে ${taka(SHIP_IN)} এবং ঢাকার বাইরে ${taka(SHIP_OUT)}। ${taka(FREE_MIN)} বা তার বেশি মূল্যের অর্ডারে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি।`,
  },
  {
    cat: "ডেলিভারি", q: "সারা বাংলাদেশে কি ডেলিভারি দেন?",
    a: "হ্যাঁ, ৬৪ জেলার প্রায় সব উপজেলায় আমরা কুরিয়ারের মাধ্যমে ডেলিভারি দিই। খুব দুর্গম এলাকায় সময় একটু বেশি লাগতে পারে।",
  },
  {
    cat: "ডেলিভারি", q: "ডেলিভারির সময় আমি বাসায় না থাকলে কী হবে?",
    a: "ডেলিভারি ম্যান আগে কল করবেন। আপনি ধরতে না পারলে একই দিন বা পরের দিন আবার চেষ্টা করা হয়। চাইলে ঠিকানায় অন্য কারও নাম ও নম্বর দিয়ে রাখতে পারেন।",
  },

  /* পেমেন্ট */
  {
    cat: "পেমেন্ট", q: "ক্যাশ অন ডেলিভারি (COD) আছে?",
    a: "হ্যাঁ, সারা দেশে ক্যাশ অন ডেলিভারি চালু আছে। পণ্য হাতে পেয়ে, দেখে নিয়ে ডেলিভারি ম্যানকে টাকা দিন। আগে থেকে কোনো টাকা দিতে হবে না।",
  },
  {
    cat: "পেমেন্ট", q: "অনলাইনে পেমেন্ট কীভাবে করব?",
    a: "চেকআউটে বিকাশ, নগদ, রকেট বা কার্ড (Visa/Mastercard) বেছে নিন। পেমেন্ট পেজে গিয়ে নির্দেশনা অনুযায়ী পেমেন্ট সম্পন্ন করলেই অর্ডার কনফার্ম হয়ে যাবে।",
  },
  {
    cat: "পেমেন্ট", q: "অনলাইন পেমেন্ট কি নিরাপদ?",
    a: "হ্যাঁ। পেমেন্ট সরাসরি বিকাশ, নগদ বা ব্যাংকের নিরাপদ গেটওয়ের মাধ্যমে হয়। আপনার পিন বা কার্ডের তথ্য আমরা দেখি না বা সংরক্ষণ করি না।",
  },
  {
    cat: "পেমেন্ট", q: "পেমেন্ট কেটে গেছে কিন্তু অর্ডার কনফার্ম হয়নি, এখন কী করব?",
    a: "চিন্তা করবেন না। ট্রানজেকশন আইডি ও মোবাইল নম্বর সহ আমাদের হটলাইন বা হোয়াটসঅ্যাপে জানান। আমরা যাচাই করে অর্ডার কনফার্ম করব, অথবা টাকা ফেরত দেব।",
  },

  /* রিটার্ন ও রিফান্ড */
  {
    cat: "রিটার্ন ও রিফান্ড", q: "রিটার্ন করা যাবে?",
    a: `হ্যাঁ। পণ্য হাতে পাওয়ার ${bn(RETURN_DAYS)} দিনের মধ্যে অব্যবহৃত অবস্থায়, ট্যাগ ও প্যাকেজিং সহ রিটার্ন করা যাবে। ভুল বা ত্রুটিপূর্ণ পণ্য পেলে রিটার্নের কুরিয়ার খরচ আমরা বহন করব।`,
  },
  {
    cat: "রিটার্ন ও রিফান্ড", q: "সাইজ বা রং পছন্দ না হলে এক্সচেঞ্জ করা যায়?",
    a: `যায়। ${bn(RETURN_DAYS)} দিনের মধ্যে আমাদের জানান। স্টকে থাকলে সাইজ বা রং বদলে দেওয়া হবে। শুধু আসা-যাওয়ার ডেলিভারি চার্জ প্রযোজ্য হতে পারে।`,
  },
  {
    cat: "রিটার্ন ও রিফান্ড", q: "রিফান্ডের টাকা কবে ও কীভাবে পাব?",
    a: `রিটার্ন করা পণ্য আমাদের কাছে পৌঁছে যাচাই হওয়ার পর ${bn(3)}–${bn(5)} কার্যদিবসের মধ্যে আপনার বিকাশ/নগদ নম্বরে বা পেমেন্ট করা মাধ্যমে টাকা ফেরত দেওয়া হয়।`,
  },
  {
    cat: "রিটার্ন ও রিফান্ড", q: "কোন কোন পণ্য রিটার্ন করা যায় না?",
    a: "ব্যবহৃত বা ধোয়া পণ্য, ট্যাগ খোলা অন্তর্বাস, প্রসাধনী ও খাদ্যপণ্য (সীল খোলা) এবং কাস্টমাইজড বা অর্ডার অনুযায়ী তৈরি পণ্য রিটার্নযোগ্য নয়।",
  },
];

export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("সব");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter(
      (f) =>
        (cat === "সব" || f.cat === cat) &&
        (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
    );
  }, [query, cat]);

  // SEO: Google এ FAQ রিচ রেজাল্ট
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main className="pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="border-b bg-secondary">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center md:py-16">
          <h1 className="text-3xl font-bold md:text-4xl">সাধারণ জিজ্ঞাসা</h1>
          <p className="mt-3 text-muted-foreground">অর্ডার, ডেলিভারি, পেমেন্ট ও রিটার্ন নিয়ে আপনার প্রশ্নের উত্তর এখানে পাবেন।</p>
        </div>
      </section>

      <div className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 lg:grid-cols-3">
        {/* FAQ list */}
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={cat === c ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setCat(c)}
              >
                {c}
              </Button>
            ))}
          </div>

          {list.length > 0 ? (
            <Card className="gap-0 py-0">
              <CardContent className="px-5 md:px-6">
                <Accordion type="single" collapsible defaultValue={list.length ? "item-0" : undefined} key={`${cat}-${query}`}>
                  {list.map((f, i) => (
                    <AccordionItem key={f.q} value={`item-${i}`} className="last:border-b-0">
                      <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                        {f.q}
                      </AccordionTrigger>
                      <AccordionContent className="leading-relaxed text-muted-foreground">
                        {f.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center rounded-xl border border-dashed py-16 text-center">
              <SearchX className="size-10 text-muted-foreground/60" />
              <p className="mt-4 font-medium">কোনো উত্তর পাওয়া যায়নি</p>
              <p className="mt-1 text-sm text-muted-foreground">অন্য শব্দ দিয়ে খুঁজুন, অথবা সরাসরি আমাদের মেসেজ করুন।</p>
              <Button variant="outline" className="mt-5" onClick={() => { setQuery(""); setCat("সব"); }}>
                সব প্রশ্ন দেখুন
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
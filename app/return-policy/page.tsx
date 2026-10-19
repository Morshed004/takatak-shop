import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, Truck, RotateCcw, AlertTriangle } from "lucide-react";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'রিটার্ন ও এক্সচেঞ্জ নীতি | Return & Exchange Policy',
  description: 'আমাদের ক্যাশ অন ডেলিভারি এবং রিটার্ন নীতি সম্পর্কে বিস্তারিত জানুন। কুরিয়ারে পণ্য বুঝে নেওয়ার সময় চেক করার নিয়মাবলি।',
  keywords: ['Return Policy', 'Exchange Policy', 'Cash on Delivery', 'রিটার্ন পলিসি', 'ক্যাশ অন ডেলিভারি'],
  openGraph: {
    title: 'রিটার্ন ও এক্সচেঞ্জ নীতি',
    description: 'আমাদের ক্যাশ অন ডেলিভারি এবং রিটার্ন নীতি সম্পর্কে বিস্তারিত জানুন।',
    type: 'website',
  },
};

export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">রিটার্ন ও এক্সচেঞ্জ নীতি</h1>
        <p className="text-muted-foreground">
          আমাদের ক্যাশ অন ডেলিভারি এবং রিটার্ন পলিসি সম্পর্কে বিস্তারিত জেনে নিন।
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-3">
            <Truck className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg">অর্ডার পদ্ধতি</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            শুধুমাত্র ক্যাশ অন ডেলিভারিতে অর্ডার করতে পারবেন। তবে অর্ডার কনফার্ম করার জন্য অগ্রিম ডেলিভারি চার্জ প্রদান করতে হবে।
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg">সামনে চেক</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            ডেলিভারি ম্যানের সামনেই প্রোডাক্ট চেক করে নেওয়ার সুযোগ রয়েছে। কোনো সমস্যা পেলে তাৎক্ষণিকভাবে ফেরত দিতে পারবেন।
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2 gap-3">
            <RotateCcw className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg">রিটার্ন শর্ত</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            ডেলিভারি ম্যান চলে যাওয়ার পর আর কোনো রিটার্ন বা এক্সচেঞ্জ গ্রহণযোগ্য হবে না। তাই সামনেই চেক করা বাধ্যতামূলক।
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            গুরুত্বপূর্ণ নির্দেশাবলী
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            ১. <strong>অগ্রিম ডেলিভারি চার্জ:</strong> আমাদের সব অর্ডার ক্যাশ অন ডেলিভারিতে পাঠানো হয়। তবে অর্ডার প্রসেস করার জন্য কাস্টমারকে অবশ্যই অগ্রিম ডেলিভারি চার্জ প্রদান করতে হবে।
          </p>
          <p>
            ২. <strong>ডেলিভারির সময় চেক করা:</strong> পার্সেল হাতে পাওয়ার পর ডেলিভারি ম্যানের উপস্থিতিতে প্রোডাক্ট ভালোভাবে চেক করে নিন। প্রোডাক্টে কোনো ডিফেক্ট, ভুল সাইজ বা ভাঙা থাকলে ডেলিভারি ম্যানের সাথেই রিটার্ন করে দিতে পারবেন।
          </p>
          <p>
            ৩. <strong>ডেলিভারি ম্যান চলে যাওয়ার পরের নিয়ম:</strong> যদি ডেলিভারি ম্যান চলে যাওয়ার পর কাস্টমার অভিযোগ করেন বা রিটার্ন করতে চান, তবে তা আর গ্রহণযোগ্য হবে না। ডেলিভারি ম্যান চলে যাওয়ার অর্থ হলো আপনি প্রোডাক্ট বুঝে নিয়েছেন এবং এটি সঠিক অবস্থায় রয়েছে।
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4">সচরাচর জিজ্ঞাস প্রশ্নাবলী (FAQ)</h3>
        <Accordion className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>অগ্রিম ডেলিভারি চার্জ কেন নেওয়া হয়?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              অর্ডারের সত্যতা নিশ্চিত করতে এবং কুরিয়ারে গিয়ে পার্সেল রিটার্ন আসার প্রবণতা রোধ করতে শুধুমাত্র ডেলিভারি চার্জ অগ্রিম নেওয়া হয়। প্রোডাক্টের মূল দাম আপনি পণ্য হাতে পেয়ে ক্যাশ অন ডেলিভারিতে পরিশোধ করবেন।
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>প্রোডাক্টে সমস্যা পেলে ডেলিভারি ম্যানকে কী করব?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              প্রোডাক্টে কোনো সমস্যা বা ত্রুটি থাকলে ডেলিভারি ম্যানের সামনেই তাকে পার্সেলটি ফেরত দিয়ে দিন এবং ডেলিভারি চার্জের বিষয়টি আমাদের কাস্টমার কেয়ারে যোগাযোগ করে সমাধান করে নিন।
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>ডেলিভারি ম্যান চলে যাওয়ার পর কি কোনোভাবেই রিটার্ন করা সম্ভব নয়?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm">
              না, আমাদের নীতিমালা অনুযায়ী ডেলিভারি ম্যান চলে যাওয়ার পর কোনো প্রকার রিটার্ন বা এক্সচেঞ্জ করা সম্ভব নয়। তাই ডেলিভারির সময় অবশ্যই পার্সেল চেক করে নেওয়ার অনুরোধ করা হচ্ছে।
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Users, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | Takatak",
};

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-muted/40 px-3 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ড্যাশবোর্ড ওভারভিউ
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              আপনার ব্যবসার সাম্প্রতিক কার্যকলাপ এবং পরিসংখ্যান এক নজরে।
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm">
              <Link href="/admin/dashboard/products">প্রোডাক্ট ম্যানেজ করুন</Link>
            </Button>
          </div>
        </div>

        {/* 1. Stat Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট বিক্রি (Revenue)
              </CardTitle>
              <DollarSign className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳ ৪৫,২৩০</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট অর্ডার
              </CardTitle>
              <ShoppingBag className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">১২৮ টি</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট কাস্টমার
              </CardTitle>
              <Users className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৩১০ জন</div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Quick Links Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              দ্রুত নেভিগেশন
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/admin/dashboard/products"
              className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Package className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium leading-none">
                    প্রোডাক্ট লিস্ট
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    সকল প্রোডাক্ট দেখুন ও ম্যানেজ করুন
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>

            <Link
              href="/admin/dashboard/orders"
              className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <ShoppingBag className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium leading-none">
                    অর্ডার সমূহ
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    সাম্প্রতিক সব অর্ডার ট্র্যাক করুন
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
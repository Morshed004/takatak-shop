import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, DollarSign, Users, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | তাকাটাক",
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
              <Link href="/dashboard/products">প্রোডাক্ট ম্যানেজ করুন</Link>
            </Button>
          </div>
        </div>

        {/* 1. Stat Cards Grid (Revenue, Orders, Customers) */}
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
            <CardTitle className="text-base font-semibold">দ্রুত নেভিগেশন</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Link href="/dashboard/products">
                <Package className="size-5" />
                <span>প্রোডাক্ট লিস্ট</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Link href="/dashboard/orders">
                <ShoppingBag className="size-5" />
                <span>অর্ডার সমূহ</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
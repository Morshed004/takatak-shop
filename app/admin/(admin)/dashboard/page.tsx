import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag,
  DollarSign,
  Package,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Dashboard | Takatak",
};

// Force dynamic rendering to fetch real-time database statistics on every load
export const dynamic = "force-dynamic";

// Helper function to format currency in Bangladeshi Taka
const taka = (n?: number | null) => {
  if (n === undefined || n === null || isNaN(n)) {
    return "৳0";
  }
  return `৳${n.toLocaleString("bn-BD")}`;
};

// Function to fetch all dashboard metrics and lists from database
async function getDashboardData() {
  try {
    // 1. Get total revenue (sum of all orders totalAmount)
    const totalRevenueAgg = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });
    const totalRevenue = totalRevenueAgg._sum.totalAmount || 0;

    // 2. Get total orders count
    const totalOrders = await prisma.order.count();

    // 3. Get today's start and end date to calculate today's sales and orders
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayOrdersAgg = await prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const todaysRevenue = todayOrdersAgg._sum.totalAmount || 0;
    const todaysOrderCount = todayOrdersAgg._count.id || 0;

    // 4. Get Pending Orders List (Latest 5 pending orders)
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // 5. Get Most Sold Products based on OrderItem quantities
    const orderItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Fetch product details for the top sold product IDs
    const productIds = orderItems.map((item) => item.productId);
    const productsData = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: {
        images: true,
      },
    });

    // Map quantities with product info
    const mostSoldProducts = orderItems
      .map((item) => {
        const product = productsData.find((p) => p.id === item.productId);
        return {
          ...product,
          totalSold: item._sum.quantity || 0,
        };
      })
      .filter((p) => p.id !== undefined);

    return {
      totalRevenue,
      totalOrders,
      todaysRevenue,
      todaysOrderCount,
      pendingOrders,
      mostSoldProducts,
    };
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return {
      totalRevenue: 0,
      totalOrders: 0,
      todaysRevenue: 0,
      todaysOrderCount: 0,
      pendingOrders: [],
      mostSoldProducts: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const {
    totalRevenue,
    totalOrders,
    todaysRevenue,
    todaysOrderCount,
    pendingOrders,
    mostSoldProducts,
  } = await getDashboardData();

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
              <Link
                href="/admin/dashboard/products/add"
                className="flex items-center gap-2"
              >
                <Plus className="size-4 text-white" />
                <span>প্রোডাক্ট অ্যাড করুন</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 1. Stat Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                মোট বিক্রি (Total Revenue)
              </CardTitle>
              <DollarSign className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taka(totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                আজকের বিক্রি (Today Sell)
              </CardTitle>
              <DollarSign className="size-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taka(todaysRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                আজ অর্ডার হয়েছে: {todaysOrderCount} টি
              </p>
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
              <div className="text-2xl font-bold">{totalOrders} টি</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                পেন্ডিং অর্ডার
              </CardTitle>
              <Clock className="size-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingOrders.length} টি
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. Pending Orders & Most Sold Products Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending Orders List */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                সাম্প্রতিক পেন্ডিং অর্ডারসমূহ
              </CardTitle>
              <Link
                href="/admin/dashboard/orders"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                সব দেখুন <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent className="flex-1">
              {pendingOrders.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground text-sm">
                  <CheckCircle2 className="size-8 text-emerald-500 mb-2" />
                  <p>কোনো পেন্ডিং অর্ডার নেই!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.phone} • {order.orderNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {taka(order.totalAmount)}
                        </p>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full dark:bg-amber-900/30 dark:text-amber-400">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Most Sold Products List */}
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">
                সবচেয়ে বেশি বিক্রিত প্রোডাক্ট
              </CardTitle>
              <Link
                href="/admin/dashboard/products"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                সব দেখুন <ArrowRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent className="flex-1">
              {mostSoldProducts.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-center text-muted-foreground text-sm">
                  <p>এখনো কোনো বিক্রির ডেটা নেই!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mostSoldProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="size-10 rounded-md object-cover border"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {taka(product.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-lg">
                          বিক্রি: {product.totalSold} টি
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3. Quick Links Section */}
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

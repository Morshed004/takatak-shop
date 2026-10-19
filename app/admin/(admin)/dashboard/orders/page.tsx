import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShoppingBag, Eye, MapPin, Phone, User, FileText } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";


export const metadata = {
  title: "Orders",
};

// Real database theke orders fetch korar function
async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true, // Jodi order items laghe
      },
    });
    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
      case "Pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case "PROCESSING":
      case "Processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case "DELIVERED":
      case "Delivered":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Delivered</Badge>;
      case "CANCELLED":
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <main className="min-h-screen bg-muted/40 px-3 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Orders
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Manage and track customer orders easily.
            </p>
          </div>
          <Badge variant="outline" className="w-fit gap-1.5 px-3 py-1.5 text-xs">
            <ShoppingBag className="size-3.5 text-muted-foreground" />
            <span>Order Management</span>
          </Badge>
        </div>

        {/* Card Container */}
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between border-b px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold sm:text-base">
                All Orders
              </CardTitle>
              <CardDescription className="text-xs">
                Total {orders.length} orders found
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* DESKTOP VIEW: Table Layout */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="pl-6 min-w-30">Order ID</TableHead>
                    <TableHead className="min-w-45">Customer</TableHead>
                    <TableHead className="min-w-55">Address & Location</TableHead>
                    <TableHead className="min-w-45">Note</TableHead>
                    <TableHead className="min-w-25">Amount</TableHead>
                    <TableHead className="min-w-27.5">Status</TableHead>
                    <TableHead className="pr-6 text-right min-w-40">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {orders.map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });

                    const fullInfo = `Name: ${order.customerName}\nPhone: ${order.phone}\nAddress: ${order.address}\nDistrict: ${order.district}, Division: ${order.division}${order.customerNote ? `\nNote: ${order.customerNote}` : ''}`;

                    return (
                      <TableRow key={order.id} className="transition-colors hover:bg-muted/30">
                        {/* Order ID & Date */}
                        <TableCell className="pl-6 font-medium">
                          <div>
                            <span className="font-semibold text-foreground">{order.orderNumber || order.id}</span>
                            <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
                          </div>
                        </TableCell>

                        {/* Customer Info */}
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium text-sm text-foreground">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.phone}</p>
                          </div>
                        </TableCell>

                        {/* Address & Location */}
                        <TableCell>
                          <div className="space-y-1 max-w-60">
                            <p className="text-xs text-foreground line-clamp-2">{order.address}</p>
                            <div className="flex gap-1 text-[11px] text-muted-foreground">
                              <span>{order.district},</span>
                              <span>{order.division}</span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Customer Note */}
                        <TableCell>
                          <p className="text-xs text-muted-foreground italic max-w-45 truncate">
                            {order.customerNote || "—"}
                          </p>
                        </TableCell>

                        {/* Amount */}
                        <TableCell>
                          <span className="font-semibold text-primary text-sm">
                            ৳ {order.totalAmount}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(order.status)}</TableCell>

                        {/* Actions */}
                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <CopyButton textToCopy={fullInfo} label="Copy" />
                            <Button size="sm" variant="ghost" className="size-8 p-0">
                              <Link href={`/admin/dashboard/orders/${order.id}`}>
                                <Eye className="size-4 text-muted-foreground" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE & TABLET VIEW: Card List */}
            <div className="divide-y lg:hidden">
              {orders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                const fullInfo = `Name: ${order.customerName}\nPhone: ${order.phone}\nAddress: ${order.address}\nDistrict: ${order.district}, Division: ${order.division}${order.customerNote ? `\nNote: ${order.customerNote}` : ''}`;

                return (
                  <div key={order.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm">{order.orderNumber || order.id}</span>
                        <span className="text-xs text-muted-foreground ml-2">({formattedDate})</span>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="rounded-lg bg-muted/40 p-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <User className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{order.customerName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="size-3.5 shrink-0" />
                        <span>{order.phone}</span>
                      </div>

                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="size-3.5 mt-0.5 shrink-0" />
                        <span>{order.address}, {order.district}, {order.division}</span>
                      </div>

                      {order.customerNote && (
                        <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 pt-1 border-t border-border/50">
                          <FileText className="size-3.5 mt-0.5 shrink-0" />
                          <span>Note: {order.customerNote}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-semibold text-primary">
                        ৳ {order.totalAmount}
                      </span>
                      <div className="flex gap-2">
                        <CopyButton textToCopy={fullInfo} label="Copy Info" />
                        <Button size="sm" variant="outline">
                          <Link href={`/admin/dashboard/orders/${order.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-muted-foreground min-h-50">
                <ShoppingBag className="size-8 stroke-[1.5]" />
                <p className="text-sm font-medium">No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  FileText, 
  Calendar 
} from "lucide-react";
import OrderActionButtons from "@/components/admin/OrderActionButtons";
import { prisma } from "@/lib/prisma";


interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata = {
  title: "Order Details",
};

export default async function OrderDetailPage({ params }: PageProps) {
  // Await params to get the id safely in Next.js App Router
  const resolvedParams = await params;
  const orderId = resolvedParams?.id;

  if (!orderId) {
    notFound();
  }

  // ডাটাবেজ থেকে নির্দিষ্ট অর্ডারের তথ্য ও আইটেম ফেচ করা
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  const formattedDate = new Date(order.createdAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case "DELIVERED":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <main className="min-h-screen bg-muted/40 px-3 py-6 sm:px-6 md:px-8 pb-24">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Top Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard/orders">
              <Button variant="outline" size="icon" className="rounded-xl size-9">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Order #{order.orderNumber || order.id}
                </h1>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="size-3" /> Placed on {formattedDate}
              </p>
            </div>
          </div>

          <OrderActionButtons orderId={order.id} currentStatus={order.status} />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Customer & Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ordered Products Section */}
            <Card className="rounded-2xl overflow-hidden">
              <CardHeader className="border-b bg-muted/30 px-5 py-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ShoppingBag className="size-4 text-primary" /> Ordered Products
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 divide-y">
                {order.items.map((item) => {
                  let variant: any = {};
                  try {
                    variant = item.variantInfo ? JSON.parse(item.variantInfo) : {};
                  } catch (e) {}

                  return (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                      <div>
                        <p className="font-semibold text-sm">Product ID: {item.productId}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                          {variant.color && <span>Color: <strong className="text-foreground">{variant.color}</strong></span>}
                          {variant.size && <span>• Size: <strong className="text-foreground">{variant.size}</strong></span>}
                          <span>• Qty: <strong className="text-foreground">{item.quantity}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">Unit Price: ৳{item.unitPrice}</span>
                        <span className="font-bold text-primary text-sm">৳{item.unitPrice * item.quantity}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b bg-muted/30 px-5 py-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="size-4 text-primary" /> Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-xs">Customer Name</span>
                  <div className="flex items-center gap-2 font-medium">
                    <User className="size-3.5 text-muted-foreground" /> {order.customerName}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-xs">Mobile Number</span>
                  <div className="flex items-center gap-2 font-medium">
                    <Phone className="size-3.5 text-muted-foreground" /> {order.phone}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground block text-xs">Email Address</span>
                  <div className="flex items-center gap-2 font-medium">
                    <Mail className="size-3.5 text-muted-foreground" /> {order.email || "N/A"}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="text-muted-foreground block text-xs">Delivery Address</span>
                  <div className="flex items-start gap-2 font-medium">
                    <MapPin className="size-3.5 text-muted-foreground mt-0.5 shrink-0" /> 
                    <span>{order.address}, {order.district}, {order.division}</span>
                  </div>
                </div>

                {order.customerNote && (
                  <div className="space-y-1 sm:col-span-2 bg-amber-50/50 border border-amber-200/60 p-3 rounded-xl text-amber-900">
                    <span className="font-semibold text-xs flex items-center gap-1">
                      <FileText className="size-3" /> Customer Note:
                    </span>
                    <p className="italic text-xs mt-1">{order.customerNote}</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Payment & Summary */}
          <div className="space-y-6">
            
            {/* Payment & TrxID Details */}
            <Card className="rounded-2xl border-primary/20 bg-primary/5">
              <CardHeader className="border-b border-primary/10 px-5 py-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
                  <CreditCard className="size-4" /> Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <Badge variant="outline" className="font-bold uppercase bg-background">
                    {order.paymentMethod}
                  </Badge>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Sender Number:</span>
                  <span className="font-mono font-semibold">{order.senderNumber}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Transaction ID (TrxID):</span>
                  <span className="font-mono font-bold text-primary bg-background px-2 py-0.5 rounded border border-primary/20">
                    {order.trxId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <Badge variant={order.paymentStatus === "PAID" ? "default" : "outline"} className="text-[11px]">
                    {order.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="rounded-2xl">
              <CardHeader className="border-b bg-muted/30 px-5 py-4">
                <CardTitle className="text-sm font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Cost (Advance):</span>
                  <span className="font-medium text-foreground">৳{order.shippingCost}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Product Amount (COD):</span>
                  <span className="font-medium text-foreground">৳{order.totalAmount - order.shippingCost}</span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center font-bold text-base">
                  <span>Total Amount:</span>
                  <span className="text-primary text-lg">৳{order.totalAmount}</span>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </main>
  );
}
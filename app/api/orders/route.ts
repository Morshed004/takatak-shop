import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis'; // Import Redis client
import { z } from "zod";

const phoneRegex = /^01[3-9]\d{8}$/;

const orderApiSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  productName: z.string().min(1, "Product name is required"),
  price: z.number().positive("Invalid product price"),
  quantity: z.number().int().positive("Invalid quantity"),
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  
  // Customer Info
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().regex(phoneRegex, "Invalid 11-digit mobile number"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  
  // Address & Shipping
  zila: z.string().min(1, "Zila is required"),
  thana: z.string().optional().nullable(),
  fullAddress: z.string().min(5, "Full address is required"),
  customerNote: z.string().optional().nullable(),
  shippingCost: z.number().nonnegative("Invalid shipping cost"),
  
  // Payment Info
  paymentMethod: z.enum(["BKASH", "NAGAD", "ROCKET"]),
  senderNumber: z.string().regex(phoneRegex, "Invalid sender mobile number"),
  trxId: z.string().min(3, "Transaction ID is required"),
  totalAmount: z.number().positive("Invalid total amount"),
});

// Function to send Telegram Notification
async function sendTelegramNotification(orderData: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return;
  }

  const message = `
📦 **New Order Received!**
------------------------------
🆔 **Order No:** \`${orderData.orderNumber}\`
👤 **Name:** ${orderData.customerName}
📞 **Phone:** ${orderData.customerPhone}
📍 **Address:** ${orderData.address}, ${orderData.district}
🛒 **Product:** ${orderData.productName} (Qty: ${orderData.quantity})
💰 **Total Amount:** ৳${orderData.totalAmount}
🚚 **Delivery Charge:** ৳${orderData.shippingCost} (Paid Advance)
------------------------------
💳 **Payment Method:** ${orderData.paymentMethod}
📱 **Sender No:** \`${orderData.senderNumber}\`
🔑 **TrxID:** \`${orderData.trxId}\`
  `.trim();

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
  }
}

export async function POST(req: Request) {
  try {
    // 1. Secret Key Verification
    const appSecretHeader = req.headers.get("x-app-secret");
    const serverAppSecret = process.env.APP_SECRET;

    if (!serverAppSecret || appSecretHeader !== serverAppSecret) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid or missing App Secret." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 2. Validate data using Zod
    const validationResult = orderApiSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const formattedTrxId = data.trxId.trim().toUpperCase();

    // 3. Check if TrxID already exists in Database (Duplicate Check)
    const existingOrder = await prisma.order.findUnique({
      where: { trxId: formattedTrxId },
    });

    if (existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "This Transaction ID (TrxID) has already been used for another order.",
        },
        { status: 400 }
      );
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 4. Save Order in Database via Prisma Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          totalAmount: data.totalAmount,
          shippingCost: data.shippingCost,
          status: "PENDING",
          customerName: data.customerName,
          phone: data.customerPhone,
          email: data.customerEmail || null,
          address: data.fullAddress,
          division: data.zila,
          district: data.zila,
          customerNote: data.customerNote || null,
          paymentMethod: data.paymentMethod,
          paymentStatus: "PENDING",
          senderNumber: data.senderNumber,
          trxId: formattedTrxId,
          items: {
            create: {
              productId: data.productId,
              quantity: data.quantity,
              unitPrice: data.price,
              variantInfo: JSON.stringify({
                color: data.color || null,
                size: data.size || null,
              }),
            },
          },
        },
        include: {
          items: true,
        },
      });

      return order;
    });

    // 5. Invalidate Redis Caches (Orders list & Admin dashboard metrics)
    await redis.del("cached_orders");
    await redis.del("admin_dashboard_stats");

    // 6. Send Telegram Notification
    await sendTelegramNotification({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerPhone: newOrder.phone,
      address: newOrder.address,
      district: newOrder.district,
      productName: data.productName,
      quantity: data.quantity,
      totalAmount: newOrder.totalAmount,
      shippingCost: newOrder.shippingCost,
      paymentMethod: data.paymentMethod,
      senderNumber: newOrder.senderNumber,
      trxId: newOrder.trxId,
    });

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully!",
        data: {
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
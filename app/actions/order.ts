"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// Function to send SMS using SMS Gateway (using passed session values)
async function sendSmsToCustomer(
  phone: string, 
  message: string, 
  gatewayUrl: string, 
  gatewayKey: string
) {
  try {
    if (!gatewayUrl || !gatewayKey) {
      console.warn("Gateway API URL or Key is missing from session.");
      return { success: false, message: "Gateway credentials missing." };
    }

    // Ensure correct phone number format (+880) for Bangladeshi numbers
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = `+88${formattedPhone}`;
    } else if (!formattedPhone.startsWith("+")) {
      formattedPhone = `+${formattedPhone}`;
    }

    const response = await fetch(gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${gatewayKey}`,
      },
      body: JSON.stringify({
        number: formattedPhone, // SMS expects 'number'
        text: message,          // SMS expects 'text'
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error("SMS Sending Failed:", error);
    return { success: false, error };
  }
}

// Update order status server action accepting session gateway credentials
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  cancelReason?: string,
  gatewayUrl?: string,
  gatewayKey?: string
) {
  try {
    // 1. Fetch order and customer phone number from the database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { phone: true, orderNumber: true, id: true },
    });

    if (!order) {
      return { success: false, message: "Order not found." };
    }

    // 2. Update order status in the database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        // Save cancel reason if status is CANCELLED
        ...(status === "CANCELLED" && cancelReason ? { cancelReason } : {}),
      },
    });

    // 3. Generate message with 'Takatak Shop' branding (within 130 characters limit)
    const orderRef = order.orderNumber || order.id.slice(-6);
    let smsMessage = "";

    if (status === "CANCELLED") {
      // Include cancellation reason and delivery fee refund assurance
      const reasonText = cancelReason ? ` Reason: ${cancelReason}.` : "";
      smsMessage = `Takatak Shop: Order #${orderRef} cancelled.${reasonText} Your delivery fee refund will be sent very soon.`;
    } else {
      smsMessage = `Takatak Shop: Order #${orderRef} status is now ${status}. Thank you for shopping with us! Stay connected.`;
    }

    // 4. Send SMS to the customer's phone number via SMS Gateway using session credentials
    if (order.phone && gatewayUrl && gatewayKey) {
      await sendSmsToCustomer(order.phone, smsMessage, gatewayUrl, gatewayKey);
    }

    // Revalidate order detail page path
    revalidatePath(`/admin/dashboard/orders/${orderId}`);
    revalidatePath("/admin/dashboard/orders");

    return { success: true, message: "Order status updated and SMS sent successfully!" };
  } catch (error) {
    console.error("Update Status Error:", error);
    return { success: false, message: "Failed to update status." };
  }
}
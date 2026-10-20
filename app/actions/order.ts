"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// List of cancellation reasons where refund is not applicable
const NON_REFUNDABLE_REASONS = [
  "Fake Payment Details",
  "Payment Not Received",
  "Suspected Fraud",
  "Policy Violation",
];

// Function to send SMS using SMS Gateway
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

    // Format phone number to international standard for Bangladesh (+880)
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
        number: formattedPhone, // API parameter for phone number
        text: message,          // API parameter for message body
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error("SMS Sending Failed:", error);
    return { success: false, error };
  }
}

// Server action to update order status and trigger notification
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  cancelReason?: string,
  gatewayUrl?: string,
  gatewayKey?: string
) {
  try {
    // 1. Fetch order details from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { phone: true, orderNumber: true, id: true },
    });

    if (!order) {
      return { success: false, message: "Order not found." };
    }

    // 2. Update status and cancellation reason in database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "CANCELLED" && cancelReason ? { cancelReason } : {}),
      },
    });

    // 3. Construct SMS message content
    const orderRef = order.orderNumber || order.id.slice(-6);
    let smsMessage = "";

    if (status === "CANCELLED") {
      const reasonText = cancelReason ? ` Reason: ${cancelReason}.` : "";
      
      // Check if cancellation reason excludes refund eligibility
      const isNonRefundable = cancelReason && NON_REFUNDABLE_REASONS.includes(cancelReason);

      if (isNonRefundable) {
        // Standard cancellation message without refund assurance
        smsMessage = `Takatak Shop: Order #${orderRef} has been cancelled.${reasonText}`;
      } else {
        // Message with refund assurance for eligible reasons
        smsMessage = `Takatak Shop: Order #${orderRef} cancelled.${reasonText} Your refund will be sent very soon.`;
      }
    } else {
      smsMessage = `Takatak Shop: Order #${orderRef} status is now ${status}. Thank you for shopping with us! Stay connected.`;
    }

    // 4. Send SMS if phone number and credentials are valid
    if (order.phone && gatewayUrl && gatewayKey) {
      await sendSmsToCustomer(order.phone, smsMessage, gatewayUrl, gatewayKey);
    }

    // Revalidate paths to update UI
    revalidatePath(`/admin/dashboard/orders/${orderId}`);
    revalidatePath("/admin/dashboard/orders");

    return { success: true, message: "Order status updated and SMS sent successfully!" };
  } catch (error) {
    console.error("Update Status Error:", error);
    return { success: false, message: "Failed to update status." };
  }
}
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";


type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

// Update order status server action
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  cancelReason?: string
) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        // Save cancel reason if status is CANCELLED
        ...(status === "CANCELLED" && cancelReason ? { cancelReason } : {}),
      },
    });

    // Revalidate order detail page path
    revalidatePath(`/admin/dashboard/orders/${orderId}`);
    revalidatePath("/admin/dashboard/orders");

    return { success: true, message: "Order status updated successfully!" };
  } catch (error) {
    return { success: false, message: "Failed to update status." };
  }
}
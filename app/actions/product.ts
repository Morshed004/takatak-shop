"use server";

import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function publishProduct(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const adminPrice = parseFloat(formData.get("adminPrice") as string) || 0;
    const suggestedPrice = parseFloat(formData.get("suggestedPrice") as string) || 0;
    const customerPaysDelivery = parseFloat(formData.get("customerPaysDelivery") as string) || 0;

    // ১. ফাইলগুলো সংগ্রহ করা
    const imageFiles = formData.getAll("images") as File[];
    const imageUrls: string[] = [];

    // ২. প্রতিটি ইমেজ Cloudinary-তে আপলোড করা
    for (const file of imageFiles) {
      if (file.size > 0 && file.name !== "undefined") {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "takatak_products" },
              (error, result) => {
                if (error || !result) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        imageUrls.push(uploadResult.secure_url);
      }
    }

    // ৩. PostgreSQL-এ Prisma দিয়ে ডেটা সেভ / আপডেট করা
    const savedProduct = await prisma.product.upsert({
      where: { id: id || "new-product-id" },
      update: {
        name,
        description,
        adminPrice,
        suggestedPrice,
        customerPaysDelivery,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      create: {
        name,
        description,
        adminPrice,
        suggestedPrice,
        customerPaysDelivery,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });

    revalidatePath("/dashboard/products");

    return { success: true, data: savedProduct };
  } catch (error) {
    console.error("Error publishing product:", error);
    return { success: false, error: "Failed to publish product." };
  }
}
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

    // ২. প্রতিটি বৈধ ইমেজ Cloudinary-তে আপলোড করা
    for (const file of imageFiles) {
      if (file && file.size > 0 && file.name !== "undefined") {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "takatak_products" },
              (error, result) => {
                if (error || !result) reject(error || new Error("Cloudinary upload failed"));
                else resolve(result);
              }
            )
            .end(buffer);
        });

        if (uploadResult?.secure_url) {
          imageUrls.push(uploadResult.secure_url);
        }
      }
    }

    // ৩. PostgreSQL-এ Prisma দিয়ে ডেটা সেভ / আপডেট করা
    // যদি নতুন ছবি আপলোড করা হয় শুধু তখনই ইমেজ টেবিল আপডেট হবে, নতুবা পুরনো ছবি বহাল থাকবে
    const updateData: any = {
      name,
      description,
      adminPrice,
      suggestedPrice,
      customerPaysDelivery,
    };

    if (imageUrls.length > 0) {
      updateData.images = {
        create: imageUrls.map((url) => ({ url })),
      };
    }

    const savedProduct = await prisma.product.upsert({
      where: { id: id && id !== "" ? id : "non-existent-id" },
      update: updateData,
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
  } catch (error: any) {
    console.error("Detailed Error publishing product:", error);
    return { success: false, error: error.message || "Failed to publish product." };
  }
}
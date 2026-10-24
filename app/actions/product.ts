"use server";

import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { revalidatePath } from "next/cache";

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload buffer to Cloudinary
async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );
    uploadStream.end(buffer);
  });
}

// ==========================================
// CREATE PRODUCT SERVER ACTION
// ==========================================
export async function createProduct(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const colorsStr = formData.get("colors") as string;
    const sizesStr = formData.get("sizes") as string;

    const files = formData.getAll("images") as File[];

    if (!title || !price) {
      return { success: false, message: "Title and Price are required fields." };
    }

    // 1. Upload product images to Cloudinary
    const uploadedImages = [];
    for (const file of files) {
      if (file && file.size > 0) {
        const uploaded = await uploadToCloudinary(file);
        uploadedImages.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
        });
      }
    }

    // 2. Parse variant colors and sizes
    const colors = colorsStr ? colorsStr.split(",").map((c) => c.trim()).filter(Boolean) : [];
    const sizes = sizesStr ? sizesStr.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const variantData = [];
    if (colors.length > 0 && sizes.length > 0) {
      for (const color of colors) {
        for (const size of sizes) {
          variantData.push({ color, size });
        }
      }
    } else if (colors.length > 0) {
      for (const color of colors) {
        variantData.push({ color });
      }
    } else if (sizes.length > 0) {
      for (const size of sizes) {
        variantData.push({ size });
      }
    }

    // 3. Create product in Database along with images and variants
    const newProduct = await prisma.product.create({
      data: {
        name: title,
        description,
        price,
        images: {
          create: uploadedImages,
        },
        ...(variantData.length > 0 && {
          variants: {
            create: variantData,
          },
        }),
      },
    });

    // 4. Invalidate Redis product cache
    await redis.del("cached_products");

    revalidatePath("/admin/dashboard/products");

    return {
      success: true,
      message: "Product created successfully!",
      product: newProduct,
    };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return {
      success: false,
      message: error.message || "An error occurred while creating the product.",
    };
  }
}

// ==========================================
// UPDATE PRODUCT SERVER ACTION
// ==========================================
export async function updateProduct(formData: FormData) {
  try {
    const productId = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const colorsStr = formData.get("colors") as string;
    const sizesStr = formData.get("sizes") as string;

    // Parse deleted image IDs sent from frontend
    const deletedImageIdsJson = formData.get("deletedImageIds") as string;
    const deletedImageIds: string[] = deletedImageIdsJson ? JSON.parse(deletedImageIdsJson) : [];

    // Parse new files uploaded from frontend
    const newFiles = formData.getAll("images") as File[];

    // 1. Delete removed images from Cloudinary and Database
    if (deletedImageIds.length > 0) {
      const imagesToDelete = await prisma.productImage.findMany({
        where: { id: { in: deletedImageIds } },
      });

      for (const img of imagesToDelete) {
        if (img.publicId) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }

      await prisma.productImage.deleteMany({
        where: { id: { in: deletedImageIds } },
      });
    }

    // 2. Upload new images to Cloudinary and insert into database
    const newUploadedImages = [];
    for (const file of newFiles) {
      if (file && file.size > 0) {
        const uploaded = await uploadToCloudinary(file);
        newUploadedImages.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          productId,
        });
      }
    }

    if (newUploadedImages.length > 0) {
      await prisma.productImage.createMany({
        data: newUploadedImages,
      });
    }

    // 3. Update main product details (title, description, price)
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: title,
        description,
        price,
      },
    });

    // 4. Update product variants (colors and sizes)
    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    const colors = colorsStr ? colorsStr.split(",").map((c) => c.trim()).filter(Boolean) : [];
    const sizes = sizesStr ? sizesStr.split(",").map((s) => s.trim()).filter(Boolean) : [];

    const variantData = [];
    if (colors.length > 0 && sizes.length > 0) {
      for (const color of colors) {
        for (const size of sizes) {
          variantData.push({ productId, color, size });
        }
      }
    } else if (colors.length > 0) {
      for (const color of colors) {
        variantData.push({ productId, color });
      }
    } else if (sizes.length > 0) {
      for (const size of sizes) {
        variantData.push({ productId, size });
      }
    }

    if (variantData.length > 0) {
      await prisma.productVariant.createMany({
        data: variantData,
      });
    }

    // 5. Invalidate Redis product cache
    await redis.del("cached_products");

    // Revalidate product listing cache
    revalidatePath("/admin/dashboard/products");

    return { success: true, message: "Product updated successfully!" };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, message: error.message || "An unexpected error occurred." };
  }
}

// ==========================================
// DELETE PRODUCT SERVER ACTION
// ==========================================
export async function deleteProduct(productId: string) {
  try {
    // Fetch all images linked to this product
    const images = await prisma.productImage.findMany({
      where: { productId },
    });

    // Delete each image from Cloudinary
    for (const img of images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    // Delete product from database (Cascade will handle images and variants)
    await prisma.product.delete({
      where: { id: productId },
    });

    // Invalidate Redis product cache
    await redis.del("cached_products");

    revalidatePath("/admin/dashboard/products");

    return { success: true, message: "Product and associated images deleted successfully!" };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, message: error.message || "Failed to delete product." };
  }
}
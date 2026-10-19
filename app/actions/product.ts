'use server';

import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { revalidatePath } from 'next/cache';

// Configure Cloudinary using server environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to extract Cloudinary Public ID from Image URL
function getPublicIdFromUrl(url: string) {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const pathParts = parts.slice(uploadIndex + 1);
    if (pathParts[0].startsWith('v')) {
      pathParts.shift();
    }

    const fullPath = pathParts.join('/');
    const publicId = fullPath.substring(0, fullPath.lastIndexOf('.'));
    return publicId;
  } catch (error) {
    return null;
  }
}

interface VariantPayload {
  color: string | null;
  size: string | null;
  inStock?: boolean;
}

// ---------------- Create Product Action ----------------
export async function createProduct(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const colors = formData.get('colors') as string;
    const sizes = formData.get('sizes') as string;
    const imageFiles = formData.getAll('images') as File[];

    if (!title || isNaN(price)) {
      return { success: false, message: 'Title and valid price are required.' };
    }

    const uploadedImageUrls: string[] = [];

    for (const file of imageFiles) {
      if (file.size === 0) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });

      if (uploadResult?.secure_url) {
        uploadedImageUrls.push(uploadResult.secure_url);
      }
    }

    const colorArray = colors ? colors.split(',').map((c) => c.trim()).filter(Boolean) : [];
    const sizeArray = sizes ? sizes.split(',').map((s) => s.trim()).filter(Boolean) : [];

    const variantsData: { color: string; size: string | null }[] = [];

    if (colorArray.length > 0 && sizeArray.length > 0) {
      for (const color of colorArray) {
        for (const size of sizeArray) {
          variantsData.push({ color, size });
        }
      }
    } else if (colorArray.length > 0) {
      colorArray.forEach((color) => variantsData.push({ color, size: null }));
    } else if (sizeArray.length > 0) {
      sizeArray.forEach((size) => variantsData.push({ color: 'Default', size }));
    }

    const newProduct = await prisma.product.create({
      data: {
        name: title,
        description,
        price,
        images: {
          create: uploadedImageUrls.map((url) => ({ url })),
        },
        variants: {
          create: variantsData.length > 0 ? variantsData : [{ color: 'Default', size: null }],
        },
      },
    });

    revalidatePath('/products');
    revalidatePath('/admin/dashboard/products');

    return { 
      success: true, 
      message: 'Product created successfully!', 
      data: newProduct 
    };

  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'Internal Server Error' 
    };
  }
}

// ---------------- Update Product Action ----------------
export async function updateProduct(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const colorsStr = (formData.get("colors") as string) || "";
    const sizesStr = (formData.get("sizes") as string) || "";
    const newFiles = formData.getAll("images") as File[];

    if (!id) return { success: false, message: "Product ID is missing." };

    const newUploadedImageUrls: string[] = [];
    for (const file of newFiles) {
      if (file.size > 0 && file.name) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error || !result) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        if (uploadResult?.secure_url) {
          newUploadedImageUrls.push(uploadResult.secure_url);
        }
      }
    }

    const colors = colorsStr.split(",").map((c) => c.trim()).filter(Boolean);
    const sizes = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);

    const newVariants: VariantPayload[] = [];
    if (colors.length > 0 || sizes.length > 0) {
      const colorList = colors.length > 0 ? colors : [null];
      const sizeList = sizes.length > 0 ? sizes : [null];

      for (const color of colorList) {
        for (const size of sizeList) {
          newVariants.push({ color, size, inStock: true });
        }
      }
    }

    // Database Update using Prisma Transaction matching your schema (`productVariant`)
    await prisma.$transaction(async (tx) => {
      // 1. Update main product details
      await tx.product.update({
        where: { id },
        data: {
          name: title,
          description,
          price,
        },
      });

      // 2. Add new images if uploaded
      if (newUploadedImageUrls.length > 0) {
        await tx.productImage.createMany({
          data: newUploadedImageUrls.map((url) => ({
            url,
            productId: id,
          })),
        });
      }

      // 3. Update variants using `tx.productVariant` (matched with your schema model name)
      if (newVariants.length > 0) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        await tx.productVariant.createMany({
          data: newVariants.map((v) => ({
            color: v.color,
            size: v.size,
            inStock: v.inStock ?? true,
            productId: id,
          })),
        });
      }
    });

    revalidatePath("admin/dashboard/products");
    revalidatePath(`admin/dashboard/products/edit/${id}`);
    revalidatePath(`/product/${id}`);

    return { success: true, message: "প্রোডাক্ট সফলভাবে আপডেট হয়েছে!" };
  } catch (error: any) {
    return { success: false, message: error.message || "আপডেট ব্যর্থ হয়েছে।" };
  }
}

// ---------------- Delete Product Action (With Cloudinary Deletion) ----------------
export async function deleteProduct(productId: string) {
  try {
    if (!productId) return { success: false, message: "Invalid product ID" };

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) return { success: false, message: "Product not found" };

    for (const img of product.images) {
      const publicId = getPublicIdFromUrl(img.url);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/dashboard/products");
    return { success: true, message: "প্রোডাক্ট এবং ছবি ক্লাউডিনারি থেকে সফলভাবে মুছে ফেলা হয়েছে!" };
  } catch (error: any) {
    return { success: false, message: error.message || "ডিলিট করা সম্ভব হয়নি।" };
  }
}
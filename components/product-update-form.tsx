"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Save, Trash2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProduct, deleteProduct } from "@/app/actions/product";
import { toast } from "sonner";

type ProductImage = {
  id: string;
  url: string;
};

type ProductVariant = {
  id: string;
  color?: string | null;
  size?: string | null;
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  images: ProductImage[];
  variants: ProductVariant[];
};

type ImageItem =
  | { type: "existing"; id: string; url: string }
  | { type: "new"; file: File; url: string };

export function ProductUpdateForm({ product }: { product: Product }) {
  const router = useRouter();
  const [title, setTitle] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState<number | string>(product?.price || "");

  const existingColors = Array.from(
    new Set(product?.variants?.map((v) => v.color).filter(Boolean)),
  ).join(", ");

  const existingSizes = Array.from(
    new Set(product?.variants?.map((v) => v.size).filter(Boolean)),
  ).join(", ");

  const [colors, setColors] = useState(existingColors);
  const [sizes, setSizes] = useState(existingSizes);

  // Unified image items state to support reordering both existing and new images together
  const [imageItems, setImageItems] = useState<ImageItem[]>(
    product?.images
      ? product.images.map((img) => ({
          type: "existing" as const,
          id: img.id,
          url: img.url,
        }))
      : [],
  );

  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle image selection & preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newItems: ImageItem[] = filesArray.map((file) => ({
        type: "new",
        file,
        url: URL.createObjectURL(file),
      }));
      setImageItems((prev) => [...prev, ...newItems]);
    }
  };

  // Remove specific image (tracks deleted existing images for Cloudinary deletion)
  const handleRemoveImage = (index: number) => {
    const item = imageItems[index];
    if (item.type === "existing") {
      setDeletedImageIds((prev) => [...prev, item.id]);
    } else {
      URL.revokeObjectURL(item.url);
    }
    setImageItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Move Image Position (Reorder)
  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imageItems.length) return;

    const updated = [...imageItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setImageItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("id", product.id);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", String(price));
    formData.append("colors", colors);
    formData.append("sizes", sizes);

    // Send deleted image IDs so the backend can delete them from Cloudinary and database
    formData.append("deletedImageIds", JSON.stringify(deletedImageIds));

    // Send existing images order
    const existingIdsOrder = imageItems
      .filter((item): item is Extract<ImageItem, { type: "existing" }> => item.type === "existing")
      .map((item) => item.id);
    formData.append("existingImageIdsOrder", JSON.stringify(existingIdsOrder));

    // Send new files
    imageItems
      .filter((item): item is Extract<ImageItem, { type: "new" }> => item.type === "new")
      .forEach((item) => {
        formData.append("images", item.file);
      });

    startTransition(async () => {
      const res = await updateProduct(formData);
      if (res?.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error("Error: " + (res?.message || "আপডেট করা সম্ভব হয়নি।"));
      }
    });
  };

  // Confirm and Delete Handler
  const handleDelete = () => {
    const isConfirmed = window.confirm(
      `আপনি কি নিশ্চিত যে "${product.name}" ডিলিট করতে চান? ক্লাউডিনারি থেকেও ছবি মুছে যাবে!`,
    );

    if (isConfirmed) {
      setIsDeleting(true);
      startTransition(async () => {
        const res = await deleteProduct(product.id);
        if (res?.success) {
          toast.success(res.message);
          router.push("/admin/dashboard/products");
        } else {
          toast.error("Error: " + res?.message);
          setIsDeleting(false);
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" className="gap-2">
          <Link href="/admin/dashboard/products">
            <ArrowLeft className="size-4" />
            <span>লিস্টিং পেজে ফিরে যান</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {/* Delete Button with Confirm Alert */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || isPending}
            className="gap-2 cursor-pointer"
          >
            <Trash2 className="size-4" />
            <span>
              {isDeleting ? "মুছে ফেলা হচ্ছে..." : "প্রোডাক্ট ডিলিট করুন"}
            </span>
          </Button>

          <Button
            type="submit"
            disabled={isPending || isDeleting}
            className="gap-2 cursor-pointer"
          >
            <Save className="size-4" />
            <span>{isPending ? "আপডেট হচ্ছে..." : "সেভ ও আপডেট করুন"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                প্রোডাক্ট তথ্য (Edit Product)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">প্রোডাক্ট এর নাম (Title) *</Label>
                <Input
                  id="title"
                  placeholder="যেমন: প্রিমিয়াম কটন শার্ট"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">পণ্যের বিবরণ (Description)</Label>
                <Textarea
                  id="description"
                  rows={5}
                  placeholder="প্রোডাক্ট সম্পর্কে বিস্তারিত লিখুন..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                ছবি আপলোড ও সাজানো (Images & Reordering)
              </CardTitle>
              <CardDescription className="text-xs">
                ছবিগুলোর পজিশন পরিবর্তন করতে পারেন এবং মুছে ফেলা ছবি Cloudinary থেকে রিমুভ হবে।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imageItems.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {imageItems.map((item, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square overflow-hidden rounded-lg border bg-muted"
                    >
                      <NextImage
                        src={item.url}
                        alt={`Product Preview ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 33vw, 25vw"
                        className="object-cover"
                      />

                      {/* Cover Badge */}
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded z-10">
                          Cover
                        </span>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-white transition z-10"
                      >
                        <X className="size-3.5" />
                      </button>

                      {/* Reorder Controls */}
                      <div className="absolute bottom-1 left-1 right-1 flex justify-between gap-1 opacity-90 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs p-1 rounded z-10">
                        <button
                          type="button"
                          onClick={() => moveImage(index, "left")}
                          disabled={index === 0}
                          className="bg-background/80 text-foreground rounded p-1 text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-background"
                          title="Move left"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-white self-center font-medium">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveImage(index, "right")}
                          disabled={index === imageItems.length - 1}
                          className="bg-background/80 text-foreground rounded p-1 text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-background"
                          title="Move right"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                <Upload className="size-6 text-muted-foreground mb-2" />
                <Label
                  htmlFor="image-upload"
                  className="cursor-pointer text-sm font-medium text-primary hover:underline"
                >
                  নতুন ছবি যোগ করতে এখানে ক্লিক করুন
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-primary">
                মূল্য (Price) *
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-background font-bold text-lg"
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                ভ্যারিয়েন্ট (Variants Options)
              </CardTitle>
              <CardDescription className="text-xs">
                কমা (,) দিয়ে আলাদা করে একাধিক অপশন লিখুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="colors" className="text-xs">
                  রং (Colors)
                </Label>
                <Input
                  id="colors"
                  type="text"
                  placeholder="Black, White, Blue"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sizes" className="text-xs">
                  সাইজ (Sizes)
                </Label>
                <Input
                  id="sizes"
                  type="text"
                  placeholder="M, L, XL, XXL"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  className="text-xs"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
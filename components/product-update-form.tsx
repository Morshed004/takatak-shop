"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Save, Trash2 } from "lucide-react";

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

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const initialImages = product?.images
    ? product.images.map((img) => img.url)
    : [];
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialImages);

  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
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

    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    startTransition(async () => {
      const res = await updateProduct(formData);
      if (res?.success) {
        toast.success(res.message);
      } else {
        toast.error("Error: " + (res?.message || "আপডেট করা সম্ভব হয়নি।"));
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
                ছবি আপলোড (Images)
              </CardTitle>
              <CardDescription className="text-xs">
                নতুন ছবি যুক্ত করলে তা Cloudinary-তে আপলোড হবে।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {previewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                    >
                      <NextImage
                        src={url}
                        alt="Product Preview"
                        fill
                        sizes="(max-width: 768px) 33vw, 25vw"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-white transition"
                      >
                        <X className="size-3.5" />
                      </button>
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
                কমা (,) দিয়ে আলাদা করে একাধিক অপশন লিখুন।
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="colors" className="text-xs">
                  রং (Colors)
                </Label>
                <Input
                  id="colors"
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

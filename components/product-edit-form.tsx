"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, X, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { formatPrice } from "@/lib/businesskoro";
import { publishProduct } from "@/app/actions/product";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  suggestedPrice: number;
  inStock: boolean;
  images?: { url: string }[] | string[]; // স্ট্রিং বা অবজেক্ট দুটোই হ্যান্ডেল করার জন্য
  minimumSellingPrice?: {
    customerPaysDelivery: number;
  };
  costPrice?: number;
  packagingCost?: number;
};

export function ProductEditForm({ product }: { product: Product }) {
  const [title, setTitle] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [myPrice, setMyPrice] = useState<number | string>(product?.suggestedPrice || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // প্রিভিউ ইউআরএল হ্যান্ডেল করার নিরাপদ লজিক
  const initialImages = product?.images
    ? product.images.map((img) => (typeof img === "string" ? img : img.url))
    : [];
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialImages);
  
  const [isPending, startTransition] = useTransition();

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
    formData.append("id", product?.id || "");
    formData.append("name", title);
    formData.append("description", description);
    formData.append("adminPrice", String(myPrice));
    formData.append("suggestedPrice", String(product?.suggestedPrice || 0));
    formData.append("customerPaysDelivery", String(product?.minimumSellingPrice?.customerPaysDelivery || 0));

    // ফাইলগুলো FormData-তে অ্যাপেন্ড করা
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    startTransition(async () => {
      const res = await publishProduct(formData);
      if (res.success) {
        alert("Product published and saved to PostgreSQL successfully!");
      } else {
        alert("Error: " + res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* বাকি JSX কোড অপরিবর্তিত থাকবে */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" size="sm" asChild className="w-fit gap-2">
          <Link href="/dashboard/products">
            <ArrowLeft className="size-4" />
            <span>Back to Products</span>
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <Badge variant={product?.inStock ? "secondary" : "destructive"}>
            {product?.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
          <Button type="submit" disabled={isPending} className="gap-2 cursor-pointer">
            <CheckCircle2 className="size-4" />
            <span>{isPending ? "Uploading & Saving..." : "Publish Product"}</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Product Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Product Images</CardTitle>
              <CardDescription className="text-xs">
                Images will be uploaded to Cloudinary.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img src={url} alt="Preview" className="size-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-destructive hover:text-white"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                <Upload className="size-6 text-muted-foreground mb-2" />
                <Label htmlFor="image-upload" className="cursor-pointer text-sm font-medium text-primary hover:underline">
                  Select images to upload
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
              <CardTitle className="text-base font-semibold text-primary">Selling Price (৳)</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={myPrice}
                onChange={(e) => setMyPrice(e.target.value)}
                className="bg-background font-bold text-lg"
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Price References</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Suggested Price</span>
                <span className="font-semibold">{formatPrice(product?.suggestedPrice || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer Pays Delivery</span>
                <span className="font-semibold">{formatPrice(product?.minimumSellingPrice?.customerPaysDelivery || 0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
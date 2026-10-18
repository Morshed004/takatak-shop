"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, Loader2 } from "lucide-react";
import { createProduct } from "@/app/actions/product"; // Import Server Action

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [colors, setColors] = useState(""); 
  const [sizes, setSizes] = useState("");   
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Handle image selection & preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Remove specific image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission via Server Action
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("colors", colors);
      formData.append("sizes", sizes);

      images.forEach((image) => {
        formData.append("images", image);
      });

      // Call Server Action
      const result = await createProduct(formData);

      if (result.success) {
        alert("Product added successfully!");
        router.push("/dashboard/products");
      } else {
        // Server Action থেকে আসা নির্দিষ্ট এরর মেসেজ দেখাবে
        alert(`Failed: ${result.message}`);
      }
    } catch (error: any) {
      console.error("Client Error Detail:", error);
      // নির্দিষ্ট কোড বা টেক্সট এরর দেখাবে
      alert(`Error: ${error?.message || "An unexpected error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Product Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Product Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter product title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Product Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Write product description..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (BDT) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Optional Fields: Colors & Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="colors">Colors <span className="text-muted-foreground text-xs">(Optional, comma separated)</span></Label>
                <Input
                  id="colors"
                  type="text"
                  placeholder="Red, Blue, Black"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sizes">Sizes <span className="text-muted-foreground text-xs">(Optional, comma separated)</span></Label>
                <Input
                  id="sizes"
                  type="text"
                  placeholder="S, M, L, XL"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                />
              </div>
            </div>

            {/* Multiple Image Upload & Previews */}
            <div className="space-y-2">
              <Label>Product Images *</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Click to upload images</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, WEBP</span>
                </label>
              </div>

              {/* Image Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding Product...
                </>
              ) : (
                "Add Product"
              )}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
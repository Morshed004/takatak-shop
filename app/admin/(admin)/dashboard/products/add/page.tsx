"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, Loader2, ArrowLeft, ArrowRight, PackagePlus } from "lucide-react";
import { createProduct } from "@/app/actions/product"; // Import Server Action
import { toast } from "sonner";

// Purely presentational helper — no logic, no props beyond display text
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

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
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Move Image Position (Reorder)
  const moveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= images.length) return;

    // Swap Files
    const updatedImages = [...images];
    const [movedFile] = updatedImages.splice(index, 1);
    updatedImages.splice(targetIndex, 0, movedFile);
    setImages(updatedImages);

    // Swap Previews
    const updatedPreviews = [...imagePreviews];
    const [movedPreview] = updatedPreviews.splice(index, 1);
    updatedPreviews.splice(targetIndex, 0, movedPreview);
    setImagePreviews(updatedPreviews);
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

      // Sequentially append ordered images
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Call Server Action
      const result = await createProduct(formData);

      if (result.success) {
        toast.success("Product added successfully!");
        router.push("/admin/dashboard/products");
      } else {
        toast.error(`Failed: ${result.message}`);
      }
    } catch (error: any) {
      toast.error(`Error: ${error?.message || "An unexpected error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Page Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <PackagePlus className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Add New Product
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to create a new product listing.
          </p>
        </div>
      </div>

      <Card className="rounded-xl border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-base font-semibold text-foreground">
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <Section
              title="Basic Information"
              description="The product title and description shown to customers."
            >
              <div className="space-y-5">
                {/* Product Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Product Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Enter product title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="h-11 bg-background"
                  />
                </div>

                {/* Product Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Write product description..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="resize-y bg-background"
                  />
                </div>
              </div>
            </Section>

            {/* Pricing */}
            <Section
              title="Pricing"
              description="Set the price for this product."
            >
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Price (BDT) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="h-11 bg-background"
                />
              </div>
            </Section>

            {/* Variants */}
            <Section
              title="Variants"
              description="Optional — define available colors and sizes."
            >
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="colors" className="text-sm font-medium">
                    Colors{" "}
                    <span className="text-xs font-normal italic text-muted-foreground/80">
                      (Optional, comma separated)
                    </span>
                  </Label>
                  <Input
                    id="colors"
                    type="text"
                    placeholder="Red, Blue, Black"
                    value={colors}
                    onChange={(e) => setColors(e.target.value)}
                    className="h-11 bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sizes" className="text-sm font-medium">
                    Sizes{" "}
                    <span className="text-xs font-normal italic text-muted-foreground/80">
                      (Optional, comma separated)
                    </span>
                  </Label>
                  <Input
                    id="sizes"
                    type="text"
                    placeholder="S, M, L, XL"
                    value={sizes}
                    onChange={(e) => setSizes(e.target.value)}
                    className="h-11 bg-background"
                  />
                </div>
              </div>
            </Section>

            {/* Images */}
            <Section
              title="Product Images"
              description="Upload one or more images. You can reorder them — the first image will be the cover."
            >
              <div className="space-y-4">
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/40 hover:bg-muted/50">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex cursor-pointer flex-col items-center justify-center space-y-2"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Upload className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      Click to upload images
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP
                    </span>
                  </label>
                </div>

                {/* Image Previews Grid with Reordering */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {imagePreviews.map((src, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-background shadow-sm transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/20"
                      >
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        {/* Main Image Badge */}
                        {index === 0 && (
                          <span className="absolute left-1.5 top-1.5 rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm">
                            Cover
                          </span>
                        )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          aria-label={`Remove image ${index + 1}`}
                          className="absolute right-1.5 top-1.5 z-10 rounded-full bg-destructive p-1 text-destructive-foreground opacity-100 shadow-sm transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        {/* Reorder Buttons Controls */}
                        <div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1 rounded-md border border-border/40 bg-background/90 p-1 opacity-100 shadow-sm backdrop-blur transition sm:opacity-0 sm:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => moveImage(index, "left")}
                            disabled={index === 0}
                            aria-label={`Move image ${index + 1} left`}
                            title="Move left"
                            className="rounded p-1 text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" />
                          </button>
                          <span className="self-center text-[10px] font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => moveImage(index, "right")}
                            disabled={index === imagePreviews.length - 1}
                            aria-label={`Move image ${index + 1} right`}
                            title="Move right"
                            className="rounded p-1 text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Section>

            {/* Submit */}
            <div className="border-t border-border/60 pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-lg shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding
                    Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
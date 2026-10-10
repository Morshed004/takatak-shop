import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="flex flex-col items-center pt-8 pb-8 px-6">
            
            {/* Icon Container */}
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <FileQuestion className="size-8" />
            </div>

            {/* Error Code & Message */}
            <span className="text-xs font-semibold tracking-widest text-primary uppercase">
              404 Error
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Page Not Found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Sorry, we couldn&apos;t find the page you are looking for. It might have been moved or doesn&apos;t exist.
            </p>

          </CardContent>
        </Card>
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if already logged in as admin on page load
  useEffect(() => {
    async function checkExistingSession() {
      const { data: session } = await authClient.getSession();
      if (session) {
          router.replace("/admin/dashboard");
      }
    }
    checkExistingSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: async () => {
          setLoading(false);
          // Fetch updated session to ensure role exists
          const { data: session } = await authClient.getSession();
          const userRole = (session?.user as { role?: string })?.role;

          if (userRole === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
          router.refresh();
        },
        onError: (ctx) => {
          setLoading(false);
          setError(ctx.error.message || "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-muted">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">অ্যাডমিন লগইন</CardTitle>
          <CardDescription>
            অ্যাডমিন প্যানেল অ্যাক্সেস করতে আপনার ইমেল ও পাসওয়ার্ড দিন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">ইমেল এড্রেস</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
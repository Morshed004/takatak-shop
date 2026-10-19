
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "ইমেল অথবা পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।"
        );
        return;
      }

      // Fetch the latest session after successful login.
      const { data: session, error: sessionError } =
        await authClient.getSession();

      if (sessionError || !session) {
        setError(
          "লগইন সম্পন্ন হয়েছে, কিন্তু সেশন যাচাই করা যায়নি। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।"
        );
        return;
      }

      const userRole = (
        session.user as typeof session.user & {
          role?: string;
        }
      ).role;

      if (userRole === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }

      router.refresh();
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-muted shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            অ্যাডমিন লগইন
          </CardTitle>

          <CardDescription>
            অ্যাডমিন প্যানেল অ্যাক্সেস করতে আপনার
            ইমেল ও পাসওয়ার্ড দিন
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">ইমেল এড্রেস</Label>

              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label>

              <Input
                id="password"
                type="password"
                placeholder="আপনার পাসওয়ার্ড দিন"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

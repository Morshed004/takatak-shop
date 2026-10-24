"use client";

import { useState, useEffect } from "react";
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

const MAX_ATTEMPTS = 5; // Maximum allowed failed attempts
const LOCKOUT_TIME = 60 * 60; // Lockout duration in seconds (60 minutes)

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Rate limiting states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Check saved lockout timestamp and failed attempts on component mount
  useEffect(() => {
    const savedLockout = localStorage.getItem("login_lockout_until");
    if (savedLockout) {
      const remainingTime = Math.ceil((Number(savedLockout) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setLockoutTimer(remainingTime);
      } else {
        localStorage.removeItem("login_lockout_until");
      }
    }

    const savedAttempts = localStorage.getItem("login_failed_attempts");
    if (savedAttempts) {
      setFailedAttempts(Number(savedAttempts));
    }
  }, []);

  // Handle countdown interval for lockout timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;

    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          localStorage.removeItem("login_lockout_until");
          localStorage.removeItem("login_failed_attempts");
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Helper function to format seconds into MM:SS display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading || lockoutTimer > 0) return;

    setLoading(true);
    setError("");

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem("login_failed_attempts", newAttempts.toString());

        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutUntil = Date.now() + LOCKOUT_TIME * 1000;
          setLockoutTimer(LOCKOUT_TIME);
          localStorage.setItem("login_lockout_until", lockoutUntil.toString());
          setError(
            `অতিরিক্ত ভুল চেষ্টার কারণে লগইন সাময়িক বন্ধ রয়েছে। ৬০ মিনিট পর আবার চেষ্টা করুন।`
          );
        } else {
          setError(
            result.error.message ||
              `ইমেল অথবা পাসওয়ার্ড সঠিক নয়। আপনার আর ${MAX_ATTEMPTS - newAttempts} বার চেষ্টা করার সুযোগ আছে।`
          );
        }
        setLoading(false);
        return;
      }

      // Reset attempts and lockout state on successful login
      localStorage.removeItem("login_failed_attempts");
      localStorage.removeItem("login_lockout_until");

      // Fetch the latest session after successful login
      const { data: session, error: sessionError } =
        await authClient.getSession();

      if (sessionError || !session) {
        setError(
          "লগইন সম্পন্ন হয়েছে, কিন্তু সেশন যাচাই করা যায়নি। পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।"
        );
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
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

            {lockoutTimer > 0 && (
              <div
                role="alert"
                className="rounded-lg bg-amber-500/10 p-3 text-sm font-medium text-center text-amber-600"
              >
                অনুগ্রহ করে অপেক্ষা করুন: {formatTime(lockoutTimer)} মিনিট
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
                disabled={loading || lockoutTimer > 0}
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
                disabled={loading || lockoutTimer > 0}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || lockoutTimer > 0}
            >
              {loading
                ? "লগইন হচ্ছে..."
                : lockoutTimer > 0
                ? `লকডাউন (${formatTime(lockoutTimer)})`
                : "লগইন করুন"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
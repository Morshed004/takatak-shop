"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Menu,
  Key,
  AlertTriangle,
  CheckCircle2,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useGateway } from "@/context/GatewayContext";

export function AdminHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // useGateway হুক থেকে স্টেট ও ফাংশন নেওয়া
  const { apiKey, apiUrl, setGatewayConfig, isConfigured } = useGateway();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [inputUrl, setInputUrl] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // ডায়ালগ ওপেন হলে বর্তমান ভ্যালু ইনপুটে সেট হবে
  const handleOpenDialog = () => {
    setInputKey(apiKey);
    setInputUrl(apiUrl);
    setIsDialogOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayConfig(inputKey.trim(), inputUrl.trim());
    setIsDialogOpen(false);
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/admin/dashboard/products", icon: Package },
    { label: "Orders", href: "/admin/dashboard/orders", icon: ShoppingBag },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo & Admin Badge Section */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 overflow-hidden rounded-xl shadow-sm transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  fill
                  sizes="36"
                  alt="Takatak Logo"
                  className="object-cover"
                />
              </div>
              <span className="text-2xl font-black tracking-tight">
                Takatak<span className="text-primary">.</span>
              </span>
            </Link>
            <Badge
              variant="secondary"
              className="px-1.5 py-0.5 text-[10px] font-semibold uppercase"
            >
              Admin
            </Badge>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={`gap-2 text-sm font-medium ${
                    isActive
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link href={item.href} className="flex gap-2">
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Mobile Navigation Drawer */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger>
                <Button variant="outline" size="icon" className="size-9">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-70 sm:w-87.5">
                <SheetHeader className="border-b pb-4 text-left">
                  <SheetTitle className="text-lg font-bold">
                    Takatak Admin
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 py-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Button
                        key={item.href}
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start gap-3 text-sm ${
                          isActive
                            ? "font-semibold bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href={item.href} className="flex gap-2">
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Header-er niche Gateway Status / Warning Bar */}
        <div
          className={`border-t px-4 py-2 text-xs sm:px-6 lg:px-8 flex items-center justify-between transition-colors ${
            isConfigured
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
          }`}
        >
          <div className="mx-auto flex max-w-7xl w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isConfigured ? (
                <>
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Gateway API active (Session Memory).</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium">
                    Warning: Gateway API Key or URL is missing!
                  </span>
                </>
              )}
            </div>

            <Button
              variant={isConfigured ? "outline" : "default"}
              size="sm"
              onClick={handleOpenDialog}
              className="h-7 text-xs gap-1.5 px-2.5 shrink-0"
            >
              {isConfigured ? (
                <>
                  <Settings className="size-3.5" />
                  Edit Keys
                </>
              ) : (
                <>
                  <Key className="size-3.5" />
                  Configure Gateway
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Gateway API Settings Dialog / Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="size-5 text-primary" />
              Gateway API Configuration
            </DialogTitle>
            <DialogDescription>
              Set your Gateway API Key and API URL. Stored securely for this browser session.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSettings} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="gateway-url">GATEWAY API URL</Label>
              <Input
                id="gateway-url"
                type="url"
                placeholder="https://api.gateway.com/v1"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gateway-key">GATEWAY API KEY</Label>
              <Input
                id="gateway-key"
                type="password"
                placeholder="Enter your API Key"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Settings</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
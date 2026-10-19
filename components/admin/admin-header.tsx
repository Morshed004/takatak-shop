"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingBag, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";

export function AdminHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  // State to handle mobile menu open/close on navigation
  const [isOpen, setIsOpen] = useState(false);

  // Prevent hydration mismatch by ensuring component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      href: "/admin/dashboard/products",
      icon: Package,
    },
    {
      label: "Orders",
      href: "/admin/dashboard/orders",
      icon: ShoppingBag,
    },
  ];

  if (!mounted) {
    return null; // Avoid rendering SSR markup mismatch
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo & Admin Badge Section */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            {/* লোগো ইমেজ */}
            <div className="relative w-9 h-9 overflow-hidden rounded-xl shadow-sm transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Takatak Logo"
                fill
                className="object-cover"
              />
            </div>
            {/* টেক্সট */}
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

        {/* Desktop Navigation Links (Visible on medium screens and above) */}
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

        {/* Mobile Navigation Drawer (Visible on screens smaller than md) */}
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

              {/* Mobile Navigation Links */}
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
                      onClick={() => setIsOpen(false)} // Close sheet when a menu item is clicked
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
    </header>
  );
}

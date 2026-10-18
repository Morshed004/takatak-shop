"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by ensuring component is mounted
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
    return null; // Avoid rendering until mounted on client
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        
        {/* Logo & Admin Badge */}
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard" className="text-2xl font-bold tracking-tight">
            Takatak<span className="text-primary">.</span>
          </Link>
          <Badge variant="secondary" className="text-[10px] uppercase font-semibold px-1.5 py-0.5">
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
                <Link href={item.href} className="flex gap-1">
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger>
              <Button variant="outline" size="icon" className="size-9">
                <Menu className="size-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-70 sm:w-87.5">
              <SheetHeader className="border-b pb-4 text-left">
                <SheetTitle className="text-lg font-bold">
                  Takatak Admin
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 py-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Button
                      key={item.href}
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-3 ${
                        isActive ? "font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      <Link href={item.href}>
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
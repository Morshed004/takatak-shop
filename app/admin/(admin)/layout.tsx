import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // Better-auth configuration path
import { AdminHeader } from "@/components/admin/admin-header"; // AdminHeader Component Path

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard | Takatak",
    template: "%s | Takatak Admin",
  },
  description: "Takatak Admin Panel for managing products and orders",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session on server side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is not logged in, redirect to login
  if (!session) {
    redirect("/admin/login");
  }
  return (
    <div className="relative flex min-h-screen flex-col bg-background antialiased">
      <AdminHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
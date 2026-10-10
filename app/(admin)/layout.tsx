import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/admin-header"; // AdminHeader Component Path

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard | তাকাটাক",
    template: "%s | তাকাটাক Admin",
  },
  description: "Takatak Admin Panel for managing products and orders",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background antialiased">
      {/* Sticky Top Header */}
      <AdminHeader />

      {/* Main Content Area */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
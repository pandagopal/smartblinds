"use client";

import { usePathname } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import type { UserSession } from "@/types";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Record<string, string>;
  user: UserSession;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine which dashboard is active
  const isDashboardActive = {
    admin: pathname.includes("/dashboard/admin"),
    vendor: pathname.includes("/dashboard/vendor"),
    itops: pathname.includes("/dashboard/itops"),
    customer: pathname.includes("/dashboard/customer"),
    profile: pathname.includes("/dashboard/profile"),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* The Header component will be rendered on the server with the session data */}
      {children}
    </div>
  );
}

"use client";

import Link from "next/link";
import { UserNav } from "./user-nav";
import type { UserRole } from "@/types";

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: UserRole;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">Smart Blinds</span>
        </Link>

        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>

          {/* Admin links */}
          {user.role === "admin" && (
            <>
              <Link
                href="/dashboard/users"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Users
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Settings
              </Link>
            </>
          )}

          {/* Vendor links */}
          {user.role === "vendor" && (
            <>
              <Link
                href="/dashboard/products"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Products
              </Link>
              <Link
                href="/dashboard/orders"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Orders
              </Link>
            </>
          )}

          {/* IT Ops links */}
          {user.role === "itops" && (
            <>
              <Link
                href="/dashboard/systems"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Systems
              </Link>
              <Link
                href="/dashboard/monitoring"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Monitoring
              </Link>
            </>
          )}

          {/* Customer links */}
          {user.role === "customer" && (
            <>
              <Link
                href="/dashboard/my-blinds"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                My Blinds
              </Link>
              <Link
                href="/dashboard/orders"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Orders
              </Link>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <UserNav user={user} />
        </div>
      </div>
    </header>
  );
}

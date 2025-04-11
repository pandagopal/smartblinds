"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";

interface UserNavProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: UserRole;
  };
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get role display text with appropriate styling
  const getRoleDisplay = () => {
    const roles: Record<UserRole, { text: string; class: string }> = {
      admin: { text: "Administrator", class: "text-purple-600" },
      vendor: { text: "Vendor", class: "text-blue-600" },
      itops: { text: "IT Operations", class: "text-green-600" },
      customer: { text: "Customer", class: "text-amber-600" },
    };

    const role = roles[user.role] || roles.customer;
    return <span className={role.class}>{role.text}</span>;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none">
              Role: {getRoleDisplay()}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 cursor-pointer"
          onClick={handleLogout}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

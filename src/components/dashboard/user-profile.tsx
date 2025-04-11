"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types";

interface UserProfileSectionProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role: UserRole;
  };
}

export function UserProfileSection({ user }: UserProfileSectionProps) {
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

  // Get role badge with appropriate styling
  const getRoleBadge = () => {
    const roles: Record<
      UserRole,
      { text: string; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      admin: { text: "Administrator", variant: "default" },
      vendor: { text: "Vendor", variant: "secondary" },
      itops: { text: "IT Operations", variant: "outline" },
      customer: { text: "Customer", variant: "outline" },
    };

    const role = roles[user.role] || roles.customer;
    return <Badge variant={role.variant}>{role.text}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
          <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center space-y-2">
          <h3 className="text-xl font-semibold">{user.name || "User"}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          {getRoleBadge()}
        </div>
      </CardContent>
    </Card>
  );
}

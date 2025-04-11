"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      // Map error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        Configuration: "There is a problem with the server configuration.",
        AccessDenied: "You do not have access to this resource.",
        Verification: "The verification link may have been used or expired.",
        Default: "An unexpected error occurred during authentication.",
      };

      setError(errorMessages[errorParam] || errorMessages.Default);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-700">{error || "An unknown error occurred"}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/signin">Back to Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";

export function SignInButtons() {
  const [isLoading, setIsLoading] = useState<{
    google: boolean;
    facebook: boolean;
    apple: boolean;
  }>({
    google: false,
    facebook: false,
    apple: false,
  });

  const handleSignIn = async (provider: "google" | "facebook" | "apple") => {
    try {
      setIsLoading({ ...isLoading, [provider]: true });
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
    } finally {
      setIsLoading({ ...isLoading, [provider]: false });
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <Button
        variant="outline"
        className="flex items-center justify-center gap-2"
        onClick={() => handleSignIn("google")}
        disabled={isLoading.google}
      >
        <FcGoogle className="h-5 w-5" />
        {isLoading.google ? "Signing in..." : "Continue with Google"}
      </Button>

      <Button
        variant="outline"
        className="flex items-center justify-center gap-2 bg-[#1877F2] text-white hover:bg-[#166FE5]"
        onClick={() => handleSignIn("facebook")}
        disabled={isLoading.facebook}
      >
        <FaFacebook className="h-5 w-5 text-white" />
        {isLoading.facebook ? "Signing in..." : "Continue with Facebook"}
      </Button>

      <Button
        variant="outline"
        className="flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800"
        onClick={() => handleSignIn("apple")}
        disabled={isLoading.apple}
      >
        <FaApple className="h-5 w-5" />
        {isLoading.apple ? "Signing in..." : "Continue with Apple"}
      </Button>
    </div>
  );
}

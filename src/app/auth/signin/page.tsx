import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInButtons } from "@/components/auth/sign-in-buttons";

export default async function SignInPage() {
  // If the user is already logged in, redirect to dashboard
  const session = await auth();
  if (session?.user) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-12">
      <div className="flex w-full max-w-md flex-col items-center space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Image
            src="/logo.png"
            alt="SmartBlinds Logo"
            width={80}
            height={80}
            className="rounded-xl"
          />
          <h1 className="text-3xl font-bold">Smart Blinds</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in using one of the providers below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInButtons />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

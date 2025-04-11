import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">Smart Blinds</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {session?.user ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-zinc-100 to-white px-4 py-24 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Smart Blinds
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
            The smart solution for your modern home. Control your blinds from anywhere.
          </p>
          <div className="mx-auto mt-10 max-w-sm">
            {session?.user ? (
              <Button asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href="/auth/signin">Get Started</Link>
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

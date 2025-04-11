import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserProfileSection } from "@/components/dashboard/user-profile";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session.user} />

      <main className="container mx-auto p-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <UserProfileSection user={session.user} />
          </div>

          <div className="rounded-lg border bg-white p-6 shadow lg:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Welcome to Smart Blinds Dashboard</h2>
            <p className="text-gray-600">
              You are logged in as <span className="font-medium">{session.user.role}</span>.
            </p>

            {/* Display different content based on user role */}
            {session.user.role === "admin" && (
              <div className="mt-4 rounded-lg bg-purple-50 p-4">
                <h3 className="font-medium text-purple-700">Admin Section</h3>
                <p className="mt-2 text-purple-600">
                  You have access to all system functions, user management, and analytics.
                </p>
              </div>
            )}

            {session.user.role === "vendor" && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <h3 className="font-medium text-blue-700">Vendor Section</h3>
                <p className="mt-2 text-blue-600">
                  You can manage your products, inventory, and view sales analytics.
                </p>
              </div>
            )}

            {session.user.role === "itops" && (
              <div className="mt-4 rounded-lg bg-green-50 p-4">
                <h3 className="font-medium text-green-700">IT Operations Section</h3>
                <p className="mt-2 text-green-600">
                  You have access to system monitoring, maintenance tasks, and configuration settings.
                </p>
              </div>
            )}

            {session.user.role === "customer" && (
              <div className="mt-4 rounded-lg bg-amber-50 p-4">
                <h3 className="font-medium text-amber-700">Customer Section</h3>
                <p className="mt-2 text-amber-600">
                  Browse products, manage your smart blinds, and view your purchase history.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

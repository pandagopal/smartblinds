import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UserProfileSection } from "@/components/dashboard/user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ITOpsDashboardPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    return redirect("/auth/signin");
  }

  // If user is not an IT Operations person, redirect to their appropriate dashboard
  if (session.user.role !== "itops") {
    return redirect(`/dashboard/${session.user.role}`);
  }

  return (
    <>
      <DashboardHeader user={session.user} />

      <main className="container mx-auto p-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">IT Operations Dashboard</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <UserProfileSection user={session.user} />
          </div>

          <div className="grid gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Overview of all systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="font-medium">API Gateway</h3>
                      <p className="text-sm text-gray-500">v2.4.1</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="font-medium">Authentication Service</h3>
                      <p className="text-sm text-gray-500">v1.9.3</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="font-medium">Database Cluster</h3>
                      <p className="text-sm text-gray-500">PostgreSQL 15.3</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500" />
                      <span className="text-sm font-medium text-yellow-600">Performance Issues</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="font-medium">IoT Message Queue</h3>
                      <p className="text-sm text-gray-500">MQTT Broker</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="outline">View Detailed Reports</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Devices</CardTitle>
                <CardDescription>Connected smart blinds statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-gray-100 p-4">
                    <h3 className="font-medium text-gray-800">Total Devices</h3>
                    <p className="mt-2 text-3xl font-bold">5,783</p>
                    <p className="text-sm text-gray-600">+124 from last week</p>
                  </div>

                  <div className="rounded-lg bg-gray-100 p-4">
                    <h3 className="font-medium text-gray-800">Active Now</h3>
                    <p className="mt-2 text-3xl font-bold">4,921</p>
                    <p className="text-sm text-gray-600">85% uptime</p>
                  </div>

                  <div className="rounded-lg bg-gray-100 p-4">
                    <h3 className="font-medium text-gray-800">Needs Attention</h3>
                    <p className="mt-2 text-3xl font-bold">47</p>
                    <p className="text-sm text-red-600">13 critical issues</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="mb-2 font-medium">Firmware Versions</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">v2.1.4 (Latest)</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 w-[68%] rounded-full bg-green-500" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">v2.1.3</span>
                      <span className="text-sm font-medium">24%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 w-[24%] rounded-full bg-blue-500" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">v2.1.2 or older</span>
                      <span className="text-sm font-medium">8%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 w-[8%] rounded-full bg-yellow-500" />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button variant="outline">View Device Inventory</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

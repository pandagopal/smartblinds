import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UserProfileSection } from "@/components/dashboard/user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    return redirect("/auth/signin");
  }

  // If user is not an admin, redirect to their appropriate dashboard
  if (session.user.role !== "admin") {
    return redirect(`/dashboard/${session.user.role}`);
  }

  return (
    <>
      <DashboardHeader user={session.user} />

      <main className="container mx-auto p-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <UserProfileSection user={session.user} />
          </div>

          <div className="grid gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>Monitor the entire platform at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-100 p-4">
                    <h3 className="font-medium text-gray-800">Users</h3>
                    <p className="mt-2 text-3xl font-bold">1,245</p>
                    <p className="text-sm text-gray-600">+5% from last week</p>
                  </div>

                  <div className="rounded-lg bg-gray-100 p-4">
                    <h3 className="font-medium text-gray-800">Vendors</h3>
                    <p className="mt-2 text-3xl font-bold">34</p>
                    <p className="text-sm text-gray-600">+2 new this month</p>
                  </div>

                  <div className="rounded-lg bg-gray-100 p-4">
                    <h3 className="font-medium text-gray-800">Active Devices</h3>
                    <p className="mt-2 text-3xl font-bold">5,783</p>
                    <p className="text-sm text-gray-600">98.7% uptime</p>
                  </div>

                  <div className="rounded-lg bg-gray-100 p-4">
                    <h3 className="font-medium text-gray-800">Revenue</h3>
                    <p className="mt-2 text-3xl font-bold">$284,592</p>
                    <p className="text-sm text-gray-600">+12.5% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-800">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium">New user registration</p>
                      <p className="text-sm text-gray-600">Sarah Johnson registered as a new customer</p>
                      <p className="text-xs text-gray-500">10 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"></path><polyline points="9 22 9 12 15 12 15 22"></polyline><path d="M12 12v3"></path><path d="M21 16v3"></path><path d="M21 13v-2.5a1.5 1.5 0 0 0-3 0V13"></path><path d="M18 13h6"></path></svg>
                    </div>
                    <div>
                      <p className="font-medium">New vendor onboarded</p>
                      <p className="text-sm text-gray-600">BlindTech Inc. completed verification</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><line x1="8" x2="8" y1="15" y2="17"></line><line x1="16" x2="16" y1="15" y2="17"></line><line x1="12" x2="12" y1="15" y2="17"></line></svg>
                    </div>
                    <div>
                      <p className="font-medium">System maintenance completed</p>
                      <p className="text-sm text-gray-600">Server upgrades successfully deployed</p>
                      <p className="text-xs text-gray-500">Yesterday, 11:30 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

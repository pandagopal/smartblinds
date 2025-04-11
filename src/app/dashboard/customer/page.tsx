import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UserProfileSection } from "@/components/dashboard/user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CustomerDashboardPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    return redirect("/auth/signin");
  }

  // If user is not a customer, redirect to their appropriate dashboard
  if (session.user.role !== "customer") {
    return redirect(`/dashboard/${session.user.role}`);
  }

  return (
    <>
      <DashboardHeader user={session.user} />

      <main className="container mx-auto p-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Customer Dashboard</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <UserProfileSection user={session.user} />
          </div>

          <div className="grid gap-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Blinds</CardTitle>
                <CardDescription>Your connected smart blinds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button className="w-full sm:w-auto">Connect New Blind</Button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">Living Room Blind</h3>
                        <p className="text-sm text-gray-500">Last updated: 5 minutes ago</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                        <span className="text-sm font-medium text-green-600">Online</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Open</Button>
                        <Button variant="outline" size="sm">Close</Button>
                        <Button variant="outline" size="sm">50%</Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">Bedroom Blind</h3>
                        <p className="text-sm text-gray-500">Last updated: 2 hours ago</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                        <span className="text-sm font-medium text-green-600">Online</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Open</Button>
                        <Button variant="outline" size="sm">Close</Button>
                        <Button variant="outline" size="sm">50%</Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="font-medium">Kitchen Blind</h3>
                        <p className="text-sm text-gray-500">Last updated: 1 day ago</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                        <span className="text-sm font-medium text-yellow-600">Low Battery</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Open</Button>
                        <Button variant="outline" size="sm">Close</Button>
                        <Button variant="outline" size="sm">50%</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>Automated operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Button variant="outline" className="w-full sm:w-auto">Add New Schedule</Button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Morning Routine</h3>
                        <p className="text-sm text-gray-500">Opens living room blinds at 7:00 AM</p>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-8 cursor-pointer rounded-full bg-green-500 p-1">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Evening Mode</h3>
                        <p className="text-sm text-gray-500">Closes all blinds at 8:00 PM</p>
                      </div>
                      <div className="flex items-center">
                        <div className="mr-2 h-4 w-8 cursor-pointer rounded-full bg-green-500 p-1">
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
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

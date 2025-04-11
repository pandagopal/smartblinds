import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { UserProfileSection } from "@/components/dashboard/user-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VendorProfileForm } from "@/components/dashboard/vendor/vendor-profile-form";

export default async function VendorDashboardPage() {
  const session = await auth();

  // Redirect to sign in if not authenticated
  if (!session?.user) {
    return redirect("/auth/signin");
  }

  // If user is not a vendor, redirect to their appropriate dashboard
  if (session.user.role !== "vendor") {
    return redirect(`/dashboard/${session.user.role}`);
  }

  return (
    <>
      <DashboardHeader user={session.user} />

      <main className="container mx-auto p-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Vendor Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <UserProfileSection user={session.user} />
          </div>

          <div className="md:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="profile">Company Profile</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              {/* Company Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Profile</CardTitle>
                    <CardDescription>
                      Manage your company information and settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VendorProfileForm />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Products</CardTitle>
                      <CardDescription>
                        Manage your smart blind products
                      </CardDescription>
                    </div>
                    <Button>Add New Product</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Product 1 */}
                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Premium Smart Blinds</h3>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Active</span>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">SKU</p>
                            <p>SB-PREMIUM-001</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Price</p>
                            <p>$199.99</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Manufacturing Lead Time</p>
                            <p>7-10 business days</p>
                          </div>
                        </div>
                      </div>

                      {/* Product 2 */}
                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Basic Smart Blinds</h3>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Active</span>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">SKU</p>
                            <p>SB-BASIC-001</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Price</p>
                            <p>$99.99</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Manufacturing Lead Time</p>
                            <p>3-5 business days</p>
                          </div>
                        </div>
                      </div>

                      {/* Product 3 */}
                      <div className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Solar-Powered Smart Blinds</h3>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">Pre-Order</span>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium text-gray-500">SKU</p>
                            <p>SB-SOLAR-001</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Price</p>
                            <p>$249.99</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Manufacturing Lead Time</p>
                            <p>14-21 business days</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Legal & KYC Documents</CardTitle>
                    <CardDescription>
                      Upload required business documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="rounded-md border p-6">
                        <h3 className="mb-4 text-lg font-medium">Business License</h3>
                        <div className="mb-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <div className="mt-1 flex items-center">
                              <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                              <p className="text-sm text-green-600">Verified</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Expiration</p>
                            <p>December 31, 2025</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">View Document</Button>
                          <Button variant="outline" size="sm">Upload New</Button>
                        </div>
                      </div>

                      <div className="rounded-md border p-6">
                        <h3 className="mb-4 text-lg font-medium">General Liability Insurance</h3>
                        <div className="mb-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <div className="mt-1 flex items-center">
                              <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                              <p className="text-sm text-green-600">Verified</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Expiration</p>
                            <p>June 15, 2025</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">View Document</Button>
                          <Button variant="outline" size="sm">Upload New</Button>
                        </div>
                      </div>

                      <div className="rounded-md border p-6">
                        <h3 className="mb-4 text-lg font-medium">Tax ID Verification</h3>
                        <div className="mb-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <div className="mt-1 flex items-center">
                              <span className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                              <p className="text-sm text-yellow-600">Pending Verification</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Submitted</p>
                            <p>April 10, 2025</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">View Document</Button>
                          <Button variant="outline" size="sm">Upload New</Button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <Button>Upload Additional Document</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
}

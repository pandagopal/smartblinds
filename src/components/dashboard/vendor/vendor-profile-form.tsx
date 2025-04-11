"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export function VendorProfileForm() {
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: "Smart Blinds Manufacturing, Inc.",
    tagline: "Innovative Smart Blinds Solutions for Modern Homes",
    description: "We specialize in manufacturing high-quality smart blinds with innovative features that integrate seamlessly with modern smart home systems.",
    salesEmail: "sales@smartblindsmfg.com",
    salesPhone: "+1 (555) 123-4567",
    supportEmail: "support@smartblindsmfg.com",
    supportPhone: "+1 (555) 765-4321",
    defaultLeadTime: "7-10 business days",
    rushLeadTime: "3-5 business days (additional fee applies)",
    mainAddress: "123 Manufacturing Way, Suite 400, San Jose, CA 95131",
    shippingAddresses: [
      "123 Manufacturing Way, Suite 400, San Jose, CA 95131",
      "456 Production Blvd, Warehouse 7, Dallas, TX 75001"
    ],
    businessHours: "Monday - Friday: 8:00 AM - 5:00 PM (PST)",
    holidays: [
      "New Year's Day",
      "Memorial Day",
      "Independence Day",
      "Labor Day",
      "Thanksgiving Day",
      "Christmas Day"
    ],
    blackoutDates: [
      "July 15 - July 30, 2025 (Annual Inventory)",
      "December 24 - January 2, 2026 (Holiday Break)"
    ]
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    setProfileData({
      ...profileData,
      [field]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);

    // Simulate saving to API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Company Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium">Company Information</h3>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={profileData.companyName}
              onChange={(e) => handleInputChange(e, "companyName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={profileData.tagline}
              onChange={(e) => handleInputChange(e, "tagline")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Company Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={profileData.description}
            onChange={(e) => handleInputChange(e, "description")}
          />
        </div>
      </div>

      <Separator />

      {/* Logo & Banner */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Logo & Banner</h3>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-4">
            <p className="text-sm">Company Logo (Square format recommended)</p>
            <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative h-40 w-40 overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src="/logo.png"
                    alt="Company logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <Button variant="outline" size="sm">Upload New Logo</Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm">Banner Image (1200x400px recommended)</p>
            <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4">
              <div className="flex flex-col items-center gap-2">
                <div className="relative h-32 w-full overflow-hidden rounded-md bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-gray-500">No banner uploaded</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Upload Banner</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Contact Information</h3>

        <Card>
          <CardHeader>
            <CardTitle>Sales Department</CardTitle>
            <CardDescription>Contact information for sales inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salesEmail">Email</Label>
                <Input
                  id="salesEmail"
                  type="email"
                  value={profileData.salesEmail}
                  onChange={(e) => handleInputChange(e, "salesEmail")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salesPhone">Phone</Label>
                <Input
                  id="salesPhone"
                  type="tel"
                  value={profileData.salesPhone}
                  onChange={(e) => handleInputChange(e, "salesPhone")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support Department</CardTitle>
            <CardDescription>Contact information for customer support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={profileData.supportEmail}
                  onChange={(e) => handleInputChange(e, "supportEmail")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportPhone">Phone</Label>
                <Input
                  id="supportPhone"
                  type="tel"
                  value={profileData.supportPhone}
                  onChange={(e) => handleInputChange(e, "supportPhone")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Manufacturing Information */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Manufacturing Information</h3>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="defaultLeadTime">Default Manufacturing Lead Time</Label>
            <Input
              id="defaultLeadTime"
              value={profileData.defaultLeadTime}
              onChange={(e) => handleInputChange(e, "defaultLeadTime")}
            />
            <p className="text-xs text-gray-500">
              The typical time required to manufacture products once an order is placed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rushLeadTime">Rush Order Lead Time (Optional)</Label>
            <Input
              id="rushLeadTime"
              value={profileData.rushLeadTime}
              onChange={(e) => handleInputChange(e, "rushLeadTime")}
            />
            <p className="text-xs text-gray-500">
              If you offer expedited manufacturing, specify the lead time and any additional costs
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Shipping & Addresses */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Shipping & Addresses</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="mainAddress">Main Business Address</Label>
            <Textarea
              id="mainAddress"
              value={profileData.mainAddress}
              onChange={(e) => handleInputChange(e, "mainAddress")}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Shipping Origin Addresses</Label>
            <div className="mt-2 space-y-2">
              {profileData.shippingAddresses.map((address, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Textarea
                    value={address}
                    className="flex-1"
                    rows={2}
                    readOnly
                  />
                  <Button variant="outline" size="sm" className="mt-1 shrink-0">
                    Edit
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2">
                Add Shipping Address
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Business Hours & Blackout Dates */}
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Business Hours & Availability</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessHours">Regular Business Hours</Label>
            <Input
              id="businessHours"
              value={profileData.businessHours}
              onChange={(e) => handleInputChange(e, "businessHours")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holidays">Company Holidays</Label>
            <div className="mt-2 space-y-2">
              {profileData.holidays.map((holiday, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={holiday} readOnly />
                  <Button variant="outline" size="sm" className="shrink-0">
                    Edit
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2">
                Add Holiday
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blackoutDates">Production Blackout Dates</Label>
            <p className="text-xs text-gray-500">
              Periods when your manufacturing facility is closed or not accepting orders
            </p>
            <div className="mt-2 space-y-2">
              {profileData.blackoutDates.map((date, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={date} readOnly />
                  <Button variant="outline" size="sm" className="shrink-0">
                    Edit
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2">
                Add Blackout Period
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  );
}

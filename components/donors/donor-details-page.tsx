"use client";

/**
 * Donor Details Page Component
 * 
 * Advanced, modern, responsive donor details page with:
 * - Complete donor information
 * - Donation history
 * - Reports section (for future)
 * - Activity logs
 * - Certificate download
 * - Previous/Next navigation
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplets,
  Heart,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Activity,
  History,
  FileCheck,
  Bell,
  Clock,
  Scale,
  Ruler,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { DonorCertificate } from "./donor-certificate";
import { DonorReports } from "./donor-reports";

interface DonorDetailsPageProps {
  donor: any;
  previousDonor?: any;
  nextDonor?: any;
}

export function DonorDetailsPage({ donor, previousDonor, nextDonor }: DonorDetailsPageProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      blocked: "destructive",
      suspended: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(new Date(donor.dateOfBirth));
  const totalDonations = donor.donatedBefore ? 1 : 0; // Placeholder - will be from donation history
  const reportsCount = 0; // Placeholder for future reports feature
  const messagesCount = 0; // Placeholder for future messages feature

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/blood-panel")}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Donor Profile</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Complete donor information and history
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {previousDonor && (
            <Link href={`/dashboard/blood-panel/${previousDonor.id}`} className="shrink-0">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            </Link>
          )}
          {nextDonor && (
            <Link href={`/dashboard/blood-panel/${nextDonor.id}`} className="shrink-0">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Donor Profile Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 bg-red-600 text-white text-xl sm:text-2xl font-bold shrink-0">
              <AvatarFallback>{getInitials(donor.fullName)}</AvatarFallback>
            </Avatar>

            {/* Donor Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold truncate">{donor.fullName}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    Donor ID: #{donor.donorId}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/dashboard/blood-panel/${donor.id}/edit`}>
                    <Button variant="default" size="sm" className="w-full sm:w-auto">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <DonorCertificate donor={donor} />
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm sm:text-base truncate">{donor.mobileNumber}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Droplets className="h-4 w-4 text-red-600 shrink-0" />
                  <span className="text-sm sm:text-base">Blood Group: </span>
                  <Badge variant="destructive" className="ml-1">{donor.bloodGroup}</Badge>
                </div>
                {donor.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm sm:text-base truncate">{donor.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm sm:text-base">
                    Age: {age} years, {donor.gender}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <Droplets className="h-8 w-8 sm:h-10 sm:w-10 text-red-200 mb-2" />
              <div className="text-2xl sm:text-3xl font-bold">{totalDonations}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                Total Donations
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-green-200 mb-2" />
              <div className="text-lg sm:text-2xl font-bold">
                {donor.lastDonationDate
                  ? format(new Date(donor.lastDonationDate), "yyyy-MM-dd")
                  : "N/A"}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                Last Donation
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <FileCheck className="h-8 w-8 sm:h-10 sm:w-10 text-blue-200 mb-2" />
              <div className="text-2xl sm:text-3xl font-bold">{reportsCount}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                Reports Uploaded
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-purple-200 mb-2" />
              <div className="text-2xl sm:text-3xl font-bold">{messagesCount}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                Messages Sent
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">Donation History</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
          <TabsTrigger value="logs" className="text-xs sm:text-sm">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">First Name</p>
                    <p className="font-medium text-sm sm:text-base">{donor.firstName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Last Name</p>
                    <p className="font-medium text-sm sm:text-base">{donor.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Date of Birth</p>
                    <p className="font-medium text-sm sm:text-base">
                      {format(new Date(donor.dateOfBirth), "dd MMM yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Gender</p>
                    <p className="font-medium text-sm sm:text-base">{donor.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Weight</p>
                    <p className="font-medium text-sm sm:text-base">{donor.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">Height</p>
                    <p className="font-medium text-sm sm:text-base">{donor.height} cm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Mobile</p>
                      <p className="font-medium text-sm sm:text-base truncate">{donor.mobileNumber}</p>
                    </div>
                  </div>
                  {donor.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                        <p className="font-medium text-sm sm:text-base truncate">{donor.email}</p>
                      </div>
                    </div>
                  )}
                  {donor.aadharNumber && (
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Aadhar Number</p>
                        <p className="font-medium text-sm sm:text-base truncate">{donor.aadharNumber}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-sm sm:text-base">{donor.permanentAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {donor.city}, {donor.state} - {donor.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Heart className="h-5 w-5" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taking Medication</span>
                    <Badge variant={donor.takingMedication ? "destructive" : "outline"}>
                      {donor.takingMedication ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {donor.takingMedication && donor.medicationDetails && (
                    <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-2 rounded">
                      {donor.medicationDetails}
                    </p>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Chronic Illness</span>
                    <Badge variant={donor.chronicIllness ? "destructive" : "outline"}>
                      {donor.chronicIllness ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {donor.chronicIllness && donor.illnessDetails && (
                    <p className="text-xs sm:text-sm text-muted-foreground bg-muted p-2 rounded">
                      {donor.illnessDetails}
                    </p>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Donated Before</span>
                    <Badge variant={donor.donatedBefore ? "default" : "outline"}>
                      {donor.donatedBefore ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {donor.donatedBefore && donor.lastDonationDate && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Last donation: {format(new Date(donor.lastDonationDate), "dd MMM yyyy")}
                    </p>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eligible for Donation</span>
                    {donor.eligibleForDonation ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="h-5 w-5" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regular Donor</span>
                    <Badge variant={donor.willingToBeRegularDonor ? "default" : "outline"}>
                      {donor.willingToBeRegularDonor ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      Notification Preferences
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {donor.notificationPreference?.length > 0 ? (
                        donor.notificationPreference.map((pref: string) => (
                          <Badge key={pref} variant="secondary" className="text-xs">
                            {pref}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">None selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Donation History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Donation History
              </CardTitle>
              <CardDescription>Complete history of blood donations</CardDescription>
            </CardHeader>
            <CardContent>
              {donor.donatedBefore && donor.lastDonationDate ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Last Donation</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(donor.lastDonationDate), "dd MMM yyyy")}
                      </p>
                    </div>
                    <Badge variant="default">Completed</Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donation history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <DonorReports donorId={donor.id} donorName={donor.fullName} />
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Logs
              </CardTitle>
              <CardDescription>Notifications, reminders, and activity history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full shrink-0">
                    <Bell className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base">Registration Notification</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Donor registered successfully on{" "}
                      {format(new Date(donor.createdAt), "dd MMM yyyy 'at' hh:mm a")}
                    </p>
                  </div>
                </div>
                {donor.willingToBeRegularDonor && (
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full shrink-0">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base">Next Donation Reminder</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Eligible for next donation after{" "}
                        {donor.lastDonationDate
                          ? format(new Date(donor.lastDonationDate), "dd MMM yyyy")
                          : "registration"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

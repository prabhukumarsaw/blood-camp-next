"use client";

/**
 * Advanced Donor Registration Form - Single Page
 * 
 * Medical Platform - Blood Donor Registration System
 * 
 * Modern single-page form with:
 * - All fields in one scrollable view
 * - Real-time validation and auto-save
 * - Preview functionality
 * - Advanced PDF certificate generation
 * - Session storage persistence
 */

import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createDonor, updateDonor } from "@/lib/actions/donors";
import { donorFormSchema, DonorFormData, DONOR_DRAFT_STORAGE_KEY } from "@/lib/schemas/donor-form-schema";
import { BloodGroup, Gender, NotificationPreference } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  User, Phone, Mail, Heart, Shield, Eye, 
  Save, Trash2, CheckCircle, Loader2,
  Scale, Ruler
} from "lucide-react";
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS, NOTIFICATION_OPTIONS } from "@/lib/schemas/donor-form-schema";
import { format } from "date-fns";
import { DonorCertificate } from "./donor-certificate";

interface AdvancedDonorFormProps {
  initialData?: Partial<DonorFormData>;
  donorId?: string;
  redirectPath?: string;
}

export function AdvancedDonorForm({ initialData, donorId, redirectPath }: AdvancedDonorFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedDonor, setSubmittedDonor] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<DonorFormData>({
    resolver: zodResolver(donorFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      gender: initialData?.gender || undefined,
      bloodGroup: initialData?.bloodGroup || undefined,
      weight: initialData?.weight || "",
      height: initialData?.height || "",
      mobileNumber: initialData?.mobileNumber || "",
      email: initialData?.email || "",
      aadharNumber: initialData?.aadharNumber || "",
      permanentAddress: initialData?.permanentAddress || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      pincode: initialData?.pincode || "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactNumber: initialData?.emergencyContactNumber || "",
      takingMedication: initialData?.takingMedication || false,
      medicationDetails: initialData?.medicationDetails || "",
      chronicIllness: initialData?.chronicIllness || false,
      illnessDetails: initialData?.illnessDetails || "",
      donatedBefore: initialData?.donatedBefore || false,
      lastDonationDate: initialData?.lastDonationDate || "",
      surgeryInLast6Months: initialData?.surgeryInLast6Months || false,
      surgeryDetails: initialData?.surgeryDetails || "",
      smokeOrAlcohol: initialData?.smokeOrAlcohol || false,
      eligibleForDonation: initialData?.eligibleForDonation || false,
      medicalNotes: initialData?.medicalNotes || "",
      willingToBeRegularDonor: initialData?.willingToBeRegularDonor || false,
      notificationPreference: initialData?.notificationPreference || [],
      consentToUseData: initialData?.consentToUseData || false,
      confirmInformationAccurate: initialData?.confirmInformationAccurate || false,
    },
  });

  // Load draft from session storage on mount
  useEffect(() => {
    if (!initialData && typeof window !== "undefined") {
      const draft = sessionStorage.getItem(DONOR_DRAFT_STORAGE_KEY);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          form.reset(parsed);
          toast({
            title: "Draft Restored",
            description: "Your previous form data has been restored.",
          });
        } catch (e) {
          console.error("Failed to load draft:", e);
        }
      }
    }
  }, [form, initialData, toast]);

  // Auto-save draft with debounce
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (typeof window !== "undefined") {
        const timeoutId = setTimeout(() => {
          sessionStorage.setItem(DONOR_DRAFT_STORAGE_KEY, JSON.stringify(value));
        }, 500); // Debounce 500ms
        return () => clearTimeout(timeoutId);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Save draft manually
  const handleSaveDraft = useCallback(() => {
    const data = form.getValues();
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DONOR_DRAFT_STORAGE_KEY, JSON.stringify(data));
      toast({
        title: "Draft Saved",
        description: "Your form data has been saved.",
      });
    }
  }, [form, toast]);

  // Clear form and draft
  const handleClearForm = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(DONOR_DRAFT_STORAGE_KEY);
    }
    form.reset();
    toast({
      title: "Form Cleared",
      description: "All form data has been cleared.",
    });
  }, [form, toast]);

  const handleSubmit = async (data: DonorFormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender as Gender,
        bloodGroup: data.bloodGroup as BloodGroup,
        weight: parseInt(data.weight),
        height: parseInt(data.height),
        mobileNumber: data.mobileNumber,
        email: data.email || undefined,
        aadharNumber: data.aadharNumber || undefined,
        permanentAddress: data.permanentAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactNumber: data.emergencyContactNumber || undefined,
        takingMedication: data.takingMedication,
        medicationDetails: data.medicationDetails || undefined,
        chronicIllness: data.chronicIllness,
        illnessDetails: data.illnessDetails || undefined,
        donatedBefore: data.donatedBefore,
        lastDonationDate: data.lastDonationDate || undefined,
        surgeryInLast6Months: data.surgeryInLast6Months,
        surgeryDetails: data.surgeryDetails || undefined,
        smokeOrAlcohol: data.smokeOrAlcohol,
        eligibleForDonation: data.eligibleForDonation,
        medicalNotes: data.medicalNotes || undefined,
        willingToBeRegularDonor: data.willingToBeRegularDonor,
        notificationPreference: data.notificationPreference as NotificationPreference[],
        status: "active" as const,
      };

      const result = donorId
        ? await updateDonor({ ...payload, id: donorId })
        : await createDonor(payload);

      if (!result.success) {
        throw new Error(result.error || "Failed to submit form");
      }

      // Clear draft
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(DONOR_DRAFT_STORAGE_KEY);
      }

      setSubmittedDonor(result.donor);
      setShowSuccessDialog(true);
      form.reset();

      toast({
        title: "Success!",
        description: donorId ? "Donor updated successfully!" : "Donor registered successfully!",
      });

      // Redirect after a short delay to show the success message
      if (redirectPath) {
        setTimeout(() => {
          router.push(redirectPath);
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const formValues = form.watch();
  const takingMedication = form.watch("takingMedication");
  const chronicIllness = form.watch("chronicIllness");
  const donatedBefore = form.watch("donatedBefore");
  const surgeryInLast6Months = form.watch("surgeryInLast6Months");

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Enter your basic personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>Must be between 18-65 years</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BLOOD_GROUP_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="65" className="pl-10" {...field} type="number" />
                      </div>
                    </FormControl>
                    <FormDescription>45-150 kg</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="175" className="pl-10" {...field} type="number" />
                      </div>
                    </FormControl>
                    <FormDescription>140-220 cm</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="h-5 w-5" />
              Contact & Address Information
            </CardTitle>
            <CardDescription>Enter your contact details and address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="9876543210" className="pl-10" {...field} maxLength={10} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="john@example.com" type="email" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="aadharNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhar Number</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012" {...field} maxLength={12} />
                  </FormControl>
                  <FormDescription>12-digit Aadhar number (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permanent Address *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter your complete address" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <Input placeholder="Maharashtra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode *</FormLabel>
                    <FormControl>
                      <Input placeholder="400001" {...field} maxLength={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyContactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} maxLength={10} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical History Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="h-5 w-5" />
              Medical History
            </CardTitle>
            <CardDescription>Please provide accurate medical information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="takingMedication"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Currently taking any medication?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {takingMedication && (
                <FormField
                  control={form.control}
                  name="medicationDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Details *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please specify medications" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="chronicIllness"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>History of chronic illness?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {chronicIllness && (
                <FormField
                  control={form.control}
                  name="illnessDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Illness Details *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please specify illness" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="donatedBefore"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Donated blood before?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {donatedBefore && (
                <FormField
                  control={form.control}
                  name="lastDonationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Donation Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="surgeryInLast6Months"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Surgery in last 6 months?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {surgeryInLast6Months && (
                <FormField
                  control={form.control}
                  name="surgeryDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surgery Details *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Please specify surgery details" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="smokeOrAlcohol"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Smoke or consume alcohol?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eligibleForDonation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Eligible for donation?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="medicalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Medical Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional medical information" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Preferences Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5" />
              Preferences & Consent
            </CardTitle>
            <CardDescription>Set your preferences and confirm consent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="willingToBeRegularDonor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-semibold">Willing to be a Regular Donor</FormLabel>
                    <FormDescription>
                      I am willing to be contacted for regular blood donation drives
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notificationPreference"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-3">
                    <FormLabel>Notification Preferences *</FormLabel>
                    <FormDescription>Select how you want to be notified</FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {NOTIFICATION_OPTIONS.map((option) => (
                      <FormItem
                        key={option.value}
                        className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.value as NotificationPreference)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              if (checked) {
                                field.onChange([...current, option.value as NotificationPreference]);
                              } else {
                                field.onChange(current.filter((v) => v !== option.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">{option.label}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="consentToUseData"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        I agree to donate blood voluntarily and consent to the use of my data for 
                        medical and donation purposes only. *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmInformationAccurate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        I confirm that the information provided above is true and accurate. *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="border-0 shadow-sm sticky bottom-0 bg-background z-10">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearForm}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Submit Registration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Registration Preview
            </DialogTitle>
            <DialogDescription>Review your information before submitting</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="text-base font-semibold">{formValues.firstName} {formValues.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                <Badge>{BLOOD_GROUP_OPTIONS.find(opt => opt.value === formValues.bloodGroup)?.label}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mobile</p>
                <p className="text-base">{formValues.mobileNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{formValues.email || "N/A"}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-base">{formValues.permanentAddress}</p>
                <p className="text-base">{formValues.city}, {formValues.state} - {formValues.pincode}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={() => { setShowPreview(false); form.handleSubmit(handleSubmit)(); }}>
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <DialogTitle>Registration Successful!</DialogTitle>
            </div>
            <DialogDescription>
              Thank you for registering as a blood donor. Your registration has been completed successfully.
            </DialogDescription>
          </DialogHeader>
          {submittedDonor && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Donor ID:</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {submittedDonor.donorId}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Name:</span>
                  <span className="text-sm">{submittedDonor.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Blood Group:</span>
                  <Badge variant="destructive" className="text-sm">
                    {submittedDonor.bloodGroup}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/dashboard/blood-panel");
              }}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
            {submittedDonor && (
              <DonorCertificate donor={submittedDonor} />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}

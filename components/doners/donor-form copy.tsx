"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { FormCheckbox } from "@/components/forms/form-checkbox"
import { FormFileUpload } from "@/components/forms/form-file-upload"
import { bloodDonationFormSchema } from "@/lib/blood-donation-schema"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, FileText, Mail, Phone } from "lucide-react"
import { createDonorApi, updateDonorApi } from "@/apicalls/blood"
import { useAuth } from "@/context/AuthContext"

interface DonorFormProps {
  initialData?: any;
  pageTitle?: string;
  onSuccess?: (donor: any) => void;
}

export default function DonorForm({ initialData, pageTitle = "Blood Donor Registration", onSuccess }: DonorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [successData, setSuccessData] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const { selectedUlb } = useAuth()

  const form = useForm<any>({
    resolver: zodResolver(bloodDonationFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : "",
      gender: initialData?.gender || "",
      bloodGroup: initialData?.bloodGroup || "",
      weight: initialData?.weight || "",
      height: initialData?.height || "",
      photo: undefined,
      mobileNumber: initialData?.mobileNumber || "",
      email: initialData?.email || "",
      permanentAddress: initialData?.permanentAddress || "",
      cityStatePin: initialData?.cityStatePin || "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactNumber: initialData?.emergencyContactNumber || "",
      takingMedication: initialData?.takingMedication || false,
      chronicIllness: initialData?.chronicIllness || false,
      donatedBefore: initialData?.donatedBefore || false,
      lastDonationDate: initialData?.lastDonationDate ? new Date(initialData.lastDonationDate).toISOString().split('T')[0] : "",
      surgeryInLast6Months: initialData?.surgeryInLast6Months || false,
      smokeOrAlcohol: initialData?.smokeOrAlcohol || false,
      eligibleForDonation: initialData?.eligibleForDonation || false,
      willingToBeRegularDonor: initialData?.willingToBeRegularDonor || false,
      notificationPreference: initialData?.notificationPreference || [],
      idProof: undefined,
      consentToUseData: initialData?.consentToUseData || false,
      confirmInformationAccurate: initialData?.confirmInformationAccurate || false,
    },
  })

  const control: any = form.control

  async function onSubmit(values: any) {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      if (!selectedUlb?.id) throw new Error("Please select a ULB first")

      const bloodGroupMap: Record<string, string> = {
        "O+": "O_POS", "O-": "O_NEG",
        "A+": "A_POS", "A-": "A_NEG",
        "B+": "B_POS", "B-": "B_NEG",
        "AB+": "AB_POS", "AB-": "AB_NEG",
      }

      const notifMap = { sms: "SMS", email: "EMAIL", whatsapp: "PUSH" } as const

      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        fullName: `${values.firstName} ${values.lastName}`.trim(),
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        bloodGroup: bloodGroupMap[values.bloodGroup] as any,
        weight: Number(values.weight),
        height: Number(values.height),
        mobileNumber: values.mobileNumber,
        email: values.email,
        permanentAddress: values.permanentAddress,
        cityStatePin: values.cityStatePin,
        emergencyContactName: values.emergencyContactName,
        emergencyContactNumber: values.emergencyContactNumber,
        takingMedication: values.takingMedication,
        chronicIllness: values.chronicIllness,
        donatedBefore: values.donatedBefore,
        lastDonationDate: values.lastDonationDate || null,
        surgeryInLast6Months: values.surgeryInLast6Months,
        smokeOrAlcohol: values.smokeOrAlcohol,
        eligibleForDonation: values.eligibleForDonation,
        willingToBeRegularDonor: values.willingToBeRegularDonor,
        notificationPreference: (values.notificationPreference || []).map((p: string) => notifMap[p as keyof typeof notifMap]) as any,
        consentToUseData: values.consentToUseData,
        confirmInformationAccurate: values.confirmInformationAccurate,
        status: "active" as any,
      }

      const donor = await createDonorApi(Number(selectedUlb.id), payload as any)

      setSuccessData(donor)
      setShowSuccessModal(true)
      form.reset()
      setSubmitMessage({ type: "success", message: "Registration successful" })
      if (onSuccess) onSuccess(donor)
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred while submitting the form",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadDonorCard = () => {
    if (!successData) return;
    const cardData = `
Blood Donor Registration Card
============================

Donor ID: ${successData.donorId}
Name: ${successData.fullName}
Blood Group: ${successData.bloodGroup}
Mobile: ${successData.mobileNumber}
Email: ${successData.email}
Status: ${successData.status}
Registration Date: ${new Date(successData.createdAt).toLocaleDateString()}

Thank you for registering as a blood donor!
    `;
    const blob = new Blob([cardData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donor-card-${successData.donorId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="w-full">
        {/* Themed Header */}
        <div
          className="rounded-t-lg p-6 text-white"
          style={{ background: `linear-gradient(90deg, var(--primary) 0%, var(--primary) 100%)` }}
          data-slot="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--primary-foreground)" }}>Blood Donor Registration</h1>
              <p className="mt-1" style={{ color: "color-mix(in oklab, var(--primary-foreground) 80%, transparent)" }}>{pageTitle}</p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 30%, white)" }}>
                <svg className="h-8 w-8" style={{ color: "var(--primary-foreground)" }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-card rounded-b-lg shadow-lg" data-slot="card">
          <div className="p-6">
            {submitMessage && (
              <div
                className={`mb-6 rounded-lg p-4 ${submitMessage.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
              >
                {submitMessage.message}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
                {/* Personal Information */}
                <div className="rounded-lg p-6" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 4%, white)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormInput
                      control={control}
                      name="firstName"
                      label="First Name"
                      placeholder="Enter first name"
                      required
                    />
                    <FormInput
                      control={control}
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter last name"
                      required
                    />
                    <FormInput
                      control={control}
                      name="dateOfBirth"
                      label="Date of Birth"
                      required
                    />
                    <FormSelect
                      control={control}
                      name="gender"
                      label="Gender"
                      placeholder="Select gender"
                      required
                      options={[
                        { label: "Male", value: "male" },
                        { label: "Female", value: "female" },
                        { label: "Other", value: "other" },
                      ]}
                    />
                  </div>
                </div>

                {/* Physical Details */}
                <div className="rounded-lg p-6" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 4%, white)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
                    <h2 className="text-lg font-semibold text-gray-900">Physical Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                      control={control}
                      name="bloodGroup"
                      label="Blood Group"
                      placeholder="Select blood group"
                      required
                      options={[
                        { label: "O+", value: "O+" },
                        { label: "O-", value: "O-" },
                        { label: "A+", value: "A+" },
                        { label: "A-", value: "A-" },
                        { label: "B+", value: "B+" },
                        { label: "B-", value: "B-" },
                        { label: "AB+", value: "AB+" },
                        { label: "AB-", value: "AB-" },
                      ]}
                    />
                    <FormInput
                      control={control}
                      name="weight"
                      label="Weight (kg)"
                      placeholder="Enter weight"
                      type="number"
                      min="45"
                      max="150"
                      step="0.1"
                      required
                    />
                    <FormInput
                      control={control}
                      name="height"
                      label="Height (cm)"
                      placeholder="Enter height"
                      type="number"
                      min="140"
                      max="220"
                      step="0.1"
                      required
                    />
                    <FormFileUpload
                      control={control}
                      name="photo"
                      label="Photo"
                      description="Upload your photo"
                      config={{
                        maxSize: 5 * 1024 * 1024,
                        maxFiles: 1,
                      }}
                    />
                  </div>
                </div>

                {/* Contact Details */}
                <div className="rounded-lg p-6" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 4%, white)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
                    <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      control={control}
                      name="mobileNumber"
                      label="Mobile Number"
                      placeholder="+91 XXXXXXXXXX"
                      type="tel"
                      required
                    />
                    <FormInput
                      control={control}
                      name="email"
                      label="Email Address"
                      placeholder="xyz@gmail.com"
                      type="email"
                      required
                    />
                    <FormInput
                      control={control}
                      name="permanentAddress"
                      label="Address"
                      placeholder="Enter your address"
                      required
                    />
                    <FormInput
                      control={control}
                      name="cityStatePin"
                      label="City / State / Pincode"
                      placeholder="Enter city, state and pincode"
                      required
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="rounded-lg p-6" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 4%, white)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
                    <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      control={control}
                      name="emergencyContactName"
                      label="Emergency Contact Name"
                      placeholder="Enter contact name"
                      required
                    />
                    <FormInput
                      control={control}
                      name="emergencyContactNumber"
                      label="Emergency Contact Number"
                      placeholder="+91 XXXXXXXXXX"
                      type="tel"
                      required
                    />
                  </div>
                </div>

                {/* Health & Medical Details */}
                <div className="rounded-lg p-6" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 4%, white)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
                    <h2 className="text-lg font-semibold text-gray-900">Health & Medical Details</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormCheckbox
                        control={control}
                        name="takingMedication"
                        label="Currently taking any medication?"
                      />
                      <FormCheckbox
                        control={control}
                        name="chronicIllness"
                        label="History of chronic illness?"
                      />
                      <FormCheckbox
                        control={control}
                        name="donatedBefore"
                        label="Donated blood before?"
                      />
                      <FormCheckbox
                        control={control}
                        name="surgeryInLast6Months"
                        label="Surgery in last 6 months?"
                      />
                      <FormCheckbox
                        control={control}
                        name="smokeOrAlcohol"
                        label="Smoke or consume alcohol?"
                      />
                      <FormCheckbox
                        control={control}
                        name="eligibleForDonation"
                        label="Eligible for donation?"
                      />
                    </div>

                    {form.watch('donatedBefore') && (
                      <div className="mt-4">
                        <FormInput
                          control={control}
                          name="lastDonationDate"
                          label="Last Donation Date"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Preferences & Documents */}
                <div className="rounded-lg p-6" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 4%, white)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
                    <h2 className="text-lg font-semibold text-gray-900">Preferences & Documents</h2>
                  </div>

                  <div className="space-y-4">
                    <FormCheckbox
                      control={control}
                      name="willingToBeRegularDonor"
                      label="Willing to be a Regular Donor?"
                    />

                    <div data-slot="toggle-group">
                      <label className="text-sm font-medium text-gray-700 mb-3 block">Notification Preferences</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="flex items-center gap-2" data-slot="toggle-group-item">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            onChange={(e) => {
                              const current = form.getValues("notificationPreference") || []
                              if (e.target.checked) {
                                form.setValue("notificationPreference", [...current, "sms"])
                              } else {
                                form.setValue("notificationPreference", current.filter((p: string) => p !== "sms"))
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700">SMS</span>
                        </label>
                        <label className="flex items-center gap-2" data-slot="toggle-group-item">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            onChange={(e) => {
                              const current = form.getValues("notificationPreference") || []
                              if (e.target.checked) {
                                form.setValue("notificationPreference", [...current, "email"])
                              } else {
                                form.setValue("notificationPreference", current.filter((p: string) => p !== "email"))
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700">Email</span>
                        </label>
                        <label className="flex items-center gap-2" data-slot="toggle-group-item">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            onChange={(e) => {
                              const current = form.getValues("notificationPreference") || []
                              if (e.target.checked) {
                                form.setValue("notificationPreference", [...current, "whatsapp"])
                              } else {
                                form.setValue("notificationPreference", current.filter((p: string) => p !== "whatsapp"))
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700">WhatsApp</span>
                        </label>
                      </div>
                    </div>

                    <FormFileUpload
                      control={control}
                      name="idProof"
                      label="ID Proof"
                      description="Upload Aadhaar, Driving License, or Passport"
                      config={{
                        maxSize: 5 * 1024 * 1024,
                        maxFiles: 1,
                      }}
                    />
                  </div>
                </div>

                {/* Consent & Agreement */}
                <div className="rounded-lg p-6" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 8%, white)" }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--primary)" }}></div>
                    <h2 className="text-lg font-semibold text-gray-900">Consent & Agreement</h2>
                  </div>

                  <div className="space-y-4">
                    <FormCheckbox
                      control={control}
                      name="consentToUseData"
                      label="I agree to donate blood voluntarily and consent to the use of my data for medical and donation purposes only."
                    />
                    <FormCheckbox
                      control={control}
                      name="confirmInformationAccurate"
                      label="I confirm that the information provided above is true and accurate"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    variant="success"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--primary)" }}>
              <CheckCircle className="h-6 w-6" />
              Registration Successful!
            </DialogTitle>
          </DialogHeader>

          {successData && (
            <div className="space-y-6">
              <div className="rounded-lg p-4" style={{ backgroundColor: "color-mix(in oklab, var(--primary) 6%, white)" }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--primary)" }}>Donor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" style={{ color: "var(--primary)" }} />
                      <span className="font-medium">Donor ID:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {successData.donorId}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Name:</span>
                      <span>{successData.fullName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Blood Group:</span>
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        {successData.bloodGroup}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" style={{ color: "var(--primary)" }} />
                      <span className="font-medium">Mobile:</span>
                      <span>{successData.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" style={{ color: "var(--primary)" }} />
                      <span className="font-medium">Email:</span>
                      <span className="text-sm">{successData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Status:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {successData.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={downloadDonorCard}
                  className="flex-1"
                  style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Donor Card
                </Button>
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

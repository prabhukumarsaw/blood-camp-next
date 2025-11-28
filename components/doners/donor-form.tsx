"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Download, FileText, Mail, Phone, User, Droplets, Scale, Ruler, Camera, MapPin, Contact, AlertCircle } from "lucide-react"
import { bloodDonationFormSchema, type BloodDonationFormSchema } from "@/lib/blood-donation-schema"
import { createDonorApi } from "@/apicalls/blood"
import { useAuth } from "@/context/AuthContext"

interface DonorFormProps {
  initialData?: Partial<BloodDonationFormSchema>;
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
      dateOfBirth: initialData?.dateOfBirth || "",
      gender: initialData?.gender || "",
      bloodGroup: initialData?.bloodGroup || "",
      weight: initialData?.weight || "",
      height: initialData?.height || "",
      mobileNumber: initialData?.mobileNumber || "",
      email: initialData?.email || "",
      permanentAddress: initialData?.permanentAddress || "",
      cityStatePin: initialData?.cityStatePin || "",
      emergencyContactName: initialData?.emergencyContactName || "",
      emergencyContactNumber: initialData?.emergencyContactNumber || "",
      takingMedication: initialData?.takingMedication || false,
      chronicIllness: initialData?.chronicIllness || false,
      donatedBefore: initialData?.donatedBefore || false,
      lastDonationDate: initialData?.lastDonationDate || "",
      surgeryInLast6Months: initialData?.surgeryInLast6Months || false,
      smokeOrAlcohol: initialData?.smokeOrAlcohol || false,
      eligibleForDonation: initialData?.eligibleForDonation || false,
      willingToBeRegularDonor: initialData?.willingToBeRegularDonor || false,
      notificationPreference: initialData?.notificationPreference || [],
      consentToUseData: initialData?.consentToUseData || false,
      confirmInformationAccurate: initialData?.confirmInformationAccurate || false,
    },
  })

  async function onSubmit(values: BloodDonationFormSchema) {
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
        bloodGroup: bloodGroupMap[values.bloodGroup],
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
        notificationPreference: values.notificationPreference.map((p: string) => notifMap[p as keyof typeof notifMap]),
        consentToUseData: values.consentToUseData,
        confirmInformationAccurate: values.confirmInformationAccurate,
        status: "active" as const,
      }

      const donor = await createDonorApi(Number(selectedUlb.id), payload)

      setSuccessData(donor)
      setShowSuccessModal(true)
      form.reset()
      setSubmitMessage({ type: "success", message: "Registration successful! Thank you for becoming a blood donor." })
      if (onSuccess) onSuccess(donor)
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred while submitting the form";
      
      // Special handling for duplicate donor error
      if (errorMessage.includes('already exists') || errorMessage.includes('Duplicate')) {
        setSubmitMessage({
          type: "error",
          message: errorMessage
        });
      } else {
        setSubmitMessage({
          type: "error",
          message: errorMessage
        });
      }
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Droplets className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{pageTitle}</CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>

      {submitMessage && (
        <Alert className={submitMessage.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          {submitMessage.type === "error" && (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          {submitMessage.type === "success" && (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={submitMessage.type === "success" ? "text-green-800" : "text-red-800"}>
            {submitMessage.message}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <FormSection 
            title="Personal Information" 
            icon={<User className="h-5 w-5" />}
            description="Basic personal details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Physical Details */}
          <FormSection 
            title="Physical Details" 
            icon={<Droplets className="h-5 w-5" />}
            description="Blood group and physical measurements"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
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
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Scale className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="65" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="175" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Camera className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          type="file" 
                          className="pl-10 cursor-pointer" 
                          accept="image/*"
                          onChange={(e) => field.onChange(e.target.files?.[0])}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Max 5MB</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Contact Details */}
          <FormSection 
            title="Contact Details" 
            icon={<MapPin className="h-5 w-5" />}
            description="Primary contact information"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="9876543210" 
                          className="pl-10" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            // Clear duplicate error when user starts typing
                            if (submitMessage?.type === "error" && submitMessage.message.includes('already exists')) {
                              setSubmitMessage(null);
                            }
                          }}
                        />
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
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="john@example.com" type="email" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="permanentAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your complete address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="cityStatePin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / State / Pincode *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mumbai, Maharashtra 400001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </FormSection>

          {/* Emergency Contact */}
          <FormSection 
            title="Emergency Contact" 
            icon={<Contact className="h-5 w-5" />}
            description="Emergency contact person details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name *</FormLabel>
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
                    <FormLabel>Emergency Contact Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input placeholder="9876543210" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Health & Medical Details */}
          <FormSection 
            title="Health & Medical Details" 
            icon={<FileText className="h-5 w-5" />}
            description="Medical history and health information"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "takingMedication", label: "Currently taking any medication?" },
                  { name: "chronicIllness", label: "History of chronic illness?" },
                  { name: "donatedBefore", label: "Donated blood before?" },
                  { name: "surgeryInLast6Months", label: "Surgery in last 6 months?" },
                  { name: "smokeOrAlcohol", label: "Smoke or consume alcohol?" },
                  { name: "eligibleForDonation", label: "Eligible for donation?" },
                ].map((item) => (
                  <FormField
                    key={item.name}
                    control={form.control}
                    name={item.name as keyof BloodDonationFormSchema}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value as boolean}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            {item.label}
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {form.watch("donatedBefore") && (
                <div className="max-w-xs">
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
                </div>
              )}
            </div>
          </FormSection>

          {/* Preferences & Documents */}
          <FormSection 
            title="Preferences & Documents" 
            icon={<FileText className="h-5 w-5" />}
            description="Notification preferences and document upload"
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="willingToBeRegularDonor"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer font-semibold">
                        Willing to be a Regular Donor
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div>
                <Label className="text-sm font-medium">Notification Preferences</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  {["sms", "email", "whatsapp"].map((pref) => (
                    <FormField
                      key={pref}
                      control={form.control}
                      name="notificationPreference"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={pref}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(pref)}
                                onCheckedChange={(checked) => {
                                  const updated = checked
                                    ? [...(field.value || []), pref]
                                    : field.value?.filter((value) => value !== pref) || []
                                  field.onChange(updated)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer capitalize">
                              {pref}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="idProof"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Proof</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload Aadhaar, Driving License, or Passport (Max 5MB)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Consent & Agreement */}
          <FormSection 
            title="Consent & Agreement" 
            icon={<CheckCircle className="h-5 w-5" />}
            description="Important agreements and confirmations"
            className=""
          >
            <div className="space-y-4">
              {[
                {
                  name: "consentToUseData",
                  label: "I agree to donate blood voluntarily and consent to the use of my data for medical and donation purposes only.",
                },
                {
                  name: "confirmInformationAccurate",
                  label: "I confirm that the information provided above is true and accurate",
                },
              ].map((item) => (
                <FormField
                  key={item.name}
                  control={form.control}
                  name={item.name as keyof BloodDonationFormSchema}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer text-sm">
                          {item.label}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </FormSection>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-base font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Registration Successful!
            </DialogTitle>
          </DialogHeader>

          {successData && (
            <div className="space-y-6">
              <div className="rounded-lg p-4 bg-green-50 border border-green-200">
                <h3 className="text-lg font-semibold mb-3 text-green-800">Donor Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
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
                      <Phone className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Mobile:</span>
                      <span>{successData.mobileNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Email:</span>
                      <span className="text-sm break-all">{successData.email}</span>
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

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={downloadDonorCard}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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
    </div>
  )
}

// Form Section Component
function FormSection({ 
  title, 
  description, 
  icon, 
  children, 
  className = "" 
}: { 
  title: string; 
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (

    <Card className={className}>
       <div className="flex items-center gap-3 bg-red-600/40 -mt-4 rounded-t-lg px-4 py-1">
          <div className="p-2 bg-red-50 rounded-lg">
            <div className="text-red-600">{icon}</div>
          </div>
          <div>
            <CardTitle className="text-md ">{title}</CardTitle>
            {description && (
              <p className=" text-xs mt-0.5">{description}</p>
            )}
          </div>
        </div>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getDonorById } from "@/lib/actions/donors";
import { redirect, notFound } from "next/navigation";
import { AdvancedDonorForm } from "@/components/donors/advanced-donor-form";
import PageContainer from "@/components/layout/page-container";

/**
 * Edit Donor Page
 */
export default async function EditDonorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const donorResult = await getDonorById(id);

  if (!donorResult.success || !donorResult.donor) {
    notFound();
  }

  const hasUpdatePermission = await checkPermission("donor.update");
  if (!hasUpdatePermission) {
    redirect("/dashboard/blood-panel");
  }

  const donor = donorResult.donor;

  // Convert donor data to form format
  const initialData = {
    firstName: donor.firstName,
    lastName: donor.lastName,
    dateOfBirth: donor.dateOfBirth.toISOString().split('T')[0],
    gender: donor.gender,
    bloodGroup: donor.bloodGroup,
    weight: donor.weight.toString(),
    height: donor.height.toString(),
    mobileNumber: donor.mobileNumber,
    email: donor.email || "",
    aadharNumber: (donor as any).aadharNumber || "",
    permanentAddress: donor.permanentAddress,
    city: donor.city,
    state: donor.state,
    pincode: donor.pincode,
    emergencyContactName: donor.emergencyContactName || "",
    emergencyContactNumber: donor.emergencyContactNumber || "",
    takingMedication: donor.takingMedication,
    medicationDetails: donor.medicationDetails || "",
    chronicIllness: donor.chronicIllness,
    illnessDetails: donor.illnessDetails || "",
    donatedBefore: donor.donatedBefore,
    lastDonationDate: donor.lastDonationDate ? donor.lastDonationDate.toISOString().split('T')[0] : "",
    surgeryInLast6Months: donor.surgeryInLast6Months,
    surgeryDetails: donor.surgeryDetails || "",
    smokeOrAlcohol: donor.smokeOrAlcohol,
    eligibleForDonation: donor.eligibleForDonation,
    medicalNotes: donor.medicalNotes || "",
    willingToBeRegularDonor: donor.willingToBeRegularDonor,
    notificationPreference: donor.notificationPreference,
    consentToUseData: true,
    confirmInformationAccurate: true,
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div>
          <h1 className="text-3xl font-bold">Edit Donor</h1>
          <p className="text-muted-foreground mt-2">
            Update donor information
          </p>
        </div>

        <AdvancedDonorForm 
          donorId={id}
          initialData={initialData}
          redirectPath="/dashboard/blood-panel"
        />
      </div>
    </PageContainer>
  );
}


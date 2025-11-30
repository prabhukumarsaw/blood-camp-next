import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getDonorById, getDonors } from "@/lib/actions/donors";
import { redirect, notFound } from "next/navigation";
import { DonorDetailsPage } from "@/components/donors/donor-details-page";
import PageContainer from "@/components/layout/page-container";

interface DonorDetailsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function DonorDetailsPageRoute({ params }: DonorDetailsPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasReadAccess = await checkPermission("donor.read");
  if (!hasReadAccess) {
    redirect("/dashboard/blood-panel");
  }

  // Handle params as Promise (Next.js 15+) or object
  const resolvedParams = params instanceof Promise ? await params : params;
  const donorId = resolvedParams?.id;

  if (!donorId) {
    notFound();
  }

  const donorResult = await getDonorById(donorId);
  if (!donorResult.success || !donorResult.donor) {
    notFound();
  }

  // Get previous and next donors for navigation
  const allDonorsResult = await getDonors({ page: 1, pageSize: 10000 });
  const allDonors = allDonorsResult.success ? allDonorsResult.donors : [];
  const currentIndex = allDonors?.findIndex((d: any) => d.id === donorId);
  
  const previousDonor = currentIndex && currentIndex > 0 ? allDonors?.[currentIndex - 1] : null;
  const nextDonor = currentIndex && currentIndex && allDonors?.length && currentIndex < allDonors?.length - 1 ? allDonors?.[currentIndex + 1] : null;

  return (
    <PageContainer>
      <DonorDetailsPage 
        donor={donorResult.donor} 
        previousDonor={previousDonor}
        nextDonor={nextDonor}
      />
    </PageContainer>
  );
}


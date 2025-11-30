import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { AdvancedDonorForm } from "@/components/donors/advanced-donor-form";
import PageContainer from "@/components/layout/page-container";

/**
 * Create Donor Registration Page
 */
export default async function CreateDonorPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await checkPermission("donor.create");
  if (!hasAccess) {
    redirect("/dashboard/blood-panel");
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div>
          <h1 className="text-3xl font-bold">Donor Registration</h1>
          <p className="text-muted-foreground mt-2">
            Register a new blood donor with complete information
          </p>
        </div>

        <AdvancedDonorForm />
      </div>
    </PageContainer>
  );
}


import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getDonors, getDonorStats } from "@/lib/actions/donors";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";
import { DonorStats } from "@/components/donors/donor-stats";
import { DonorTable } from "@/components/donors/donor-table";

export default async function BloodPanelPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    search?: string;
    bloodGroup?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    mobileNumber?: string;
    aadharNumber?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user has donor.read permission
  const hasReadAccess = await checkPermission("donor.read");
  if (!hasReadAccess) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = params.page ? Math.max(1, parseInt(params.page, 10) || 1) : 1;

  // Fetch donors and stats in parallel
  const [donorsResult, statsResult] = await Promise.all([
    getDonors({
      page,
      pageSize: 10,
      search: params.search,
      bloodGroup: params.bloodGroup as any,
      status: params.status as any,
      startDate: params.startDate,
      endDate: params.endDate,
      mobileNumber: params.mobileNumber,
      aadharNumber: params.aadharNumber,
    }),
    getDonorStats(),
  ]);

  if (!donorsResult.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">{donorsResult.error}</p>
      </div>
    );
  }

  const hasCreateAccess = await checkPermission("donor.create");

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Donor Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track blood donors
            </p>
          </div>
          {hasCreateAccess && (
            <Link href="/dashboard/blood-panel/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register New Donor
              </Button>
            </Link>
          )}
        </div>

        {/* Stats Header */}
        {statsResult.success && statsResult.stats && (
          <DonorStats stats={statsResult.stats} />
        )}

        {/* Donor Table */}
        <DonorTable
          donors={donorsResult.donors || []}
          total={donorsResult.total || 0}
          page={donorsResult.page || 1}
          totalPages={donorsResult.totalPages || 1}
          searchParams={params}
        />
      </div>
    </PageContainer>
  );
}


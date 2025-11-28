import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getUserBlogs } from "@/lib/actions/blogs";
import { redirect } from "next/navigation";
import { DonorTable } from "@/components/doner/doner-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import PageContainer from "@/components/layout/page-container";

/**
 * Blogs Management Page
 * Shows user's own blogs (or all blogs if has blog.read.all permission)
 */
export default async function BlogsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Check if user has blog.create permission
  const hasCreateAccess = await checkPermission("blog.create");
  if (!hasCreateAccess) {
    redirect("/dashboard");
  }

  const page = parseInt(searchParams.page ?? "1");
  const search = searchParams.search;

  const result = await getUserBlogs(page, 10, search);

  if (!result.success) {
    return (
      <div className="p-6">
        <p className="text-destructive">{result.error}</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Donor Management</h1>
          <p className="text-muted-foreground mt-2">
            Search and manage blood donor records
          </p>
        </div>
        <Link href="/dashboard/blood-panel/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Donor
          </Button>
        </Link>
      </div>

      <DonorTable
        donors={result.blogs}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
        search={search}
      />
    </div>
  </PageContainer>
  );
}


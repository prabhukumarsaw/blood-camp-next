import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { CreatePermissionForm } from "@/components/permissions/create-permission-form";
import PageContainer from "@/components/layout/page-container";

/**
 * Create Permission Page
 */
export default async function CreatePermissionPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await checkPermission("permission.create");
  if (!hasAccess) {
    redirect("/dashboard/permissions");
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
      <div>
        <h1 className="text-2xl font-bold">Create New Permission</h1>
        <p className="text-muted-foreground mt-2">
          Define a new permission for access control
        </p>
      </div>

      <CreatePermissionForm />
    </div>
    </PageContainer>
  );
}


import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { getPermissionById } from "@/lib/actions/permissions";
import { redirect, notFound } from "next/navigation";
import { EditPermissionForm } from "@/components/permissions/edit-permission-form";
import PageContainer from "@/components/layout/page-container";

/**
 * Edit Permission Page
 */
export default async function EditPermissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await checkPermission("permission.update");
  if (!hasAccess) {
    redirect("/dashboard/permissions");
  }

  const { id } = await params;
  const permissionResult = await getPermissionById(id);

  
  if (!permissionResult.success || !permissionResult.permission) {
    notFound();
  }

  const permission = permissionResult.permission;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
      <div>
        <h1 className="text-2xl font-bold">Edit Permission</h1>
        <p className="text-muted-foreground mt-2">
          Update permission details
        </p>
      </div>

      <EditPermissionForm permission={permissionResult.permission} />
    </div>
    </PageContainer>
  );
}


import { getCurrentUser } from "@/lib/auth/jwt-server";
import { checkPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { getRoles } from "@/lib/actions/roles";
import { CreateUserForm } from "@/components/users/create-user-form";
import PageContainer from "@/components/layout/page-container";

/**
 * Create User Page
 * Allows authorized users to create new users
 */
export default async function CreateUserPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const hasAccess = await checkPermission("user.create");
  if (!hasAccess) {
    redirect("/dashboard/users");
  }

  const rolesResult = await getRoles();
  const roles: any = rolesResult.success ? rolesResult.roles : [];

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
      <div>
        <h1 className="text-2xl font-bold">Create New User</h1>
        <p className="text-muted-foreground mt-2">
          Add a new user to the system and assign roles
        </p>
      </div>

      <CreateUserForm roles={roles} />
    </div>
    </PageContainer>
  );
}


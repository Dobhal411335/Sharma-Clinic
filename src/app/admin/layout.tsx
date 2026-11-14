import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { WelcomeToast } from "@/components/admin/welcome-toast";
import { getDashboardPath, isAdmin } from "@/lib/auth/permissions";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }
  if (!isAdmin(session.user)) {
    redirect(getDashboardPath(session.user.role));
  }

  return (
    <AdminShell
      email={session.user.email}
      name={session.user.name}
      signOut={<SignOutButton appearance="sidebar" role="ADMIN" />}
      headerSignOut={<SignOutButton appearance="header" role="ADMIN" />}
    >
      <Suspense fallback={null}>
        <WelcomeToast role="ADMIN" name={session.user.name} />
      </Suspense>
      {children}
    </AdminShell>
  );
}

import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { SignOutButton } from "@/components/admin/sign-out-button";
import { WelcomeToast } from "@/components/admin/welcome-toast";
import { DoctorShell } from "@/components/doctor/doctor-shell";
import { getDashboardPath, isDoctor } from "@/lib/auth/permissions";

export default async function DoctorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/doctor/dashboard");
  }
  if (!isDoctor(session.user)) {
    redirect(getDashboardPath(session.user.role));
  }

  return (
    <DoctorShell
      email={session.user.email}
      name={session.user.name}
      signOut={<SignOutButton appearance="sidebar" role="DOCTOR" />}
      headerSignOut={<SignOutButton appearance="header" role="DOCTOR" />}
    >
      <Suspense fallback={null}>
        <WelcomeToast role="DOCTOR" name={session.user.name} />
      </Suspense>
      {children}
    </DoctorShell>
  );
}

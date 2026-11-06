import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/auth";
import { WelcomeToast } from "@/components/admin/welcome-toast";
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
    <>
      <Suspense fallback={null}>
        <WelcomeToast role="DOCTOR" />
      </Suspense>
      {children}
    </>
  );
}

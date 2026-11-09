import type { Metadata } from "next";

import { ManageDoctorLoginsPage } from "@/components/admin/cms/doctors/manage-doctor-logins-page";

export const metadata: Metadata = { title: "Manage Doctors" };

export default function Page() {
  return <ManageDoctorLoginsPage />;
}

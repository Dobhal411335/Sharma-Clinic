import type { Metadata } from "next";

import { EditDoctorAccountPage } from "@/components/admin/cms/doctors/edit-doctor-account-page";

export const metadata: Metadata = { title: "Edit Doctor" };

export default function Page() {
  return <EditDoctorAccountPage />;
}


import type { Metadata } from "next";

import { CreateDoctorAccountPage } from "@/components/admin/cms/doctors/create-doctor-account-page";

export const metadata: Metadata = { title: "Create Doctor Profile" };

export default function Page() {
  return <CreateDoctorAccountPage />;
}

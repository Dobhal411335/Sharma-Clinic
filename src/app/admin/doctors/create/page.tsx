import type { Metadata } from "next";

import { DoctorProfilePage } from "@/components/admin/cms/doctors/doctor-profile-page";

export const metadata: Metadata = { title: "DoctorProfilePage" };

export default function Page() {
  return <DoctorProfilePage />;
}

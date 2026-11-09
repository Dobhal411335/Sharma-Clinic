import type { Metadata } from "next";

import { DoctorSelfProfilePage } from "@/components/doctor/doctor-self-profile-page";

export const metadata: Metadata = { title: "My profile" };

export default function Page() {
  return <DoctorSelfProfilePage />;
}

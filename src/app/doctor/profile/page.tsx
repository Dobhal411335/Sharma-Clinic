import type { Metadata } from "next";

import { DoctorSelfProfilePage } from "@/components/doctor/doctor-self-profile-page";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return <DoctorSelfProfilePage />;
}

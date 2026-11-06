import type { Metadata } from "next";

import { DoctorPageManage } from "@/components/admin/cms/doctors/doctor-page-manage";

export const metadata: Metadata = { title: "DoctorPageManage" };

export default function Page() {
  return <DoctorPageManage />;
}

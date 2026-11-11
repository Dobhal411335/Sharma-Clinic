"use client";

import { useParams } from "next/navigation";

import { DoctorProfileEditor } from "@/components/doctors/doctor-profile-editor";
import { AdminAppShell } from "@/components/layout/admin-app-shell";
import {
  fetchAdminDoctorAvailability,
  saveAdminDoctorAvailability,
} from "@/services/api/doctor-availability";
import {
  fetchDoctorAccount,
  updateDoctorAccount,
} from "@/services/api/doctor-accounts";

export function EditDoctorAccountPage() {
  const params = useParams<{ id: string }>();
  const userId = params.id;

  if (!userId) {
    return (
      <AdminAppShell>
        <p className="text-sm text-muted-foreground">Missing doctor id.</p>
      </AdminAppShell>
    );
  }

  return (
    <AdminAppShell>
      <DoctorProfileEditor
        mode="admin"
        backHref="/admin/doctors/logins"
        loadAccount={() => fetchDoctorAccount(userId)}
        saveAccount={(input) => updateDoctorAccount(userId, input).then(() => undefined)}
        loadAvailability={() => fetchAdminDoctorAvailability(userId)}
        saveAvailability={(payload) =>
          saveAdminDoctorAvailability(userId, payload).then(() => undefined)
        }
      />
    </AdminAppShell>
  );
}

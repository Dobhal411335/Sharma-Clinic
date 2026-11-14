"use client";

import { DoctorProfileEditor } from "@/components/doctors/doctor-profile-editor";
import {
  fetchDoctorSelfAvailability,
  saveDoctorSelfAvailability,
} from "@/services/api/doctor-availability";
import {
  fetchDoctorSelfProfile,
  updateDoctorSelfProfile,
} from "@/services/api/doctor-self";

export function DoctorSelfProfilePage() {
  return (
    <DoctorProfileEditor
      mode="doctor"
      loadAccount={() => fetchDoctorSelfProfile()}
      saveAccount={(input) =>
        updateDoctorSelfProfile({
          name: input.name,
          phone: input.phone,
          profile: input.profile,
        }).then(() => undefined)
      }
      loadAvailability={() => fetchDoctorSelfAvailability()}
      saveAvailability={(payload) =>
        saveDoctorSelfAvailability(payload).then(() => undefined)
      }
    />
  );
}

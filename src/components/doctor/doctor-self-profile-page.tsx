"use client";

import Link from "next/link";

import { DoctorProfileEditor } from "@/components/doctors/doctor-profile-editor";
import { Button } from "@/components/ui/button";
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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#102a43]">
            My profile
          </h1>
          <p className="mt-1 text-sm text-[#5b6b7c]">
            View login details, update your profile, and manage your schedule.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/doctor/dashboard">Back to dashboard</Link>
        </Button>
      </div>

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
    </main>
  );
}

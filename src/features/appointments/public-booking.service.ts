import "server-only";

import { prisma } from "@/lib/db/prisma";
import { assertSlotIsBookable } from "@/features/doctors/bookable-slots.service";

export type CreatePublicAppointmentInput = {
  doctorId: string;
  patientName: string;
  email: string;
  phone: string;
  startsAt: string;
  endsAt: string;
  problem?: string;
  medicalHistoryImageUrl?: string;
  medicalHistoryImagePublicId?: string;
  /** Honeypot — must be empty. */
  website?: string;
};

export type CreatePublicAppointmentResult = {
  appointmentId: string;
  bookingReference: string;
  accessToken: string;
  doctorId: string;
  doctorName: string;
  startsAt: string;
  endsAt: string;
  feeSnapshotPaise: number;
  currency: "INR";
  appointmentStatus: "PENDING_PAYMENT" | "PENDING";
  requiresPayment: boolean;
};

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return digits.slice(-10);
}

export async function createPublicAppointment(
  input: CreatePublicAppointmentInput,
): Promise<CreatePublicAppointmentResult> {
  if (input.website?.trim()) {
    throw new Error("Unable to create appointment.");
  }

  const patientName = input.patientName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);
  if (!patientName) throw new Error("Patient name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    throw new Error("Enter a valid 10-digit mobile number.");
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new Error("Invalid appointment time.");
  }

  const doctor = await prisma.doctor.findFirst({
    where: { id: input.doctorId, isActive: true },
    select: {
      id: true,
      displayName: true,
      consultationFeePaise: true,
    },
  });
  if (!doctor) throw new Error("Doctor not found.");

  await assertSlotIsBookable({
    doctorId: doctor.id,
    startsAt,
    endsAt,
  });

  const feeSnapshotPaise = Math.max(0, doctor.consultationFeePaise);
  const reason = input.problem?.trim() || null;
  // Free consultations skip Razorpay and go straight to admin review.
  const initialStatus = feeSnapshotPaise > 0 ? "PENDING_PAYMENT" : "PENDING";

  try {
    const appointment = await prisma.$transaction(async (tx) => {
      let patient = await tx.patient.findFirst({
        where: {
          email,
          phone,
        },
      });
      if (!patient) {
        patient = await tx.patient.create({
          data: {
            fullName: patientName,
            email,
            phone,
          },
        });
      } else if (patient.fullName !== patientName) {
        patient = await tx.patient.update({
          where: { id: patient.id },
          data: { fullName: patientName },
        });
      }

      return tx.appointment.create({
        data: {
          doctorId: doctor.id,
          patientId: patient.id,
          patientName,
          patientEmail: email,
          patientPhone: phone,
          startsAt,
          endsAt,
          status: initialStatus,
          feeSnapshotPaise,
          currency: "INR",
          reason,
        },
      });
    });

    return {
      appointmentId: appointment.id,
      bookingReference: appointment.bookingReference,
      accessToken: appointment.accessToken,
      doctorId: doctor.id,
      doctorName: doctor.displayName,
      startsAt: appointment.startsAt.toISOString(),
      endsAt: appointment.endsAt.toISOString(),
      feeSnapshotPaise,
      currency: "INR",
      appointmentStatus:
        appointment.status === "PENDING" ? "PENDING" : "PENDING_PAYMENT",
      requiresPayment: feeSnapshotPaise > 0,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      /appointments_doctor_time_excl|exclusion|overlap/i.test(message) ||
      (error as { code?: string })?.code === "P2002"
    ) {
      throw new Error("That time slot was just booked. Please choose another.");
    }
    throw error;
  }
}

export async function getPublicAppointmentForCheckout(input: {
  appointmentId: string;
  accessToken?: string;
}) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: input.appointmentId },
    include: {
      doctor: { select: { displayName: true } },
      payments: {
        where: { status: { in: ["CREATED", "ORDER_CREATED", "PENDING", "PAID"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!appointment) throw new Error("Appointment not found.");
  if (
    input.accessToken &&
    appointment.accessToken !== input.accessToken
  ) {
    throw new Error("Appointment not found.");
  }
  return appointment;
}


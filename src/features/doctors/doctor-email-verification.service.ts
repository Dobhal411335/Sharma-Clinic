import "server-only";

import { createHash, randomInt } from "node:crypto";

import { prisma } from "@/lib/db/prisma";
import { sendDoctorEmailVerificationOtp } from "@/server/integrations/brevo/send";

const OTP_TTL_MS = 10 * 60 * 1000;
const VERIFIED_TTL_MS = 30 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

export async function assertEmailVerifiedToken(
  email: string,
  verificationId: string,
): Promise<void> {
  const row = await prisma.doctorEmailVerification.findFirst({
    where: {
      id: verificationId,
      email: normalizeEmail(email),
      verified: true,
    },
  });
  if (!row || row.updatedAt.getTime() + VERIFIED_TTL_MS <= Date.now()) {
    throw new Error(
      "Email is not verified. Verify the doctor email before submitting.",
    );
  }
}

export async function consumeEmailVerifiedToken(
  email: string,
  verificationId: string,
): Promise<void> {
  await assertEmailVerifiedToken(email, verificationId);
  await prisma.doctorEmailVerification
    .delete({ where: { id: verificationId } })
    .catch(() => {
      // Already consumed or cleaned up.
    });
}

export async function sendDoctorCreateEmailOtp(emailRaw: string): Promise<{
  cooldownSeconds: number;
}> {
  const email = normalizeEmail(emailRaw);
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingUser) {
    throw new Error("A staff account with this email already exists.");
  }

  const otp = String(randomInt(100000, 999999));
  await prisma.doctorEmailVerification.create({
    data: {
      email,
      otpHash: hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
      verified: false,
    },
  });

  await sendDoctorEmailVerificationOtp({ toEmail: email, otp });
  return { cooldownSeconds: 0 };
}

export async function confirmDoctorCreateEmailOtp(
  emailRaw: string,
  otpRaw: string,
): Promise<{ verificationToken: string }> {
  const email = normalizeEmail(emailRaw);
  const otp = otpRaw.trim();
  if (!/^\d{6}$/.test(otp)) {
    throw new Error("Enter the 6-digit verification code.");
  }

  const latest = await prisma.doctorEmailVerification.findFirst({
    where: { email, verified: false },
    orderBy: { createdAt: "desc" },
  });
  if (!latest || latest.expiresAt.getTime() <= Date.now()) {
    throw new Error("Verification code expired. Request a new code.");
  }
  if (latest.attempts >= MAX_ATTEMPTS) {
    throw new Error("Too many attempts. Request a new verification code.");
  }

  const ok = latest.otpHash === hashOtp(otp);
  const updated = await prisma.doctorEmailVerification.update({
    where: { id: latest.id },
    data: {
      attempts: { increment: 1 },
      ...(ok ? { verified: true } : {}),
    },
  });

  if (!ok) {
    throw new Error("Incorrect verification code.");
  }

  return { verificationToken: updated.id };
}

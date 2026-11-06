/**
 * Idempotent Prisma seed for Sharma Clinic.
 *
 * Always (when credentials provided):
 *   - Creates INITIAL ADMIN from INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD
 *     (falls back to SEED_ADMIN_* for compatibility)
 *   - Never overwrites an existing admin password on re-seed
 *   - Upserts non-secret ClinicSetting defaults
 *
 * Demo data (specialties / doctors) only when:
 *   NODE_ENV === "development" OR SEED_DEMO_DATA === "true"
 * Never auto-seeds demo rows in production unless SEED_DEMO_DATA is explicitly true.
 *
 * Passwords are hashed with Argon2id. Never hardcode credentials. Never log passwords.
 */

import "dotenv/config";

import { createHash } from "node:crypto";

import { hash as argonHash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is required to run prisma seed.");
  }
  return url;
}

function shouldSeedDemoData(): boolean {
  if (process.env.SEED_DEMO_DATA === "true") {
    return true;
  }
  if (process.env.SEED_DEMO_DATA === "false") {
    return false;
  }
  return process.env.NODE_ENV === "development";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
  return argonHash(password, ARGON2_OPTIONS);
}

async function ensureInitialAdmin(prisma: PrismaClient): Promise<void> {
  const emailRaw =
    process.env.INITIAL_ADMIN_EMAIL?.trim() ||
    process.env.SEED_ADMIN_EMAIL?.trim();
  const password =
    process.env.INITIAL_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD;

  if (!emailRaw || !password) {
    console.warn(
      "[seed] Skipping initial admin: set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD.",
    );
    return;
  }

  if (password.length < 12) {
    throw new Error(
      "INITIAL_ADMIN_PASSWORD (or SEED_ADMIN_PASSWORD) must be at least 12 characters.",
    );
  }

  const email = normalizeEmail(emailRaw);
  const name =
    process.env.INITIAL_ADMIN_NAME?.trim() ||
    process.env.SEED_ADMIN_NAME?.trim() ||
    "Clinic Admin";

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existing) {
    // Idempotent: never rotate password on every seed.
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN", isActive: true, name },
      });
      console.info(
        `[seed] Existing user promoted to ADMIN (${email}). Password unchanged.`,
      );
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: { isActive: true, name },
      });
      console.info(
        `[seed] Admin already exists for ${email}. Password unchanged.`,
      );
    }
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.info(`[seed] Initial ADMIN created for ${email}`);
}

async function upsertClinicSettings(prisma: PrismaClient): Promise<void> {
  const defaults: Array<{
    key: string;
    value: unknown;
    description: string;
  }> = [
    {
      key: "clinic.timezone",
      value: process.env.CLINIC_TIMEZONE?.trim() || "Asia/Kolkata",
      description: "IANA timezone for availability wall-clock times.",
    },
    {
      key: "clinic.currency",
      value: "INR",
      description: "ISO currency; amounts stored as integer paise.",
    },
    {
      key: "booking.unpaidReservationMinutes",
      value: 15,
      description:
        "Placeholder unpaid reservation TTL (minutes). Confirm before production.",
    },
  ];

  for (const setting of defaults) {
    const value = setting.value as Prisma.InputJsonValue;
    await prisma.clinicSetting.upsert({
      where: { key: setting.key },
      create: {
        key: setting.key,
        value,
        description: setting.description,
      },
      update: {
        value,
        description: setting.description,
      },
    });
  }

  console.info("[seed] Clinic settings upserted (non-secret only).");
}

async function seedDemoData(prisma: PrismaClient): Promise<void> {
  if (process.env.NODE_ENV === "production" && process.env.SEED_DEMO_DATA !== "true") {
    console.info("[seed] Skipping demo data in production.");
    return;
  }

  if (!shouldSeedDemoData()) {
    console.info(
      "[seed] Skipping demo data (set SEED_DEMO_DATA=true or NODE_ENV=development).",
    );
    return;
  }

  const specialty = await prisma.specialty.upsert({
    where: { slug: "general-medicine" },
    create: {
      slug: "general-medicine",
      name: "General Medicine",
      description: "Placeholder specialty for local development only.",
      sortOrder: 1,
      isActive: true,
    },
    update: {
      name: "General Medicine",
      isActive: true,
    },
  });

  const demoEmail = normalizeEmail(
    process.env.SEED_DEMO_DOCTOR_EMAIL?.trim() ||
      "demo.doctor@example.invalid",
  );
  const demoPassword =
    process.env.SEED_DEMO_DOCTOR_PASSWORD?.trim() ||
    `demo-${createHash("sha256").update(demoEmail).digest("hex").slice(0, 16)}`;

  const existingDoctorUser = await prisma.user.findUnique({
    where: { email: demoEmail },
    select: { id: true },
  });

  let doctorUserId: string;
  if (existingDoctorUser) {
    doctorUserId = existingDoctorUser.id;
    await prisma.user.update({
      where: { id: doctorUserId },
      data: {
        name: "Demo Doctor",
        role: "DOCTOR",
        isActive: true,
      },
    });
  } else {
    const passwordHash = await hashPassword(demoPassword);
    const created = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Demo Doctor",
        passwordHash,
        role: "DOCTOR",
        isActive: true,
      },
    });
    doctorUserId = created.id;
  }

  await prisma.doctor.upsert({
    where: { userId: doctorUserId },
    create: {
      userId: doctorUserId,
      slug: "demo-doctor",
      displayName: "Demo Doctor",
      specialtyId: specialty.id,
      biography: "Placeholder doctor profile for local development only.",
      qualifications: "Placeholder",
      experienceYears: null,
      // 50000 paise = ₹500 — development placeholder, not a published clinic fee.
      consultationFeePaise: 50_000,
      isActive: true,
    },
    update: {
      slug: "demo-doctor",
      displayName: "Demo Doctor",
      specialtyId: specialty.id,
      isActive: true,
    },
  });

  console.info(
    `[seed] Demo specialty + doctor upserted (${demoEmail}). Password from SEED_DEMO_DOCTOR_PASSWORD or generated locally — not logged.`,
  );
}

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await ensureInitialAdmin(prisma);
    await upsertClinicSettings(prisma);
    await seedDemoData(prisma);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});

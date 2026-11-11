/**
 * Idempotent Prisma seed for Sharma Clinic.
 *
 * Always (when credentials provided):
 *   - Creates initial ADMIN from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
 *   - Never overwrites an existing admin password on re-seed
 *   - Upserts non-secret ClinicSetting defaults
 *
 * Does not seed demo doctors or specialties.
 *
 * Passwords are hashed with Argon2id. Never hardcode credentials. Never log passwords.
 */

import "dotenv/config";

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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string): Promise<string> {
  return argonHash(password, ARGON2_OPTIONS);
}

async function ensureInitialAdmin(prisma: PrismaClient): Promise<void> {
  const emailRaw = process.env.SEED_ADMIN_EMAIL?.trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!emailRaw || !password) {
    console.warn(
      "[seed] Skipping initial admin: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD.",
    );
    return;
  }

  if (password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");
  }

  const email = normalizeEmail(emailRaw);
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Clinic Admin";

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
      approvalStatus: "APPROVED",
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

async function main(): Promise<void> {
  const pool = new Pool({ connectionString: requireDatabaseUrl() });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    await ensureInitialAdmin(prisma);
    await upsertClinicSettings(prisma);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});

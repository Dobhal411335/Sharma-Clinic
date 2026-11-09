import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function isStalePrismaClient(client: PrismaClient): boolean {
  // After schema changes, Next.js can keep an old global client without new models.
  const delegate = (client as unknown as Record<string, { findFirst?: unknown }>)
    .doctorEmailVerification;
  return typeof delegate?.findFirst !== "function";
}

const existing = globalForPrisma.prisma;
if (existing && isStalePrismaClient(existing)) {
  void existing.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = undefined;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

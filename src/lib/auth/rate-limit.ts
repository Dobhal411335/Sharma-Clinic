import { prisma } from "@/lib/db/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const LOCK_MS = 15 * 60 * 1000;

export async function isLoginLocked(key: string): Promise<boolean> {
  const row = await prisma.authRateLimit.findUnique({ where: { key } });
  return Boolean(row?.lockedUntil && row.lockedUntil.getTime() > Date.now());
}

export async function recordLoginFailure(key: string): Promise<void> {
  const now = new Date();
  const existing = await prisma.authRateLimit.findUnique({ where: { key } });
  const windowOpen =
    existing && now.getTime() - existing.windowStart.getTime() < WINDOW_MS;
  const count = windowOpen ? existing.count + 1 : 1;
  const lockedUntil = count >= MAX_ATTEMPTS ? new Date(now.getTime() + LOCK_MS) : null;

  await prisma.authRateLimit.upsert({
    where: { key },
    create: {
      key,
      count,
      windowStart: now,
      lockedUntil,
    },
    update: {
      count,
      windowStart: windowOpen && existing ? existing.windowStart : now,
      lockedUntil,
    },
  });
}

export async function clearLoginFailures(key: string): Promise<void> {
  await prisma.authRateLimit.deleteMany({ where: { key } });
}

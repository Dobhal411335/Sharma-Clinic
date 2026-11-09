import { randomBytes } from "node:crypto";

import { hash as argonHash, verify as verifyArgon2 } from "@node-rs/argon2";
import bcrypt from "bcrypt";

const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return argonHash(password, ARGON2_OPTIONS);
}

/** Unusable hash for pending accounts until admin approval sets a real password. */
export async function createUnusablePasswordHash(): Promise<string> {
  return hashPassword(randomBytes(32).toString("base64url"));
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (!password || !passwordHash) return false;

  try {
    if (passwordHash.startsWith("$argon2")) {
      return await verifyArgon2(passwordHash, password);
    }
    if (
      passwordHash.startsWith("$2a$") ||
      passwordHash.startsWith("$2b$") ||
      passwordHash.startsWith("$2y$")
    ) {
      return await bcrypt.compare(password, passwordHash);
    }
  } catch {
    return false;
  }

  return false;
}

/** Cryptographically strong password for admin "Generate" actions. */
export function generateStrongPassword(length = 16): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += alphabet[bytes[i]! % alphabet.length];
  }
  return result;
}

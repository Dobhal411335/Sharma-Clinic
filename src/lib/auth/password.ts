import { verify as verifyArgon2 } from "@node-rs/argon2";
import bcrypt from "bcrypt";

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (!password || !passwordHash) return false;

  try {
    if (passwordHash.startsWith("$argon2")) {
      return await verifyArgon2(passwordHash, password);
    }
    if (passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2b$") || passwordHash.startsWith("$2y$")) {
      return await bcrypt.compare(password, passwordHash);
    }
  } catch {
    return false;
  }

  return false;
}

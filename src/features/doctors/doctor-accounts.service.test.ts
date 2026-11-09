import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  userFindUnique,
  userFindFirst,
  userCreate,
  userUpdate,
  doctorCreate,
  doctorFindUniqueOrThrow,
  doctorUpdate,
  transaction,
  createItem,
  listItems,
  replaceItem,
  hashPassword,
  createUnusablePasswordHash,
  consumeEmailVerifiedToken,
} = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userFindFirst: vi.fn(),
  userCreate: vi.fn(),
  userUpdate: vi.fn(),
  doctorCreate: vi.fn(),
  doctorFindUniqueOrThrow: vi.fn(),
  doctorUpdate: vi.fn(),
  transaction: vi.fn(),
  createItem: vi.fn(),
  listItems: vi.fn(),
  replaceItem: vi.fn(),
  hashPassword: vi.fn(),
  createUnusablePasswordHash: vi.fn(),
  consumeEmailVerifiedToken: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: userFindUnique,
      findFirst: userFindFirst,
      create: userCreate,
      update: userUpdate,
      findMany: vi.fn(),
    },
    doctor: {
      create: doctorCreate,
      findUnique: vi.fn(),
      findUniqueOrThrow: doctorFindUniqueOrThrow,
      update: doctorUpdate,
    },
    $transaction: transaction,
  },
}));

vi.mock("@/features/cms/store", () => ({
  createItem,
  listItems,
  replaceItem,
}));

vi.mock("@/lib/auth/password", () => ({
  hashPassword,
  createUnusablePasswordHash,
}));

vi.mock("@/features/doctors/doctor-email-verification.service", () => ({
  consumeEmailVerifiedToken,
  assertEmailVerifiedToken: vi.fn(),
}));

vi.mock("@/server/integrations/brevo/send", () => ({
  sendDoctorLoginCredentialsEmail: vi.fn(),
}));

import {
  approveDoctorAccount,
  createDoctorAccount,
} from "@/features/doctors/doctor-accounts.service";

describe("doctor-accounts.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listItems.mockResolvedValue([]);
    createItem.mockResolvedValue({ id: "cms-1" });
    createUnusablePasswordHash.mockResolvedValue("$argon2-unusable");
    hashPassword.mockResolvedValue("$argon2-real-hash");
    consumeEmailVerifiedToken.mockResolvedValue(undefined);
  });

  it("creates a pending doctor without hashing the real password yet", async () => {
    userFindUnique.mockResolvedValue(null);
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        user: {
          create: vi.fn().mockResolvedValue({
            id: "user-1",
            name: "Dr. Ada",
            email: "ada@example.com",
            phone: "9876543210",
            passcode: "159753",
            pendingPassword: "SecretPass1!",
            approvalStatus: "PENDING_APPROVAL",
            isActive: false,
            credentialsEmailSentAt: null,
            createdAt: new Date("2026-01-01"),
          }),
        },
        doctor: {
          create: vi.fn().mockResolvedValue({ id: "doc-1" }),
        },
      };
      return fn(tx);
    });
    doctorFindUniqueOrThrow.mockResolvedValue({ id: "doc-1" });

    const created = await createDoctorAccount({
      name: "Ada",
      email: "ada@example.com",
      phone: "9876543210",
      password: "SecretPass1!",
      passcode: "159753",
      emailVerificationToken: "verify-1",
    });

    expect(createUnusablePasswordHash).toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
    expect(created.approvalStatus).toBe("PENDING_APPROVAL");
    expect(created.pendingPassword).toBe("SecretPass1!");
  });

  it("hashes password on approve and keeps plaintext until credentials email", async () => {
    userFindFirst.mockResolvedValue({
      id: "user-1",
      name: "Dr. Ada",
      email: "ada@example.com",
      phone: "9876543210",
      passcode: "159753",
      pendingPassword: "SecretPass1!",
      approvalStatus: "PENDING_APPROVAL",
      isActive: false,
      credentialsEmailSentAt: null,
      createdAt: new Date("2026-01-01"),
      doctor: { id: "doc-1" },
    });
    userUpdate.mockResolvedValue({
      id: "user-1",
      name: "Dr. Ada",
      email: "ada@example.com",
      phone: "9876543210",
      passcode: "159753",
      pendingPassword: "SecretPass1!",
      approvalStatus: "APPROVED",
      isActive: true,
      credentialsEmailSentAt: null,
      createdAt: new Date("2026-01-01"),
      doctor: { id: "doc-1" },
    });

    const approved = await approveDoctorAccount("user-1");

    expect(hashPassword).toHaveBeenCalledWith("SecretPass1!");
    expect(userUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: "$argon2-real-hash",
          pendingPassword: "SecretPass1!",
          approvalStatus: "APPROVED",
          isActive: true,
        }),
      }),
    );
    expect(approved.passwordForEmail).toBe("SecretPass1!");
  });
});

import "server-only";

import type { StaffApprovalStatus } from "@prisma/client";

import {
  consumeEmailVerifiedToken,
} from "@/features/doctors/doctor-email-verification.service";
import { createItem, listItems, replaceItem, type JsonRecord } from "@/features/cms/store";
import {
  createUnusablePasswordHash,
  hashPassword,
} from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { sendDoctorLoginCredentialsEmail } from "@/server/integrations/brevo/send";
import { doctorProfileSlug, formatDoctorDisplayName } from "@/types/doctors";
import type {
  ApproveDoctorAccountInput,
  CreateDoctorAccountInput,
  DoctorAccountDetail,
  DoctorAccountListItem,
  UpdateDoctorAccountInput,
} from "@/types/admin/doctor-account";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function phoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 15);
}

async function uniqueDoctorSlug(baseName: string): Promise<string> {
  const base = doctorProfileSlug(baseName) || "doctor";
  let slug = base;
  let suffix = 2;
  while (await prisma.doctor.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

function emptyProfile(name: string, email: string, phone: string) {
  return {
    name: formatDoctorDisplayName(name),
    specializations: ["General"],
    about: "",
    experienceYears: 0,
    state: "",
    city: "",
    phone,
    email,
    location: "",
    education: "",
    degree: "",
    workHistory: "",
    workDays: "",
    photoUrl: "",
    photoPublicId: "",
    active: false,
    order: 0,
  };
}

async function findCmsProfileByStaffUserId(staffUserId: string) {
  const items = await listItems("doctor-profile");
  return (
    items.find((item) => String(item.staffUserId ?? "") === staffUserId) ?? null
  );
}

function toListItem(
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    passcode: string | null;
    pendingPassword: string | null;
    approvalStatus: StaffApprovalStatus;
    isActive: boolean;
    credentialsEmailSentAt: Date | null;
    createdAt: Date;
    doctor: { id: string } | null;
  },
  cmsProfileId: string | null,
): DoctorAccountListItem {
  return {
    id: user.id,
    doctorId: user.doctor?.id ?? null,
    cmsProfileId,
    name: user.name?.trim() || user.email,
    email: user.email,
    phone: user.phone ?? "",
    passcode: user.passcode ?? "",
    pendingPassword: user.pendingPassword,
    approvalStatus: user.approvalStatus,
    isActive: user.isActive,
    credentialsSent: Boolean(user.credentialsEmailSentAt),
    credentialsEmailSentAt: user.credentialsEmailSentAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listDoctorAccounts(filter?: {
  status?: StaffApprovalStatus | "ALL";
}): Promise<DoctorAccountListItem[]> {
  const status = filter?.status && filter.status !== "ALL" ? filter.status : undefined;
  const users = await prisma.user.findMany({
    where: {
      role: "DOCTOR",
      ...(status ? { approvalStatus: status } : {}),
    },
    include: { doctor: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });

  const cmsItems = await listItems("doctor-profile");
  const cmsByUser = new Map<string, string>();
  for (const item of cmsItems) {
    const staffUserId = String(item.staffUserId ?? "");
    if (staffUserId) cmsByUser.set(staffUserId, item.id);
  }

  return users.map((user) => toListItem(user, cmsByUser.get(user.id) ?? null));
}

export async function createDoctorAccount(
  input: CreateDoctorAccountInput,
): Promise<DoctorAccountListItem> {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const phone = phoneDigits(input.phone);
  const password = input.password;
  const passcode = input.passcode.trim();

  if (!name) throw new Error("Doctor name is required.");
  if (!email.includes("@")) throw new Error("Enter a valid email address.");
  if (phone.length < 8) throw new Error("Enter a valid phone number.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (!passcode || passcode.length < 4) {
    throw new Error("Passcode must be at least 4 characters.");
  }

  await consumeEmailVerifiedToken(email, input.emailVerificationToken);

  const [emailTaken, passcodeTaken] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({ where: { passcode }, select: { id: true } }),
  ]);
  if (emailTaken) throw new Error("A staff account with this email already exists.");
  if (passcodeTaken) throw new Error("This passcode is already in use. Choose another.");

  const passwordHash = await createUnusablePasswordHash();
  const slug = await uniqueDoctorSlug(name);
  const displayName = formatDoctorDisplayName(name);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: displayName,
        email,
        phone,
        passwordHash,
        role: "DOCTOR",
        isActive: false,
        approvalStatus: "PENDING_APPROVAL",
        pendingPassword: password,
        passcode,
        emailVerifiedAt: new Date(),
      },
    });

    await tx.doctor.create({
      data: {
        userId: createdUser.id,
        slug,
        displayName,
        consultationFeePaise: 0,
        isActive: false,
      },
    });

    return createdUser;
  });

  const doctor = await prisma.doctor.findUniqueOrThrow({
    where: { userId: user.id },
    select: { id: true },
  });

  const profile = emptyProfile(displayName, email, phone);
  const cms = await createItem("doctor-profile", {
    ...profile,
    staffUserId: user.id,
    staffDoctorId: doctor.id,
  } as JsonRecord);

  return toListItem(
    {
      ...user,
      doctor: { id: doctor.id },
    },
    cms.id,
  );
}

export async function getDoctorAccount(userId: string): Promise<DoctorAccountDetail> {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "DOCTOR" },
    include: {
      doctor: { select: { id: true, consultationFeePaise: true } },
    },
  });
  if (!user) throw new Error("Doctor account not found.");

  const cms = await findCmsProfileByStaffUserId(user.id);
  const list = toListItem(user, cms?.id ?? null);
  const profileSource = cms ?? emptyProfile(user.name || user.email, user.email, user.phone ?? "");

  const canShowPendingPassword =
    user.approvalStatus === "PENDING_APPROVAL" || !user.credentialsEmailSentAt;

  return {
    ...list,
    passwordPrefill: canShowPendingPassword ? user.pendingPassword : null,
    canShowPendingPassword,
    profile: {
      prefix: "Dr.",
      name: String(profileSource.name ?? user.name ?? ""),
      specializations: Array.isArray(profileSource.specializations)
        ? (profileSource.specializations as string[]).filter(Boolean)
        : ["General"],
      about: String(profileSource.about ?? ""),
      experienceYears: Number(profileSource.experienceYears ?? 0) || 0,
      state: String(profileSource.state ?? ""),
      city: String(profileSource.city ?? ""),
      phone: String(profileSource.phone ?? user.phone ?? ""),
      email: String(profileSource.email ?? user.email),
      location: String(profileSource.location ?? ""),
      education: String(profileSource.education ?? ""),
      degree: String(profileSource.degree ?? ""),
      workHistory: String(profileSource.workHistory ?? ""),
      workDays: String(profileSource.workDays ?? ""),
      photoUrl: String(profileSource.photoUrl ?? ""),
      photoPublicId: String(profileSource.photoPublicId ?? ""),
      active: Boolean(profileSource.active),
      order: Number(profileSource.order ?? 0) || 0,
      consultationFeePaise: user.doctor?.consultationFeePaise ?? 0,
    },
  };
}

export async function approveDoctorAccount(
  userId: string,
  input: ApproveDoctorAccountInput = {},
): Promise<DoctorAccountListItem & { passwordForEmail: string }> {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "DOCTOR" },
    include: { doctor: { select: { id: true } } },
  });
  if (!user) throw new Error("Doctor account not found.");
  if (user.approvalStatus === "APPROVED" && user.isActive) {
    throw new Error("This doctor is already approved.");
  }

  const password = (input.password?.trim() || user.pendingPassword || "").trim();
  const passcode = (input.passcode?.trim() || user.passcode || "").trim();
  if (password.length < 8) {
    throw new Error("A password of at least 8 characters is required to approve.");
  }
  if (!passcode || passcode.length < 4) {
    throw new Error("A passcode of at least 4 characters is required to approve.");
  }

  if (passcode !== user.passcode) {
    const taken = await prisma.user.findFirst({
      where: { passcode, NOT: { id: user.id } },
      select: { id: true },
    });
    if (taken) throw new Error("This passcode is already in use. Choose another.");
  }

  const passwordHash = await hashPassword(password);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      pendingPassword: password,
      passcode,
      approvalStatus: "APPROVED",
      isActive: true,
    },
    include: { doctor: { select: { id: true } } },
  });

  if (updated.doctor) {
    await prisma.doctor.update({
      where: { id: updated.doctor.id },
      data: { isActive: true },
    });
  }

  // Public landing /doctors reads CMS `active`, not Prisma approval flags.
  // Publish the linked profile on approve; it still needs a photo to appear.
  const cms = await findCmsProfileByStaffUserId(updated.id);
  if (cms) {
    await replaceItem("doctor-profile", cms.id, {
      ...cms,
      active: true,
      staffUserId: updated.id,
      staffDoctorId: updated.doctor?.id ?? null,
    } as JsonRecord);
  }

  return {
    ...toListItem(updated, cms?.id ?? null),
    passwordForEmail: password,
  };
}

export async function sendDoctorCredentialsEmail(userId: string): Promise<DoctorAccountListItem> {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "DOCTOR" },
    include: { doctor: { select: { id: true } } },
  });
  if (!user) throw new Error("Doctor account not found.");
  if (user.approvalStatus !== "APPROVED" || !user.isActive) {
    throw new Error("Approve the doctor before sending login credentials.");
  }
  if (!user.pendingPassword) {
    throw new Error(
      "Password is no longer available to resend. Set a new password on the edit page first.",
    );
  }
  if (!user.passcode) {
    throw new Error("Passcode is missing. Update the doctor account first.");
  }

  await sendDoctorLoginCredentialsEmail({
    toEmail: user.email,
    toName: user.name || user.email,
    loginEmail: user.email,
    password: user.pendingPassword,
    passcode: user.passcode,
    userId: user.id,
  });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      credentialsEmailSentAt: new Date(),
      pendingPassword: null,
    },
    include: { doctor: { select: { id: true } } },
  });

  const cms = await findCmsProfileByStaffUserId(updated.id);
  return toListItem(updated, cms?.id ?? null);
}

export async function updateDoctorAccount(
  userId: string,
  input: UpdateDoctorAccountInput,
): Promise<DoctorAccountDetail> {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "DOCTOR" },
    include: { doctor: { select: { id: true } } },
  });
  if (!user) throw new Error("Doctor account not found.");

  const nextPasscode = input.passcode?.trim();
  if (nextPasscode) {
    const taken = await prisma.user.findFirst({
      where: { passcode: nextPasscode, NOT: { id: user.id } },
      select: { id: true },
    });
    if (taken) throw new Error("This passcode is already in use. Choose another.");
  }

  const passwordUpdate = input.password?.trim();
  let passwordHash: string | undefined;
  let pendingPassword: string | null | undefined;

  if (passwordUpdate) {
    if (passwordUpdate.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }
    if (user.approvalStatus === "APPROVED") {
      passwordHash = await hashPassword(passwordUpdate);
      pendingPassword = passwordUpdate;
    } else {
      pendingPassword = passwordUpdate;
    }
  }

  const displayName = input.name?.trim()
    ? formatDoctorDisplayName(input.name)
    : undefined;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(displayName ? { name: displayName } : {}),
      ...(input.phone !== undefined ? { phone: phoneDigits(input.phone) } : {}),
      ...(nextPasscode ? { passcode: nextPasscode } : {}),
      ...(passwordHash ? { passwordHash } : {}),
      ...(pendingPassword !== undefined ? { pendingPassword } : {}),
      ...(passwordUpdate && user.approvalStatus === "APPROVED"
        ? { credentialsEmailSentAt: null }
        : {}),
    },
  });

  if (user.doctor) {
    const doctorData: {
      displayName?: string;
      consultationFeePaise?: number;
    } = {};
    if (displayName) doctorData.displayName = displayName;
    if (
      input.profile?.consultationFeePaise !== undefined &&
      Number.isInteger(input.profile.consultationFeePaise) &&
      input.profile.consultationFeePaise >= 0
    ) {
      doctorData.consultationFeePaise = input.profile.consultationFeePaise;
    }
    if (Object.keys(doctorData).length > 0) {
      await prisma.doctor.update({
        where: { id: user.doctor.id },
        data: doctorData,
      });
    }
  }

  if (input.profile) {
    const cms = await findCmsProfileByStaffUserId(user.id);
    const { consultationFeePaise: _fee, ...profileWithoutFee } = input.profile;
    void _fee;
    const payload = {
      ...profileWithoutFee,
      name: formatDoctorDisplayName(input.profile.name),
      email: user.email,
      staffUserId: user.id,
      staffDoctorId: user.doctor?.id ?? null,
    };
    if (cms) {
      await replaceItem("doctor-profile", cms.id, payload as JsonRecord);
    } else {
      await createItem("doctor-profile", payload as JsonRecord);
    }
  }

  return getDoctorAccount(userId);
}

export async function disableDoctorAccount(userId: string): Promise<DoctorAccountListItem> {
  const user = await prisma.user.findFirst({
    where: { id: userId, role: "DOCTOR" },
    include: { doctor: { select: { id: true } } },
  });
  if (!user) throw new Error("Doctor account not found.");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      approvalStatus: "DISABLED",
      isActive: false,
    },
    include: { doctor: { select: { id: true } } },
  });

  if (updated.doctor) {
    await prisma.doctor.update({
      where: { id: updated.doctor.id },
      data: { isActive: false },
    });
  }

  const cms = await findCmsProfileByStaffUserId(updated.id);
  if (cms) {
    await replaceItem("doctor-profile", cms.id, {
      ...cms,
      active: false,
      staffUserId: updated.id,
      staffDoctorId: updated.doctor?.id ?? null,
    } as JsonRecord);
  }

  return toListItem(updated, cms?.id ?? null);
}

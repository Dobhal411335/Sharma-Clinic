import type { StaffApprovalStatus } from "@prisma/client";

export type DoctorAccountListItem = {
  id: string;
  doctorId: string | null;
  cmsProfileId: string | null;
  name: string;
  email: string;
  phone: string;
  passcode: string;
  pendingPassword: string | null;
  approvalStatus: StaffApprovalStatus;
  isActive: boolean;
  credentialsSent: boolean;
  credentialsEmailSentAt: string | null;
  createdAt: string;
};

export type DoctorAccountDetail = DoctorAccountListItem & {
  passwordPrefill: string | null;
  canShowPendingPassword: boolean;
  profile: {
    prefix: string;
    name: string;
    specializations: string[];
    about: string;
    experienceYears: number;
    state: string;
    city: string;
    phone: string;
    email: string;
    location: string;
    education: string;
    degree: string;
    workHistory: string;
    workDays: string;
    photoUrl: string;
    photoPublicId: string;
    active: boolean;
    order: number;
  };
};

export type CreateDoctorAccountInput = {
  name: string;
  email: string;
  phone: string;
  password: string;
  passcode: string;
  emailVerificationToken: string;
};

export type ApproveDoctorAccountInput = {
  password?: string;
  passcode?: string;
};

export type UpdateDoctorAccountInput = {
  name?: string;
  phone?: string;
  password?: string;
  passcode?: string;
  profile?: {
    prefix?: string;
    name: string;
    specializations: string[];
    about: string;
    experienceYears: number;
    state: string;
    city: string;
    phone: string;
    email: string;
    location: string;
    education: string;
    degree: string;
    workHistory: string;
    workDays: string;
    photoUrl: string;
    photoPublicId: string;
    active: boolean;
    order?: number;
  };
};

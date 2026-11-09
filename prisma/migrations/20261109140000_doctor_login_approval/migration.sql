-- CreateEnum
CREATE TYPE "StaffApprovalStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'DISABLED');

-- AlterTable
ALTER TABLE "users"
ADD COLUMN "approvalStatus" "StaffApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN "phone" TEXT,
ADD COLUMN "passcode" TEXT,
ADD COLUMN "pendingPassword" TEXT,
ADD COLUMN "credentialsEmailSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_passcode_key" ON "users"("passcode");

-- CreateIndex
CREATE INDEX "users_approvalStatus_idx" ON "users"("approvalStatus");

-- CreateTable
CREATE TABLE "doctor_email_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_email_verifications_email_createdAt_idx" ON "doctor_email_verifications"("email", "createdAt");

-- CreateIndex
CREATE INDEX "doctor_email_verifications_expiresAt_idx" ON "doctor_email_verifications"("expiresAt");

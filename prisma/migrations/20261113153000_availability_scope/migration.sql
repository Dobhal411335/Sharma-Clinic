-- CreateEnum
CREATE TYPE "AvailabilityScope" AS ENUM ('FIXED', 'TEMPORARY', 'CUSTOM');

-- AlterTable
ALTER TABLE "weekly_availabilities"
ADD COLUMN "scope" "AvailabilityScope" NOT NULL DEFAULT 'FIXED';

-- CreateIndex
CREATE INDEX "weekly_availabilities_doctorId_scope_isActive_idx"
ON "weekly_availabilities"("doctorId", "scope", "isActive");

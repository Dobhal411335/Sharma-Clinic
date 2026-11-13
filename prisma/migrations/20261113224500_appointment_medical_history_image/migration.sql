-- AlterTable
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "medicalHistoryImageUrl" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "medicalHistoryImagePublicId" TEXT;

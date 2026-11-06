-- Complete domain schema: specialties, patients, availability, CMS, media,
-- email/outbox, clinic settings, audit extensions, appointment overlap
-- exclusion, and payment enum extensions.
-- Financial / appointment history is preserved (Restrict FKs; soft status).

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ─── New enums ───────────────────────────────────────────────────────────────
CREATE TYPE "RefundType" AS ENUM ('FULL', 'PARTIAL');
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
CREATE TYPE "AvailabilityExceptionType" AS ENUM ('UNAVAILABLE', 'EXTRA_HOURS', 'OVERRIDE');
CREATE TYPE "MediaProvider" AS ENUM ('CLOUDINARY');
CREATE TYPE "MediaResourceType" AS ENUM ('IMAGE', 'RAW', 'VIDEO', 'AUTO');
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "EmailProvider" AS ENUM ('BREVO');
CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'BOUNCED', 'FAILED', 'SKIPPED_DUPLICATE');
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL');
CREATE TYPE "NotificationOutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');

-- Extend existing enums (additive; safe for existing rows)
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'NO_SHOW';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_REFUNDED';
ALTER TYPE "WebhookProcessingStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';
ALTER TYPE "RefundStatus" ADD VALUE IF NOT EXISTS 'CREATED';

-- ─── Media assets (created early for FKs) ────────────────────────────────────
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "provider" "MediaProvider" NOT NULL DEFAULT 'CLOUDINARY',
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "resourceType" "MediaResourceType" NOT NULL DEFAULT 'IMAGE',
    "originalFileName" TEXT,
    "mimeType" TEXT,
    "bytes" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "media_assets_provider_key_key" ON "media_assets"("provider", "key");
CREATE INDEX "media_assets_provider_idx" ON "media_assets"("provider");
CREATE INDEX "media_assets_uploadedByUserId_idx" ON "media_assets"("uploadedByUserId");

ALTER TABLE "media_assets"
  ADD CONSTRAINT "media_assets_uploadedByUserId_fkey"
  FOREIGN KEY ("uploadedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Specialties ─────────────────────────────────────────────────────────────
CREATE TABLE "specialties" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageAssetId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialties_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "specialties_slug_key" ON "specialties"("slug");
CREATE UNIQUE INDEX "specialties_imageAssetId_key" ON "specialties"("imageAssetId");
CREATE INDEX "specialties_isActive_sortOrder_idx" ON "specialties"("isActive", "sortOrder");

ALTER TABLE "specialties"
  ADD CONSTRAINT "specialties_imageAssetId_fkey"
  FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Patients ────────────────────────────────────────────────────────────────
-- Phone is NOT globally unique: shared family numbers are allowed.
-- App should normalize to digits / E.164 when country is known; do not invent policy here.
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "patients_phone_idx" ON "patients"("phone");
CREATE INDEX "patients_email_idx" ON "patients"("email");

-- ─── Doctors: expand columns; ensure every doctor has a user ─────────────────
-- Placeholder staff users for any legacy doctor rows missing userId (idempotent).
INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "isActive", "createdAt", "updatedAt")
SELECT
  'seed_doc_user_' || d."id",
  d."displayName",
  'legacy-doctor-' || d."id" || '@invalid.local',
  -- Unusable placeholder hash; replace via admin provisioning before login.
  '$2b$10$legacyplaceholderhashnotusable000000000000000000000000',
  'DOCTOR',
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "doctors" d
WHERE d."userId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "users" u WHERE u."id" = 'seed_doc_user_' || d."id"
  );

UPDATE "doctors" d
SET "userId" = 'seed_doc_user_' || d."id"
WHERE d."userId" IS NULL;

ALTER TABLE "doctors" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "specialtyId" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "biography" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "qualifications" TEXT;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "experienceYears" INTEGER;
ALTER TABLE "doctors" ADD COLUMN IF NOT EXISTS "profileImageAssetId" TEXT;

-- Backfill unique slugs for existing doctors
UPDATE "doctors" d
SET "slug" = 'doctor-' || lower(substr(md5(d."id"), 1, 12))
WHERE d."slug" IS NULL OR d."slug" = '';

ALTER TABLE "doctors" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "doctors_slug_key" ON "doctors"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "doctors_profileImageAssetId_key" ON "doctors"("profileImageAssetId");
CREATE INDEX IF NOT EXISTS "doctors_specialtyId_idx" ON "doctors"("specialtyId");

ALTER TABLE "doctors"
  DROP CONSTRAINT IF EXISTS "doctors_userId_fkey";
ALTER TABLE "doctors"
  ADD CONSTRAINT "doctors_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "doctors"
  ADD CONSTRAINT "doctors_specialtyId_fkey"
  FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "doctors"
  ADD CONSTRAINT "doctors_profileImageAssetId_fkey"
  FOREIGN KEY ("profileImageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Appointments: patients, endsAt required, lifecycle timestamps, indexes ──
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "patientId" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "reason" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- Backfill Patient rows from booking snapshots for any existing appointments
INSERT INTO "patients" ("id", "fullName", "phone", "email", "createdAt", "updatedAt")
SELECT
  'pat_' || a."id",
  a."patientName",
  COALESCE(NULLIF(a."patientPhone", ''), 'unknown'),
  NULLIF(a."patientEmail", ''),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "appointments" a
WHERE a."patientId" IS NULL
  AND NOT EXISTS (SELECT 1 FROM "patients" p WHERE p."id" = 'pat_' || a."id");

UPDATE "appointments" a
SET "patientId" = 'pat_' || a."id"
WHERE a."patientId" IS NULL;

ALTER TABLE "appointments" ALTER COLUMN "patientId" SET NOT NULL;

-- Ensure endsAt is present for exclusion constraint (default 30-minute slots)
UPDATE "appointments"
SET "endsAt" = "startsAt" + INTERVAL '30 minutes'
WHERE "endsAt" IS NULL;

ALTER TABLE "appointments" ALTER COLUMN "endsAt" SET NOT NULL;

ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_patientId_fkey"
  FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "appointments_doctorId_startsAt_idx" ON "appointments"("doctorId", "startsAt");
CREATE INDEX IF NOT EXISTS "appointments_status_startsAt_idx" ON "appointments"("status", "startsAt");
CREATE INDEX IF NOT EXISTS "appointments_patientId_idx" ON "appointments"("patientId");

-- Overlapping active appointments for the same doctor are rejected at DB level.
-- Active = PENDING_PAYMENT | CONFIRMED. Soft-cancel / expire / complete frees the range.
-- Prisma DateTime → TIMESTAMP(3) without time zone, so use tsrange (not tstzrange).
-- Application still treats stored instants as UTC.
ALTER TABLE "appointments"
  ADD CONSTRAINT "appointments_doctor_time_excl"
  EXCLUDE USING gist (
    "doctorId" WITH =,
    tsrange("startsAt", "endsAt", '[)') WITH &&
  )
  WHERE ("status" IN ('PENDING_PAYMENT', 'CONFIRMED'));

-- ─── Payments: additive columns + indexes ────────────────────────────────────
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "failureCode" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "signatureVerifiedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "payments_status_createdAt_idx" ON "payments"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "payments_appointmentId_idx" ON "payments"("appointmentId");

-- Explicit partial unique for one active attempt (complements Prisma @@unique which
-- already allows multiple NULLs in PostgreSQL). Safe if the Prisma unique exists.
CREATE UNIQUE INDEX IF NOT EXISTS "payments_one_active_attempt_per_appointment"
  ON "payments" ("activeAppointmentId")
  WHERE "activeAppointmentId" IS NOT NULL;

-- Positive money amounts (refund cap across rows is enforced in application transactions).
ALTER TABLE "payments"
  DROP CONSTRAINT IF EXISTS "payments_amountPaise_positive";
ALTER TABLE "payments"
  ADD CONSTRAINT "payments_amountPaise_positive" CHECK ("amountPaise" > 0);

-- ─── Refunds: type, currency, actor, processedAt, positive amount ────────────
ALTER TABLE "refunds" ADD COLUMN IF NOT EXISTS "type" "RefundType" NOT NULL DEFAULT 'FULL';
ALTER TABLE "refunds" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE "refunds" ADD COLUMN IF NOT EXISTS "initiatedByUserId" TEXT;
ALTER TABLE "refunds" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);

ALTER TABLE "refunds"
  DROP CONSTRAINT IF EXISTS "refunds_initiatedByUserId_fkey";
ALTER TABLE "refunds"
  ADD CONSTRAINT "refunds_initiatedByUserId_fkey"
  FOREIGN KEY ("initiatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "refunds_initiatedByUserId_idx" ON "refunds"("initiatedByUserId");

ALTER TABLE "refunds"
  DROP CONSTRAINT IF EXISTS "refunds_amountPaise_positive";
ALTER TABLE "refunds"
  ADD CONSTRAINT "refunds_amountPaise_positive" CHECK ("amountPaise" > 0);

-- ─── Webhooks: payloadHash, optional payload, retryCount ─────────────────────
ALTER TABLE "payment_webhook_events" ADD COLUMN IF NOT EXISTS "payloadHash" TEXT;
ALTER TABLE "payment_webhook_events" ADD COLUMN IF NOT EXISTS "retryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "payment_webhook_events" ALTER COLUMN "payload" DROP NOT NULL;

-- ─── Audit log extensions ────────────────────────────────────────────────────
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "beforeData" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "afterData" JSONB;
ALTER TABLE "audit_logs" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;

ALTER TABLE "audit_logs"
  DROP CONSTRAINT IF EXISTS "audit_logs_actorUserId_fkey";
ALTER TABLE "audit_logs"
  ADD CONSTRAINT "audit_logs_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Availability ────────────────────────────────────────────────────────────
CREATE TABLE "weekly_availabilities" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "startTimeLocal" TEXT NOT NULL,
    "endTimeLocal" TEXT NOT NULL,
    "slotDurationMinutes" INTEGER NOT NULL,
    "breakStartLocal" TEXT,
    "breakEndLocal" TEXT,
    "effectiveFrom" TIMESTAMP(3),
    "effectiveUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_availabilities_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "weekly_availabilities_doctorId_weekday_idx" ON "weekly_availabilities"("doctorId", "weekday");
CREATE INDEX "weekly_availabilities_doctorId_isActive_idx" ON "weekly_availabilities"("doctorId", "isActive");

ALTER TABLE "weekly_availabilities"
  ADD CONSTRAINT "weekly_availabilities_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "availability_exceptions" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "AvailabilityExceptionType" NOT NULL,
    "startTimeLocal" TEXT,
    "endTimeLocal" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_exceptions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "availability_exceptions_doctorId_date_idx" ON "availability_exceptions"("doctorId", "date");

ALTER TABLE "availability_exceptions"
  ADD CONSTRAINT "availability_exceptions_doctorId_fkey"
  FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Website CMS / Services / Blog ───────────────────────────────────────────
CREATE TABLE "website_sections" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" JSONB,
    "imageAssetId" TEXT,
    "buttonText" TEXT,
    "buttonLink" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_sections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "website_sections_key_key" ON "website_sections"("key");
CREATE INDEX "website_sections_isPublished_sortOrder_idx" ON "website_sections"("isPublished", "sortOrder");

ALTER TABLE "website_sections"
  ADD CONSTRAINT "website_sections_imageAssetId_fkey"
  FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageAssetId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");
CREATE INDEX "services_isPublished_sortOrder_idx" ON "services"("isPublished", "sortOrder");

ALTER TABLE "services"
  ADD CONSTRAINT "services_imageAssetId_fkey"
  FOREIGN KEY ("imageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImageAssetId" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "authorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");
CREATE INDEX "blog_posts_status_publishedAt_idx" ON "blog_posts"("status", "publishedAt");
CREATE INDEX "blog_posts_authorUserId_idx" ON "blog_posts"("authorUserId");

ALTER TABLE "blog_posts"
  ADD CONSTRAINT "blog_posts_coverImageAssetId_fkey"
  FOREIGN KEY ("coverImageAssetId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "blog_posts"
  ADD CONSTRAINT "blog_posts_authorUserId_fkey"
  FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Email logs / Notification outbox ────────────────────────────────────────
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "templateKind" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "subject" TEXT NOT NULL,
    "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "EmailProvider" NOT NULL DEFAULT 'BREVO',
    "providerMessageId" TEXT,
    "referenceId" TEXT,
    "idempotencyKey" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_logs_idempotencyKey_key" ON "email_logs"("idempotencyKey");
CREATE INDEX "email_logs_status_createdAt_idx" ON "email_logs"("status", "createdAt");
CREATE INDEX "email_logs_templateKind_idx" ON "email_logs"("templateKind");
CREATE INDEX "email_logs_recipientEmail_idx" ON "email_logs"("recipientEmail");
CREATE INDEX "email_logs_referenceId_idx" ON "email_logs"("referenceId");

CREATE TABLE "notification_outbox" (
    "id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "eventType" TEXT NOT NULL,
    "referenceId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "recipientName" TEXT,
    "payload" JSONB NOT NULL,
    "status" "NotificationOutboxStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "actorUserId" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_outbox_pkey" PRIMARY KEY ("id")
);

-- Primary dedupe: idempotencyKey (recommended: channel:eventType:referenceId:recipient).
CREATE UNIQUE INDEX "notification_outbox_idempotencyKey_key" ON "notification_outbox"("idempotencyKey");
CREATE INDEX "notification_outbox_status_availableAt_idx" ON "notification_outbox"("status", "availableAt");
CREATE INDEX "notification_outbox_relatedEntityType_relatedEntityId_idx" ON "notification_outbox"("relatedEntityType", "relatedEntityId");
CREATE INDEX "notification_outbox_channel_status_idx" ON "notification_outbox"("channel", "status");
CREATE INDEX "notification_outbox_eventType_referenceId_recipientEmail_idx"
  ON "notification_outbox"("eventType", "referenceId", "recipientEmail");

ALTER TABLE "notification_outbox"
  ADD CONSTRAINT "notification_outbox_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Clinic settings (non-secret only) ───────────────────────────────────────
CREATE TABLE "clinic_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clinic_settings_key_key" ON "clinic_settings"("key");

-- ─── Users: lastLoginAt / emailVerifiedAt ────────────────────────────────────
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

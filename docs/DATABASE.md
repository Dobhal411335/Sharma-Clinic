# Sharma Clinic — Database Design

PostgreSQL + Prisma 7 (`prisma.config.ts`, `@prisma/adapter-pg`) is the
system of record for auth, doctors, availability, appointments, payments,
CMS, media, notifications, and audit.

This document reflects the **implemented** schema in `prisma/schema.prisma`
and migrations under `prisma/migrations/`.

## 1. Conventions

| Topic | Decision |
| --- | --- |
| Primary keys | `cuid()` text IDs (existing project convention). Docs originally proposed UUID; cuid is retained for compatibility with payment/audit migrations. |
| Staff roles | Prisma enum `Role` = `ADMIN` \| `DOCTOR` (semantic UserRole; name preserved). No customer accounts. |
| Money | Integer **paise** only; `currency` default `INR`. Never float. CHECK `amountPaise > 0` on Payment/Refund. |
| Time | Persist UTC (`DateTime`). Availability wall-clock strings are local + `ClinicSetting` timezone. |
| Soft lifecycle | Prefer `isActive` / status changes over deletes for doctors, services, appointments. |
| Cascades | **Never** cascade-delete appointments, payments, refunds, or audits when a doctor/user is deactivated. Doctor→User is `Restrict`. Appointment/Payment/Refund FKs are `Restrict`. Availability rules cascade with doctor. |
| Prisma 7 | Datasource URL lives in `prisma.config.ts`, not `schema.prisma`. Seed command configured there (`tsx prisma/seed.ts`). |

## 2. Folder structure

```text
prisma/
  schema.prisma
  seed.ts
  migrations/
    migration_lock.toml
    20261101134543_init_payments/migration.sql
    20261101141500_add_audit_logs/migration.sql
    20261101184500_complete_domain_schema/migration.sql
docs/
  DATABASE.md
  ARCHITECTURE.md
src/lib/db/
  prisma.ts                  # Prisma 7 + pg adapter singleton
  constraints.ts             # Named PG constraint identifiers / policies
  constraints.test.ts
  domain-invariants.test.ts
  pg-constraints.integration.test.ts  # live DB; skipped without DATABASE_URL
```

## 3. Modules and models

### Auth / Users — `User`

Staff identity only. Fields: `id`, `name`, `email` (unique; normalize lowercase
trim in app/seed), `passwordHash`, `role`, `isActive`, `emailVerifiedAt?`,
`lastLoginAt?`, timestamps.

- Admin does **not** require a `Doctor` row.
- Doctor role users map 1:1 to `Doctor` via `Doctor.userId`.

### Doctors / Specialties — `Specialty`, `Doctor`

- `Specialty`: `slug`, `name`, `description`, optional `imageAssetId` → `MediaAsset`,
  `sortOrder`, `isActive`.
- `Doctor`: required `userId` (1:1), unique `slug`, optional `specialtyId`,
  profile fields, optional `profileImageAssetId` → `MediaAsset`,
  `consultationFeePaise` (current fee; history uses snapshots), `isActive`.

### Patients — `Patient`

Minimal booking contacts: `fullName`, `phone`, `email?`. No login.

**Phone normalization policy:** store the phone as collected; prefer E.164 with
country code when the booking UI knows it. Do **not** enforce a global unique
constraint on phone — household members may share a number. Application code may
normalize whitespace/punctuation for lookup without inventing a clinic-wide unique
identity.

### Appointments — `Appointment`

- `bookingReference` (unique; docs name “publicReference”)
- `doctorId`, `patientId`
- Denormalized booking snapshot: `patientName`, `patientEmail`, `patientPhone?`
  (kept for receipts/history and Razorpay/Brevo compatibility)
- `startsAt`, `endsAt` (required UTC), `status`, `feeSnapshotPaise`, `currency`
- `reason?`, `cancellationReason?`, `accessToken`, `cancelledAt?`,
  `confirmedAt?`, `completedAt?`

**Overlap prevention (PostgreSQL):**

```sql
EXCLUDE USING gist (
  "doctorId" WITH =,
  tsrange("startsAt", "endsAt", '[)') WITH &&
)
WHERE ("status" IN ('PENDING_PAYMENT', 'CONFIRMED'))
```

Uses `tsrange` because Prisma `DateTime` maps to `TIMESTAMP(3)` (without time
zone); values are still treated as UTC in application code. Requires
`btree_gist`. Cancelled / expired / completed / no-show rows do not block the
range. Application code must still check availability; this is the concurrency
backstop.

### Availability — `WeeklyAvailability`, `AvailabilityException`

- Weekly: `weekday`, local `startTimeLocal` / `endTimeLocal` (`HH:mm`),
  `slotDurationMinutes`, optional break windows, optional effective range.
- Exceptions: `date`, `type` (`UNAVAILABLE` \| `EXTRA_HOURS` \| `OVERRIDE`),
  optional local times + private `reason`.

Deleting a doctor cascades availability rules only (not appointments).

### Payments — `Payment`

Aligned with existing Razorpay services:

- `attemptNumber`, `idempotencyKey` (unique)
- `provider` / `providerOrderId` / `providerPaymentId`
- `amountPaise`, `feeSnapshotPaise`, `doctorFeePaise`
- `failureCode?`, `failureReason?`, `signatureVerifiedAt?`
- `activeAppointmentId` — set while attempt is active; **unique** so only one
  active attempt per appointment (PostgreSQL treats multiple NULLs as distinct;
  migration also adds an explicit partial unique index)
- Statuses: `CREATED` → `ORDER_CREATED` → `PENDING` → `PAID` →
  `PARTIALLY_REFUNDED` / `REFUNDED`, plus `FAILED` / `EXPIRED`

Never delete payment rows to “fix” history.

### Refunds — `Refund`

`amountPaise` (> 0 CHECK), `currency`, `type` (`FULL` \| `PARTIAL`),
`idempotencyKey`, `providerRefundId?`, `status`
(`CREATED` \| `PENDING` \| `PROCESSED` \| `FAILED`), optional
`initiatedByUserId`, `processedAt?`. FK `onDelete: Restrict`.

**Refund cap:** application transactions must keep
`sum(PENDING|PROCESSED amounts) ≤ payment.amountPaise`. Not implemented as a
DB trigger (would couple refund status semantics); documented in
`src/lib/db/constraints.ts` (`REFUND_CAP_POLICY`).

### Webhooks — `PaymentWebhookEvent`

- Unique `providerEventId` (idempotent inbox)
- `payloadHash` (SHA-256 preferred durable identity)
- Optional `payload` JSON for ops (avoid logging PII from it)
- `retryCount`, statuses include `PROCESSING`

### Website CMS / Services / Blog

- `WebsiteSection` — unique `key` (alias sectionKey), title/subtitle, flexible
  `content` JSON, optional image + CTA fields
- `Service` — unique `slug`, publish flags
- `BlogPost` — `content` body, draft/published/archived, optional author + cover

### Media — `MediaAsset`

Cloudinary-oriented: `provider`, `key` (= public_id), `url`, `resourceType`,
`originalFileName?`, `bytes` (alias fileSize), optional dimensions/mime/alt,
`uploadedByUserId?`. Unique `(provider, key)`.

### Email / Outbox

- `EmailLog` — delivery audit without full bodies; unique optional
  `idempotencyKey`; `referenceId?` for correlation
- `NotificationOutbox` — durable queue; **no scheduler** in this task.
  Dedupe via unique `idempotencyKey` (recommended:
  `{channel}:{eventType}:{referenceId}:{recipient}`). Supporting index on
  `(eventType, referenceId, recipientEmail)`.

### Audit — `AuditLog`

Append-only: `actorUserId?`, `action`, `entityType`, `entityId`,
`beforeData?`, `afterData?`, `metadata?`, `ipAddress?`, `createdAt`.
ADMIN-only readers at the API layer. `logAuditEvent` persists these fields.

### Clinic settings — `ClinicSetting`

Non-secret key/value JSON only (timezone, currency labels, booking TTL
placeholders). **Never** store API secrets here.

## 4. Relationships (summary)

```
User 1 ── 0..1 Doctor
Specialty 1 ── * Doctor
Doctor 1 ── * Appointment / WeeklyAvailability / AvailabilityException
Patient 1 ── * Appointment
Appointment 1 ── * Payment
Payment 1 ── * Refund
User 1 ── * AuditLog / BlogPost / NotificationOutbox / MediaAsset / Refund(initiated)
MediaAsset 1 ── * WebsiteSection / Service / BlogPost / Doctor(profile) / Specialty(image)
```

## 5. Enums

| Enum | Values |
| --- | --- |
| `Role` | `ADMIN`, `DOCTOR` |
| `AppointmentStatus` | `PENDING_PAYMENT`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`, `EXPIRED` |
| `PaymentStatus` | `CREATED`, `ORDER_CREATED`, `PENDING`, `PAID`, `FAILED`, `EXPIRED`, `PARTIALLY_REFUNDED`, `REFUNDED` |
| `PaymentProvider` | `RAZORPAY` |
| `WebhookProcessingStatus` | `RECEIVED`, `PROCESSING`, `PROCESSED`, `IGNORED`, `FAILED` |
| `RefundStatus` | `CREATED`, `PENDING`, `PROCESSED`, `FAILED` |
| `RefundType` | `FULL`, `PARTIAL` |
| `Weekday` | `MONDAY`…`SUNDAY` |
| `AvailabilityExceptionType` | `UNAVAILABLE`, `EXTRA_HOURS`, `OVERRIDE` |
| `MediaProvider` | `CLOUDINARY` |
| `MediaResourceType` | `IMAGE`, `RAW`, `VIDEO`, `AUTO` |
| `BlogPostStatus` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `EmailProvider` | `BREVO` |
| `EmailDeliveryStatus` | `PENDING`, `SENT`, `DELIVERED`, `BOUNCED`, `FAILED`, `SKIPPED_DUPLICATE` |
| `NotificationChannel` | `EMAIL` |
| `NotificationOutboxStatus` | `PENDING`, `PROCESSING`, `SENT`, `FAILED`, `CANCELLED` |

## 6. Indexes and constraints (high level)

- Unique: `User.email`, `Doctor.slug` / `userId`, `Specialty.slug`,
  `Appointment.bookingReference` / `accessToken`, payment provider IDs,
  payment `idempotencyKey`, webhook `providerEventId`, outbox/email
  idempotency keys, `ClinicSetting.key`, `MediaAsset(provider,key)`.
- Appointment indexes: `(doctorId, startsAt)`, `(status, startsAt)`, `patientId`.
- Payment indexes: `(status, createdAt)`, `appointmentId`, active attempt unique.
- Availability indexes: `(doctorId, weekday)`, `(doctorId, date)`.
- PostgreSQL-specific: `appointments_doctor_time_excl`,
  `payments_one_active_attempt_per_appointment`, positive amount CHECKs.

## 7. Migrations

| Migration | Purpose |
| --- | --- |
| `20261101134543_init_payments` | Users, doctors, appointments, payments, webhooks, refunds, audit (baseline) |
| `20261101141500_add_audit_logs` | Idempotent ensure audit table (audit already in init) |
| `20261101184500_complete_domain_schema` | Full domain: specialties, patients, availability, CMS, media, email/outbox, settings, enum extensions, exclusion + partial unique + money CHECKs |
| `20261101200000_add_auth_rate_limits` | Additive `auth_rate_limits` for Postgres-backed login throttling |

## 8. Seed

```bash
npm run prisma:seed
# or
npx prisma db seed
```

Requires `DATABASE_URL`. Initial admin from `SEED_ADMIN_EMAIL` +
`SEED_ADMIN_PASSWORD` (Argon2id; min length 12). Existing admin password is
**never** overwritten on re-seed. Does not seed demo doctors or specialties.
Idempotent upserts. Never hardcodes passwords.

## 9. Commands

```bash
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate deploy    # production / CI
npx prisma migrate dev       # local interactive
npm run prisma:seed
```

## 10. Deviations from earlier proposal docs

- PK strategy: **cuid**, not UUID.
- Role enum name: **`Role`**, not `UserRole`.
- Appointment public id field: **`bookingReference`** (not `publicReference`).
- Doctor fee field: **`consultationFeePaise`** (not `appointmentFeePaise`).
- Appointment times: **`startsAt` / `endsAt`** (not `startsAtUtc` / `endsAtUtc`).
- Payment retains Razorpay-specific **`ORDER_CREATED`** and **`activeAppointmentId`**.
- Appointments keep denormalized patient snapshot columns **plus** `patientId`.
- Website section key field: **`key`** (not `sectionKey`).
- Media size field: **`bytes`** (not `fileSize`).
- Outbox retry timestamp: **`availableAt`** (not `nextRetryAt`); event field
  **`eventType`**.
- Email queued state: **`PENDING`** (covers “queued”); plus DELIVERED/BOUNCED.
- Exclusion uses **`tsrange`** (Prisma `TIMESTAMP(3)`), not `tstzrange`.

## 11. Open business decisions / limitations

- Production clinic timezone confirmation (default placeholder `Asia/Kolkata`).
- Unpaid reservation TTL and EXPIRED transition job.
- Default slot duration / buffers (migration backfill used 30 minutes only when `endsAt` was null).
- Whether pay-at-clinic is allowed without `PENDING_PAYMENT`.
- Patient PII retention / deletion policy.
- Whether webhook `payload` JSON should be dropped in favor of hash-only in production.
- Refund total-cap trigger vs application-only enforcement (currently app + docs).
- Live exclusion/partial-index tests require `DATABASE_URL`; skipped when unset.

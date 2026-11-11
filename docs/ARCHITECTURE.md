# Sharma Clinic --- Technical Architecture

## 1. Overview

Use a Next.js modular monolith. This is sufficient for the current scope
and keeps deployment, debugging, and transactions straightforward.

## 2. High-level modules

-   Public Website: landing page, clinic pages, doctor
    directory/details, services, articles.
-   Identity & Access: Auth.js staff credentials, session, role
    authorization.
-   Doctor Management: doctor profiles, specialties, status, fee
    configuration.
-   Availability: recurring weekly schedules and date exceptions.
-   Appointments: slot discovery, booking lifecycle,
    cancellations/rescheduling.
-   Payments: Razorpay order creation, verification, webhooks,
    reconciliation.
-   Content Management: landing page sections, navigation, contact
    settings, services, articles.
-   Notifications: Brevo transactional email templates and delivery.
-   Reporting: admin-wide and doctor-scoped aggregates.
-   Audit: sensitive administrative and payment actions.

## 3. Core domain boundaries

Keep each domain's validation, service logic, repository access, and
types together. Route handlers should be thin adapters: 1. Parse
request. 2. Validate input. 3. Authenticate and authorize. 4. Call a
domain service. 5. Return the standard response.

## 4. Authentication

-   Auth.js v5 Credentials provider for staff (JWT sessions; no Prisma
    Adapter / OAuth / patient accounts).
-   Passwords hashed with Argon2id (`@node-rs/argon2`); bcrypt hashes
    remain verifiable for migration.
-   Role values: ADMIN, DOCTOR. Session/JWT carry `id`, `role`, and
    `doctorId` (resolved from `Doctor.userId`, not a User column).
-   Initial admin via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
    in seed (idempotent; never overwrites an existing password).
-   Login rate limits are Postgres-backed (`AuthRateLimit`), not
    in-memory-only.
-   Next.js 16 uses `src/proxy.ts` for early `/admin` `/doctor` `/login`
    redirects; server layouts and `requireAdmin` / `requireDoctor`
    guards remain the authorization boundary.
-   No public signup endpoint. Secure cookies (`httpOnly`, `SameSite=Lax`,
    `Secure` in production); HTTPS public URL via `AUTH_URL` /
    `AUTH_TRUST_HOST` for Coolify reverse proxy.

## 5. Booking lifecycle

Suggested appointment statuses: - PENDING_PAYMENT - CONFIRMED -
CANCELLED - COMPLETED - NO_SHOW - EXPIRED

Suggested payment statuses: - CREATED - PENDING - PAID - FAILED -
REFUNDED - PARTIALLY_REFUNDED

Keep appointment and payment states separate. A booking may have
multiple payment attempts. Store the price snapshot on the
appointment/payment at booking time so later fee changes do not rewrite
history.

## 6. Availability and concurrency

-   Store weekly rules separately from date overrides.
-   Generate candidate slots server-side in the clinic timezone.
-   Check conflicts against active bookings.
-   Use a transaction and an appropriate database-level strategy to
    prevent two visitors reserving the same doctor/time concurrently.
-   Consider a unique/exclusion constraint or slot-reservation table for
    the chosen slot model.
-   Expire unpaid reservations according to a documented timeout policy.
-   Recheck availability when creating the reservation, not only when
    listing slots.

## 7. Payment flow

1.  Server calculates amount from current trusted fee configuration.
2.  Server creates appointment/reservation and Razorpay order using an
    idempotency strategy.
3.  Browser opens Razorpay checkout with public key and order details.
4.  Browser returns payment identifiers/signature to server.
5.  Server verifies signature.
6.  Verified webhook is independently processed idempotently.
7.  Payment and appointment states are reconciled in a transaction.
8.  Brevo confirmation email is sent after the defined successful state
    transition.

Never trust client-supplied amount or a frontend success callback.

## 8. Integrations

-   Razorpay adapter: order creation, signature verification, webhook
    verification, refunds/reconciliation if approved.
-   Cloudinary adapter: signed upload flow or server-side upload;
    validate file type, size, and ownership.
-   Brevo adapter: transactional templates and delivery; do not block a
    completed booking on email provider downtime.
-   Use retries and safe logging for transient provider failures.

## 9. Deployment

Primary target: **Hostinger VPS + Coolify** reverse proxy (HTTPS at the
proxy; Node may see HTTP internally). See **`docs/DEPLOYMENT.md`** for
env vars (`AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`, `DATABASE_URL`,
`NEXT_PUBLIC_APP_URL`), cookie notes, and safe
`prisma migrate deploy` steps.

-   Next.js application on Node 20.9+ (Coolify or equivalent).
-   Managed PostgreSQL with backups; connect only via `DATABASE_URL`.
-   Production secrets in Coolify env / secret store — never
    `NEXT_PUBLIC_` for secrets; do not require `VERCEL_URL`.
-   Auth.js: `AUTH_TRUST_HOST=true` + public `AUTH_URL` behind the proxy.
-   Separate development/staging/production provider credentials.
-   Configure webhook URLs and verify provider signatures.
-   Run migrations as a controlled deployment step
    (`npm run prisma:migrate:deploy` only — never reset).
-   Add monitoring for application errors, webhook failures, and
    booking/payment reconciliation.

## 10. Persistence decisions (implemented)

-   Single PostgreSQL database; Prisma 7 with `prisma.config.ts` and
    `@prisma/adapter-pg` (see `docs/DATABASE.md`).
-   Overlapping active appointments blocked with a PostgreSQL
    `EXCLUDE USING gist` constraint on `(doctorId, tsrange(startsAt, endsAt))`
    for statuses `PENDING_PAYMENT` and `CONFIRMED`.
-   One active payment attempt per appointment enforced via
    `Payment.activeAppointmentId` uniqueness (plus partial unique index).
-   Payment/refund `amountPaise > 0` CHECKs; refund total cap remains
    application-transactional (`REFUND_CAP_POLICY`).
-   Durable `NotificationOutbox` / `EmailLog` tables exist; workers/schedulers
    are not part of the initial persistence delivery. Outbox dedupe uses a
    unique `idempotencyKey`.
-   Staff password hashing uses Argon2id (seed + Auth.js). Login rate
    limits use the additive `auth_rate_limits` table.
-   Full domain models (specialties, patients, availability, CMS, blog, media,
    clinic settings, audit before/after) live in one schema — see
    `docs/DATABASE.md`.

## 11. Architecture decisions requiring confirmation

-   Clinic timezone and business hours.
-   Slot reservation expiry duration.
-   Payment-before-confirmation versus pay-at-clinic.
-   Whether one doctor can have multiple locations/branches.
-   Whether appointment rescheduling is self-service or
    admin/doctor-only.

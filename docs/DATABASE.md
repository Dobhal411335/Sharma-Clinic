# Sharma Clinic --- Database Design (Proposed)

PostgreSQL is recommended because appointments, doctors, availability,
users, and payments are relational and require transactional
consistency. Prisma is the ORM.

This is a logical schema plan; implement the final Prisma schema only
after confirming unresolved business rules.

## 1. Core entities

### User

Staff identity and authentication. - id (UUID) - name - email (unique,
normalized) - passwordHash - role (ADMIN \| DOCTOR) - doctorId (nullable
unique relation for doctor users, depending on chosen modeling) -
isActive - lastLoginAt - createdAt, updatedAt

Do not create customer login users in the initial release.

### Doctor

Public profile and doctor-specific configuration. - id - slug (unique) -
displayName - specialty - biography - qualifications - experienceYears
(nullable; only if verified) - profileImageAssetId (nullable) -
appointmentFeePaise - isActive - createdAt, updatedAt

Keep authentication identity in User and professional/public profile in
Doctor.

### Patient

Minimal contact details captured for bookings; no login. - id -
fullName - phone - email (nullable) - createdAt, updatedAt

Consider privacy and retention requirements before adding further
fields.

### WeeklyAvailability

Recurring schedule. - id - doctorId - weekday (defined enum or 0--6
convention) - startTimeLocal - endTimeLocal - slotDurationMinutes -
optional breakStartLocal / breakEndLocal - effectiveFrom /
effectiveUntil (optional) - createdAt, updatedAt

### AvailabilityException

Date-specific leave or override. - id - doctorId - date - type
(UNAVAILABLE \| EXTRA_HOURS \| OVERRIDE) - startTimeLocal / endTimeLocal
(nullable for full-day leave) - reason (private, optional) - createdAt,
updatedAt

### Appointment

-   id
-   publicReference (unique, non-sequential)
-   doctorId
-   patientId
-   startsAtUtc
-   endsAtUtc
-   status
-   feeSnapshotPaise
-   currency (INR)
-   reason (optional, access-restricted)
-   createdAt, updatedAt
-   cancelledAt (nullable)

The fee snapshot preserves the price agreed at booking time.

### Payment

One appointment may have multiple payment attempts. - id -
appointmentId - provider (RAZORPAY) - providerOrderId (unique where
present) - providerPaymentId (unique where present) - amountPaise -
currency - status - signatureVerifiedAt (nullable) - paidAt (nullable) -
refundedAmountPaise (default 0) - createdAt, updatedAt

### PaymentWebhookEvent

-   id
-   providerEventId (unique)
-   eventType
-   payloadHash or safely retained minimal payload
-   processingStatus
-   receivedAt
-   processedAt (nullable)
-   failureReason (sanitized, nullable)

Avoid retaining unnecessary sensitive webhook payload data.

### WebsiteSection

-   id
-   key (unique)
-   title/content fields or structured JSON validated by a schema
-   imageAssetId (nullable)
-   sortOrder
-   isPublished
-   updatedAt

Prefer typed fields or versioned validated JSON over arbitrary
unvalidated JSON.

### Service

-   id
-   slug (unique)
-   name
-   description
-   imageAssetId (nullable)
-   isPublished
-   sortOrder

### BlogPost (optional)

-   id
-   slug (unique)
-   title
-   excerpt
-   body
-   coverImageAssetId
-   status (DRAFT \| PUBLISHED)
-   publishedAt
-   authorUserId

Only include if blog management is approved for the initial scope.

### MediaAsset

-   id
-   provider (CLOUDINARY)
-   publicId
-   secureUrl
-   resourceType
-   altText
-   createdAt

### AuditLog

-   id
-   actorUserId (nullable for system/webhook)
-   action
-   entityType
-   entityId
-   metadata (sanitized)
-   createdAt

## 2. Relationships

-   Doctor has one or more weekly availability rules.
-   Doctor has zero or more availability exceptions.
-   Doctor has many appointments.
-   Patient has many appointments.
-   Appointment has one or more payment attempts.
-   User with DOCTOR role maps to exactly one Doctor profile.
-   Admin user does not require a Doctor profile.

## 3. Constraints and indexes

-   Unique normalized User.email.
-   Unique Doctor.slug.
-   Unique Appointment.publicReference.
-   Unique provider order/payment IDs when non-null.
-   Unique PaymentWebhookEvent.providerEventId.
-   Index appointments by `(doctorId, startsAtUtc)`,
    `(status, startsAtUtc)`, and `patientId`.
-   Index payments by `(status, createdAt)` and appointmentId.
-   Index availability by doctorId and weekday/date.
-   Add a database-level mechanism to prevent overlapping active
    appointments for the same doctor/time. Choose the exact
    constraint/reservation model after deciding slot granularity and
    PostgreSQL extension/constraint strategy.
-   Use transactions for booking reservation and payment state
    transitions.

## 4. Money and time

-   Store INR in integer paise (e.g. ₹750 = 75000 paise).
-   Never use float/double for currency.
-   Persist timestamps in UTC.
-   Store recurring wall-clock availability as local time plus the
    clinic timezone setting.
-   Convert generated appointment slots to UTC before persistence.

## 5. Data lifecycle

-   Prefer deactivation/soft deletion for doctors and services
    referenced by history.
-   Never delete payment ledger records to correct a mistake; create
    refund/adjustment records or audited corrections.
-   Define retention and deletion policy for patient contact details
    before production.
-   Keep audit logs for admin changes to prices, doctor access,
    appointment status, and content publication.

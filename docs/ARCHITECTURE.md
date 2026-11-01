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

-   Auth.js Credentials provider for staff.
-   Store password hashes only.
-   Role values: ADMIN, DOCTOR.
-   No public signup endpoint.
-   Admin user is provisioned securely outside public registration.
-   Admin provisions doctor accounts.
-   Use secure, HTTP-only, same-site cookies and production HTTPS.
-   Validate role and active status on the server for every protected
    request.
-   Decide JWT versus database sessions based on the final Auth.js
    adapter/session design; do not assume middleware is the
    authorization boundary.

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

-   Next.js application on a supported Node hosting platform.
-   Managed PostgreSQL with backups.
-   Production secrets in hosting secret manager.
-   Separate development/staging/production provider credentials.
-   Configure webhook URLs and verify provider signatures.
-   Run migrations as a controlled deployment step.
-   Add monitoring for application errors, webhook failures, and
    booking/payment reconciliation.

## 10. Architecture decisions requiring confirmation

-   Clinic timezone and business hours.
-   Slot reservation expiry duration.
-   Payment-before-confirmation versus pay-at-clinic.
-   Whether one doctor can have multiple locations/branches.
-   Whether appointment rescheduling is self-service or
    admin/doctor-only.

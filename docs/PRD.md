# Sharma Clinic Website --- Product Requirements Document

## 1. Product summary

Sharma Clinic is a public clinic website and staff operations portal.
Visitors can explore clinic information and doctors, book an
appointment, and pay online. Staff access the system through a shared
login and receive role-specific dashboards.

The initial release does not provide customer accounts.

## 2. Goals

-   Present clinic information and doctors professionally.
-   Allow visitors to book appointments with a selected doctor.
-   Let doctors define recurring weekly availability and manage their
    own appointments.
-   Let administrators manage website content, doctors, pricing,
    appointments, and payment reporting.
-   Maintain accurate, auditable appointment and payment records.

## 3. User roles

### Public visitor / patient

-   Browse landing page, clinic information, services, doctors, doctor
    profiles, and articles if enabled.
-   Select a doctor and an available slot.
-   Submit contact details and appointment reason/notes if required.
-   Pay the displayed fee through Razorpay.
-   Receive booking/payment confirmation through the configured
    communication channel.
-   No account creation or login in the initial release.

### Admin

-   Sign in through staff login.
-   Manage public website content and settings.
-   Create, edit, deactivate doctors and provision their staff accounts.
-   Set or override doctor appointment fees.
-   View and manage all appointments.
-   View payment reports across doctors.
-   Review payment states and permitted refund/reconciliation
    information.
-   View clinic-level dashboard metrics.

### Doctor

-   Sign in through staff login.
-   View own dashboard and appointments.
-   Configure weekly recurring availability and date-specific
    exceptions/leave.
-   View own appointment and payment summaries.
-   Update permitted profile information if enabled by admin.
-   Cannot access another doctor's records or clinic-wide admin
    settings.

## 4. Public website requirements

-   Landing page with configurable hero, clinic introduction, services,
    featured doctors, calls to action, and footer.
-   Doctor directory with specialty/category filtering.
-   Doctor detail page with profile, specialty,
    qualifications/experience (admin-managed), fee, and booking CTA.
-   Service pages/sections managed by admin.
-   Optional blog/articles section, enabled only if content operations
    are in scope.
-   Responsive layout, accessible components, SEO metadata, and
    optimized images.

## 5. Appointment and payment requirements

-   Visitor selects doctor, date, and available time.
-   System validates availability on the server.
-   Visitor enters required patient/contact details.
-   System creates a pending booking/payment attempt with a
    server-calculated amount.
-   Razorpay order is created server-side.
-   Payment is confirmed only after signature verification and/or
    verified webhook reconciliation.
-   Appointment state and payment state are tracked separately.
-   Confirmation communication is sent after the defined confirmation
    condition is met.
-   Duplicate webhook events and repeated callbacks must not create
    duplicate payments or appointments.

## 6. Doctor availability requirements

-   Weekly recurring rules: weekday, start time, end time, slot
    duration, and optional breaks.
-   Date-specific overrides: unavailable/leave or additional
    availability.
-   Clinic timezone is configurable; initial default must be confirmed
    before production.
-   Existing booked appointments remain visible if future availability
    is changed.
-   Prevent overlapping availability rules and overlapping confirmed
    appointments.

## 7. Dashboards and reports

### Admin dashboard

-   Appointment counts by status and date range.
-   Payment totals by payment state and date range.
-   Revenue grouped by doctor.
-   Recent appointments and payment activity.
-   Doctor management and content management entry points.

### Doctor dashboard

-   Today's and upcoming appointments.
-   Appointment counts by date range and status.
-   Own collected payment totals, clearly distinguishing gross
    collections, refunds, and net amounts.
-   Weekly availability summary.

Reports must be calculated from persisted records, not hard-coded or
browser-derived values.

## 8. Non-functional requirements

-   Strict TypeScript and server-side validation.
-   Role-based authorization enforced on every protected operation.
-   Transaction-safe booking and payment state transitions.
-   Auditability for admin changes and payment events.
-   Responsive and accessible UI.
-   SEO-friendly public pages.
-   Secure handling of patient contact data.
-   Error, loading, empty, and retry states.
-   Automated tests for permissions, booking conflicts, and payment
    verification.

## 9. Out of scope for initial release

-   Patient accounts and patient portal.
-   Telemedicine/video consultation.
-   Prescriptions, diagnosis, medical records, and clinical workflows.
-   Insurance claims.
-   Multi-branch support unless confirmed.
-   Native mobile applications.
-   Automated refunds unless explicitly approved.

## 10. Open decisions to confirm

-   Clinic address, phone, email, timezone, and branding assets.
-   Doctor fields and verified credentials.
-   Appointment slot duration and buffer rules.
-   Whether payment is mandatory for confirmation or cash/pay-at-clinic
    is supported.
-   Cancellation, rescheduling, refund, and no-show policies.
-   Whether doctors can edit their own profiles.
-   Whether admin can manually create bookings.
-   Whether blog management is required for launch.
-   Tax/invoice requirements and accounting definitions for revenue
    reports.

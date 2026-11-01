# Sharma Clinic --- API Contract (Proposed)

This is a proposed contract, not an implemented API. Final route names
may be adjusted while preserving semantics and authorization.

## 1. Conventions

-   Base path: `/api`
-   JSON request/response unless a provider requires another content
    type.
-   Validate all request bodies, query parameters, and path parameters
    server-side.
-   Use ISO-8601 timestamps with timezone offsets in API payloads;
    persist UTC.
-   Currency amounts are integer paise with currency code,
    e.g. `{ "amount": 75000, "currency": "INR" }`.
-   Never accept a trusted amount, role, payment status, or doctor
    ownership from the client.
-   Paginate list endpoints.
-   Return no stack traces or secrets.

## 2. Standard response shape

Success:

``` json
{
  "data": {},
  "meta": {}
}
```

Error:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be processed.",
    "details": []
  }
}
```

Suggested HTTP codes: 200 success, 201 created, 400 invalid input, 401
unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422
business-rule failure, 429 rate limited, 500 unexpected server error.

## 3. Public endpoints

### GET `/api/public/doctors`

List active doctors and public profile fields. Supports specialty and
pagination filters.

### GET `/api/public/doctors/:slug`

Return one active doctor's public profile and public fee information.

### GET `/api/public/availability`

Query: `doctorId`, `from`, `to`. Return available slots generated
server-side. Do not expose private schedule notes.

### POST `/api/public/appointments`

Create a pending appointment/reservation and payment order. Example
request:

``` json
{
  "doctorId": "doctor-id",
  "startsAt": "2026-11-10T10:30:00+05:30",
  "patient": {
    "name": "Example Patient",
    "phone": "+91XXXXXXXXXX",
    "email": "patient@example.com"
  },
  "reason": "Optional short reason"
}
```

The server resolves the doctor fee and slot validity. The response
contains appointment ID, payment order ID, amount, currency, and public
checkout configuration only. Do not return secrets.

### POST `/api/public/payments/verify`

Accept the provider payment/order identifiers and signature required for
server-side verification. Verify with Razorpay server-side. Do not
accept a `paid: true` flag.

## 4. Auth endpoint

Auth.js owns its authentication routes under `/api/auth/**`. No public
registration endpoint.

## 5. Admin endpoints --- ADMIN only

-   `GET /api/admin/overview?from=&to=` --- clinic-level dashboard
    metrics.
-   `GET|POST /api/admin/doctors` --- list/create doctors.
-   `GET|PATCH|DELETE /api/admin/doctors/:id` --- read/update/deactivate
    doctor.
-   `GET /api/admin/appointments` --- all appointments with filters.
-   `PATCH /api/admin/appointments/:id` --- permitted
    status/administrative action.
-   `GET /api/admin/payments` --- payment ledger/report with filters.
-   `GET|POST /api/admin/content/sections` --- manage landing page
    sections.
-   `PATCH /api/admin/content/sections/:id` --- update section.
-   `GET|POST /api/admin/services` --- manage services.
-   `GET|POST /api/admin/users/doctors` --- provision/deactivate doctor
    login.
-   `GET|PATCH /api/admin/settings` --- clinic-wide settings and pricing
    rules.

Destructive actions should generally be soft-deactivation or audited
changes, not hard deletes.

## 6. Doctor endpoints --- DOCTOR only

-   `GET /api/doctor/me` --- own doctor profile.
-   `GET /api/doctor/overview?from=&to=` --- own dashboard metrics.
-   `GET /api/doctor/appointments` --- own appointments only.
-   `GET|POST /api/doctor/availability/weekly` --- read/create weekly
    rules.
-   `PATCH|DELETE /api/doctor/availability/weekly/:id` --- update/delete
    own rule.
-   `GET|POST /api/doctor/availability/exceptions` --- read/create date
    exceptions.
-   `PATCH|DELETE /api/doctor/availability/exceptions/:id` ---
    update/delete own exception.
-   `PATCH /api/doctor/profile` --- only explicitly permitted profile
    fields.

The server derives doctor identity from the authenticated session. Do
not accept a doctor ID as proof of ownership.

## 7. Webhooks

### POST `/api/webhooks/razorpay`

-   Verify the webhook signature using the raw request body and
    configured webhook secret.
-   Persist event ID and enforce uniqueness/idempotency.
-   Handle duplicate and out-of-order events safely.
-   Reconcile payment and appointment states in a transaction.
-   Return success only after durable event handling or safe enqueueing.
-   Never trust unsigned webhook payloads.

## 8. Authorization matrix

  Resource/action                         Public     Doctor   Admin
  --------------------------------- ------------ ---------- -------
  Browse public doctors/services             Yes        Yes     Yes
  Create public booking                      Yes        Yes     Yes
  Read own appointments               No account   Own only     All
  Edit own availability                       No        Yes     Yes
  Read clinic-wide payments                   No         No     Yes
  Read own payment summary                    No   Own only     Yes
  Manage doctors/content/settings             No         No     Yes

## 9. Operational requirements

-   Rate-limit public booking and authentication endpoints.
-   Add request correlation IDs.
-   Avoid logging patient contact data or payment secrets.
-   Use idempotency keys for booking/order creation where appropriate.
-   Document webhook retry and reconciliation behavior.

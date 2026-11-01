# Sharma Clinic --- Project Documentation

This folder contains the product and engineering baseline to review
before implementation.

## Documents

-   `PRD.md` --- product scope, roles, features, non-functional
    requirements, and open decisions.
-   `ARCHITECTURE.md` --- modular monolith architecture, modules,
    request flows, booking/payment lifecycle.
-   `DESIGN.md` --- visual direction based on the supplied three-page
    reference PDF.
-   `API-CONTRACT.md` --- proposed endpoints, response shapes,
    authorization, and webhook rules.
-   `DATABASE.md` --- proposed relational model, relationships, indexes,
    and constraints.
-   `DO-DONT.md` --- implementation guardrails.

## Cursor rules

The `.cursor/rules/` directory contains persistent project
instructions: - `00-project-context.mdc` - `01-architecture.mdc` -
`02-design-system.mdc` - `03-security-and-do-not.mdc`

Cursor project rules use `.mdc` files. Keep them concise and
authoritative; detailed product documentation belongs in `docs/`.

## Before coding

Resolve the open decisions in `PRD.md` and `ARCHITECTURE.md`,
especially: 1. Clinic timezone and contact details. 2. Appointment
duration, buffer, and availability rules. 3. Payment-before-confirmation
versus pay-at-clinic. 4. Cancellation, rescheduling, refund, and unpaid
reservation expiry. 5. Doctor profile editing permissions. 6. Whether
blog management is in the first release.

Do not treat proposed API/database designs as final until these
decisions are confirmed.

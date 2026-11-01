# Sharma Clinic --- Do / Don't Checklist

## Do

-   Do keep one Next.js application with public, admin, and doctor
    areas.
-   Do use TypeScript strict mode and shared domain types.
-   Do use PostgreSQL and Prisma for relational data and transactions.
-   Do use Auth.js for staff credentials, with ADMIN and DOCTOR roles.
-   Do enforce access checks on the server for every protected action.
-   Do derive doctor ownership from the authenticated session.
-   Do store doctor fee snapshots on appointments.
-   Do store monetary amounts as integer paise.
-   Do verify Razorpay signatures and webhooks server-side.
-   Do make payment webhook processing idempotent.
-   Do prevent concurrent double booking at the database/service layer.
-   Do keep payment and appointment statuses separate.
-   Do keep integrations behind server-side adapters.
-   Do use Cloudinary for approved media and Brevo for transactional
    email after integration is requested.
-   Do build accessible, responsive components using shadcn/ui and
    Lucide React.
-   Do show empty/loading/error states and audit important changes.
-   Do test permissions, booking conflicts, and payment transitions.

## Don't

-   Don't create customer accounts in the initial version.
-   Don't add public staff signup.
-   Don't rely on middleware or frontend hiding as the only security.
-   Don't trust amount, role, doctor ownership, availability, or payment
    state from the browser.
-   Don't confirm a booking based only on the Razorpay checkout
    callback.
-   Don't allow two active appointments to occupy the same doctor slot.
-   Don't overwrite historical fees when prices change.
-   Don't store card data or payment credentials.
-   Don't expose patient details in public pages, logs, or URLs.
-   Don't let a doctor query another doctor's appointments by changing
    an ID.
-   Don't put provider SDK calls in React components.
-   Don't add microservices or unnecessary infrastructure.
-   Don't invent clinic details, doctor credentials, testimonials,
    medical claims, or fees.
-   Don't ship with placeholder secrets or test payment credentials.

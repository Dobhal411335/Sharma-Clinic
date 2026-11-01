# Logger integration notes

## Wired

| Area | What |
| --- | --- |
| `src/app/api/upload/route.ts` | `withRequestLogging`, safe Cloudinary error logging, `x-request-id` |
| `src/app/api/payments/*` | `withRequestLogging` on create-order, verify, refund, status |
| `src/app/api/webhooks/razorpay/route.ts` | `withRequestLogging` |
| `src/lib/razorpay/utils/http.ts` | `logExternalServiceError` in route error handler; requestId on JSON errors |
| `src/lib/razorpay/services/create-order.ts` | order create/reuse INFO; `logPerformance` + external errors on SDK create |
| `src/lib/razorpay/services/verify-payment.ts` | verify INFO/WARN; `payment.verified` audit; no signatures logged |
| `src/lib/razorpay/webhooks/process-webhook.ts` | duplicate/process INFO; amount-mismatch WARN; process failures |
| `src/lib/razorpay/services/refund-payment.ts` | refund INFO; `logPerformance` + external errors on provider refund |
| `src/lib/razorpay/services/capture-payment.ts` | capture INFO; `logPerformance` + external errors on SDK capture |
| `src/lib/razorpay/services/reconcile-payment.ts` | changed/needsReconciliation INFO; amount-mismatch WARN |
| `src/lib/razorpay/services/fetch-payment.ts` | `logPerformance` + external errors on SDK fetch |
| `src/lib/razorpay/services/mark-paid.ts` | `logAuditEvent` on newly paid; duplicate-success WARN |
| `src/app/api/payments/refund/route.ts` | `logAuditEvent` after admin refund |
| `src/lib/cloudinary/cloudinary-client.ts` | external timing + error markers |
| `src/lib/brevo/services/send-email.ts` | send outcome + external error logging |
| `src/lib/auth/config.ts` | Auth.js events/logger (no credentials) |

## Safety

Never log signatures, key secrets, webhook secrets, card data, or patient PII.
Prefer ids only: `paymentId`, `appointmentId`, `orderId`, `eventId`, statuses, amounts in paise.

## Audit authorization

`AuditLog` is append-only. There is **no** public/admin audit read API in this package.
Any future reader must enforce **ADMIN-only** access; doctors must not read admin audits.

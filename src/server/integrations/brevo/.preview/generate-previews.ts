/**
 * Offline HTML previews — does NOT call Brevo / send real emails.
 * Run from repo root:
 *   npx tsx src/server/integrations/brevo/.preview/generate-previews.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { renderBookingReceivedEmail } from "../templates/appointment/booking-received";
import { renderAppointmentConfirmedEmail } from "../templates/appointment/appointment-confirmed";
import { renderAppointmentReminderEmail } from "../templates/appointment/appointment-reminder";
import { renderPaymentReceiptEmail } from "../templates/appointment/payment-receipt";
import { renderDoctorInvitationEmail } from "../templates/auth/doctor-invitation";
import { BrevoError } from "../types";
import { assertValidEmail, isValidEmail } from "../utils/email-validation";

process.env.CLINIC_NAME ||= "Sharma Clinic";
process.env.CLINIC_TIMEZONE ||= "Asia/Kolkata";
process.env.NEXT_PUBLIC_APP_URL ||= "https://sharma-clinic.example";
process.env.BREVO_SENDER_EMAIL ||= "noreply@example.com";
process.env.BREVO_SENDER_NAME ||= "Sharma Clinic";
// Sample company logo URL for offline preview when CMS DB is unavailable.
process.env.BREVO_LOGO_URL ||=
  "https://res.cloudinary.com/demo/image/upload/w_180,h_48,c_fit/sample.jpg";

async function main(): Promise<void> {
  const outDir = dirname(fileURLToPath(import.meta.url));

  const slot = {
    startsAtLabel: "15 Nov 2026, 10:30 AM",
    endsAtLabel: "15 Nov 2026, 10:45 AM",
    timezoneLabel: "Asia/Kolkata",
  };

  const bookingReceived = await renderBookingReceivedEmail({
    patientName: "Priya Sharma",
    patientEmail: "priya@example.com",
    doctorName: "Dr. A. Verma",
    bookingReference: "BK-10042",
    appointment: slot,
    bookingStatus: "Awaiting payment",
    paymentStatus: "Pending",
    nextSteps: "Complete payment to confirm your appointment slot.",
  });

  const confirmed = await renderAppointmentConfirmedEmail({
    patientName: "Priya Sharma",
    patientEmail: "priya@example.com",
    doctorName: "Dr. A. Verma",
    bookingReference: "BK-10042",
    appointment: slot,
    locationLabel: "Consultation Room 2",
    paymentInfo: "Paid online — ₹750.00",
    manageUrl: "https://sharma-clinic.example/book-appointment",
  });

  const receipt = await renderPaymentReceiptEmail({
    patientName: "Priya Sharma",
    patientEmail: "priya@example.com",
    doctorName: "Dr. A. Verma",
    bookingReference: "BK-10042",
    paymentReference: "pay_ABC123",
    amount: { amountPaise: 75000 },
    paidAtLabel: "1 Nov 2026, 1:05 PM IST",
    paymentStatus: "Paid",
    appointment: slot,
    receiptUrl: "https://sharma-clinic.example/receipts/pay_ABC123",
  });

  const reminder = await renderAppointmentReminderEmail({
    patientName: "Priya Sharma",
    patientEmail: "priya@example.com",
    doctorName: "Dr. A. Verma",
    bookingReference: "BK-10042",
    appointment: slot,
    locationLabel: "Consultation Room 2",
    manageUrl: "https://sharma-clinic.example/book-appointment",
  });

  const invitation = await renderDoctorInvitationEmail({
    inviteeName: "Dr. R. Khan",
    inviteeEmail: "rkhan@example.com",
    invitationUrl: "https://sharma-clinic.example/invite/opaque-token-value",
    invitedByName: "Clinic Admin",
    expiresAtLabel: "8 Nov 2026, 6:00 PM IST",
  });

  const samples = [
    ["booking-received.html", bookingReceived.html],
    ["booking-received.txt", bookingReceived.text],
    ["appointment-confirmed.html", confirmed.html],
    ["appointment-confirmed.txt", confirmed.text],
    ["payment-receipt.html", receipt.html],
    ["payment-receipt.txt", receipt.text],
    ["appointment-reminder.html", reminder.html],
    ["appointment-reminder.txt", reminder.text],
    ["doctor-invitation.html", invitation.html],
    ["doctor-invitation.txt", invitation.text],
  ] as const;

  mkdirSync(outDir, { recursive: true });
  for (const [name, content] of samples) {
    writeFileSync(join(outDir, name), content, "utf8");
  }

  function assertLayout(html: string, label: string): void {
    if (!html.includes("Patient care notifications")) {
      throw new Error(`${label}: missing shared header`);
    }
    if (!html.includes("All rights reserved")) {
      throw new Error(`${label}: missing shared footer`);
    }
    if (!html.includes('<table role="presentation"')) {
      throw new Error(`${label}: missing table layout`);
    }
    if (!html.includes("<img ") && !html.includes(">SC</div>")) {
      throw new Error(`${label}: missing logo or fallback mark`);
    }
  }

  assertLayout(bookingReceived.html, "booking-received");
  assertLayout(confirmed.html, "confirmed");
  assertLayout(receipt.html, "receipt");
  assertLayout(reminder.html, "reminder");
  assertLayout(invitation.html, "invitation");

  if (isValidEmail("not-an-email")) {
    throw new Error("invalid email was accepted");
  }
  if (!isValidEmail("ok@example.com")) {
    throw new Error("valid email was rejected");
  }

  let invalidCaught = false;
  try {
    assertValidEmail("bad@@");
  } catch (error) {
    invalidCaught =
      error instanceof BrevoError && error.code === "INVALID_EMAIL";
  }
  if (!invalidCaught) {
    throw new Error("assertValidEmail did not reject invalid address");
  }

  console.log(`Wrote ${samples.length} preview files to ${outDir}`);
  console.log("Validation checks passed (layout, email format, logo).");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

# Sharma Clinic --- Design Direction

## Reference

The supplied three-page PDF is a visual reference: - Page 1: top
announcement strip, blue navigation, prominent healthcare hero, feature
panels. - Page 2: doctor directory/cards with specialty filters,
services, and editorial content. - Page 3: health blog/article
presentation and multi-column footer.

Use the composition and visual hierarchy as inspiration. Do not copy
unrelated ecommerce elements or placeholder text from the reference.

## Public experience

### Landing page

1.  Slim announcement/contact strip only if clinic supplies the message.
2.  Main navigation with clinic logo, Home, About, Doctors, Services,
    Contact, and Book Appointment.
3.  Hero with a concise clinic value proposition and primary appointment
    CTA.
4.  Clinic introduction and key trust information.
5.  Featured doctors.
6.  Services/specialties.
7.  Patient information / process section.
8.  Optional articles.
9.  Contact details and footer.

### Doctors directory

-   Clear page title and short introduction.
-   Specialty filters only for specialties actually configured.
-   Responsive doctor cards with approved image, name, specialty,
    verified credentials summary, fee if public, and appointment CTA.
-   Doctor detail pages should have a clear booking path.

### Appointment flow

-   Step-based, low-friction layout.
-   Show selected doctor, date, slot, fee, and patient details.
-   Review screen before payment.
-   Distinguish pending, successful, failed, and cancelled payment
    states.
-   Never imply a booking is confirmed before the backend confirms it.

## Staff experience

### Shared login

-   One `/login` page for staff.
-   No customer login or public registration links.
-   On success, route ADMIN to admin dashboard and DOCTOR to doctor
    dashboard.
-   Show generic credential errors that do not reveal whether an email
    exists.

### Admin dashboard

-   Desktop sidebar, compact mobile navigation.
-   Overview metrics, appointment activity, payment summary, doctor
    management, content management, and settings.
-   Global filters for date range and doctor where appropriate.

### Doctor dashboard

-   Doctor-scoped overview.
-   Today's/upcoming appointments.
-   Weekly availability editor and date exceptions.
-   Personal payment/appointment summaries only.

## Design tokens

Start with semantic CSS variables through shadcn/ui: - Primary: clinic
blue. - Accent: restrained teal. - Background: white and light
neutral. - Foreground: deep navy/charcoal. - Destructive: accessible
red. Do not hard-code unrelated colors in individual components; use
tokens.

## Content and assets

-   Do not invent doctor photos, credentials, clinic statistics, patient
    reviews, awards, or medical claims.
-   Use approved clinic assets or neutral placeholders clearly marked
    for replacement.
-   Compress and optimize images; use Cloudinary once configured.
-   All images need useful alt text unless decorative.

## Quality bar

-   Mobile-first, accessible, fast, calm, and credible.
-   Strong visual hierarchy without excessive animation.
-   Consistent spacing, typography, radii, button styles, and form
    states.
-   Every interactive component has hover, focus, disabled, loading, and
    error states where relevant.

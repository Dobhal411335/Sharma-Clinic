# Drop an admin page into this project

The admin shell, sidebar, and sign-in stay as they are. Each sidebar item already has a URL. A page from the other project replaces the placeholder when you add a `page.tsx` on that same URL.

## Routes

Copy the path from `src/components/admin/sidebar.ts`. The path is the `href` value.

| Sidebar item | File to add |
| --- | --- |
| Company Basic Info | `src/app/admin/company/page.tsx` |
| Gallery Section | `src/app/admin/gallery/page.tsx` |
| Manage Navbar | `src/app/admin/navbar/page.tsx` |
| Social Media Post | `src/app/admin/social-posts/page.tsx` |
| Create Webpages | `src/app/admin/webpages/page.tsx` |
| Manage Footer | `src/app/admin/footer/page.tsx` |
| Pop Up Banner | `src/app/admin/banners/popup/page.tsx` |
| Top Advertisement Banner | `src/app/admin/banners/top-advertisement/page.tsx` |
| About Us Banner | `src/app/admin/banners/about-us/page.tsx` |
| Promo & Collection Banners | `src/app/admin/banners/promo-collection/page.tsx` |
| Hero Banner | `src/app/admin/banners/hero/page.tsx` |
| Clinical Confidence Banner | `src/app/admin/banners/clinical-confidence/page.tsx` |
| Website FAQ Section | `src/app/admin/faq/page.tsx` |
| Manage Blog | `src/app/admin/blog/page.tsx` |
| Approve/Reject Reviews | `src/app/admin/reviews/page.tsx` |
| Create Doctor Profile | `src/app/admin/doctors/create/page.tsx` |
| Manage Doctor Login | `src/app/admin/doctors/logins/page.tsx` |
| Manage Doctor Profile Page | `src/app/admin/doctors/profiles/page.tsx` |
| Create Time Day Schedule Or Appointment | `src/app/admin/doctors/schedule/page.tsx` |
| Service We Provide | `src/app/admin/doctors/services/page.tsx` |
| Gateway Report / Success | `src/app/admin/reports/gateway/success/page.tsx` |
| Gateway Report / Failure | `src/app/admin/reports/gateway/failure/page.tsx` |
| Gateway Report / Booked | `src/app/admin/reports/gateway/booked/page.tsx` |
| Revenue Management Dashboard | `src/app/admin/reports/revenue/page.tsx` |
| Day Appointment Report / Confirm | `src/app/admin/reports/day/confirm/page.tsx` |
| Day Appointment Report / Post For Next Day | `src/app/admin/reports/day/next-day/page.tsx` |

`/admin/dashboard` is already built. Do not replace it unless you mean to.

## Steps

1. In the other project, copy the page component and the pieces it imports (forms, tables, local helpers). Do not copy that project's sidebar, login page, or root layout.
2. Put the copied UI in `src/components/admin/pages/<name>/`.
3. Add `src/app/admin/<the href path>/page.tsx` with a default export. Keep that file thin:

```tsx
import { CompanyBasicInfoPage } from "@/components/admin/pages/company/company-basic-info-page";

export default function Page() {
  return <CompanyBasicInfoPage />;
}
```

4. If the copied file starts with `"use client"`, leave it as a client component and import it from the server `page.tsx` above.
5. Change imports to this project's `@/` paths. Use the shadcn components in `src/components/ui` when the other page used the same primitives.
6. Leave clinic names, fees, addresses, and medical copy as placeholders until they are confirmed. Do not invent them.
7. Sign in as an admin and open the same `/admin/...` path. The navy sidebar stays. Only the inner page changes. A specific `page.tsx` replaces the placeholder automatically.

Until that file exists, the catch-all at `src/app/admin/[...slug]/page.tsx` shows "This screen is ready for a page from the other project."

# Sharma Clinic — Deployment (Hostinger VPS + Coolify)

Target: **Node.js on a Hostinger VPS** with **Coolify** as reverse proxy /
TLS terminator. This is **not** a Vercel-specific guide. Do not require
`VERCEL_URL` or other Vercel-only env vars.

## 1. Required environment variables (Coolify)

Set these in the Coolify service environment (secrets marked ★):

| Variable | Example / notes |
| --- | --- |
| `DATABASE_URL` ★ | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `AUTH_SECRET` ★ | `npx auth secret` or `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-domain` (public HTTPS origin, no trailing slash) |
| `AUTH_TRUST_HOST` | `true` (see below) |
| `NEXT_PUBLIC_APP_URL` | Same public HTTPS origin as `AUTH_URL` |
| `SEED_ADMIN_EMAIL` ★ | Used once by seed |
| `SEED_ADMIN_PASSWORD` ★ | Used once by seed; never logged |
| `SEED_ADMIN_NAME` | Display name for first admin |
| `NODE_ENV` | `production` (Coolify usually sets this) |

Also configure provider keys as needed: Razorpay, Cloudinary, Brevo.
Clinic phone/address/email come from admin Company Basic Info, not env.
See `.env.example`.

**Never** put secrets in `NEXT_PUBLIC_*` names except intentionally public
values (`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`).

## 2. Why `AUTH_TRUST_HOST=true`

Coolify (Traefik/Caddy) terminates TLS at the proxy. The Next.js container
often receives **HTTP** on an internal port while browsers use **HTTPS** on
your domain.

Auth.js builds CSRF and callback URLs from the request host / protocol.
Without trusting the proxy:

- Login CSRF / callback URL mismatches
- Cookies marked `Secure` may not round-trip correctly
- Redirects may point at `http://internal-host:3000`

Set:

```text
AUTH_URL=https://your-domain
AUTH_TRUST_HOST=true
```

Coolify must forward `X-Forwarded-Host`, `X-Forwarded-Proto`, and
`X-Forwarded-For` (default for most Coolify proxy setups).

## 3. Cookies and HTTPS

In production (`NODE_ENV=production`):

- Session / callback cookies use `__Secure-` prefix and `Secure`
- CSRF cookie uses `__Host-` prefix
- All auth cookies: `httpOnly`, `SameSite=Lax`, `Path=/`

`SameSite=Lax` is correct for a same-origin staff app behind one public
domain. Do not set cookie `Domain` to a different host than `AUTH_URL`.

Serve the app only over HTTPS publicly. Mixed content or HTTP public URLs
will break Secure cookies.

## 4. Prisma / database (safe, non-destructive)

Connect **only** via `DATABASE_URL`. The app uses Prisma 7 +
`@prisma/adapter-pg` on the Node runtime (`src/lib/db/prisma.ts`).

### First deploy / subsequent deploys

```bash
# 1) Install dependencies (Coolify build or SSH)
npm ci

# 2) Generate client (also runs as part of `npm run build`)
npm run prisma:generate

# 3) Apply pending migrations — NEVER reset production data
npm run prisma:migrate:deploy

# 4) Build & start (Coolify start command)
npm run build
npm run start
```

**Seed once** after the first successful migrate (creates initial admin if
missing; does not overwrite existing passwords):

```bash
npm run prisma:seed
```

### Forbidden in production

- `prisma migrate reset`
- `prisma db push --force-reset`
- Any script that drops or recreates the database

Dev-only schema iteration: `npm run prisma:migrate` (`prisma migrate dev`)
on a local/dev database only.

## 5. Coolify service tips

| Topic | Recommendation |
| --- | --- |
| Node version | **20.9+** (`package.json` `engines`) |
| Start command | `npm run start` (after build) |
| Port | Coolify maps container port (default **3000**) |
| Healthcheck | `GET /` or `GET /login` → 200 |
| Proxy | Enable HTTPS domain; keep forwarded headers on |
| Build | `npm run build` includes `prisma generate && next build` |
| Migrations | Run `prisma:migrate:deploy` as a **one-shot** release step before/at deploy — not as a destructive reset |

Do not auto-run seed on every deploy.

## 6. Production verification checklist

After deploy with real env vars (no localhost):

1. **Login**
   - Open `https://your-domain/login` over HTTPS
   - Sign in with seeded admin credentials
   - Confirm redirect to `/admin/dashboard` (ADMIN) or `/doctor/dashboard` (DOCTOR)
2. **Session**
   - Refresh the dashboard — still authenticated
   - `GET /api/auth/session` returns user `id`, `role`, `doctorId` (doctors)
3. **Logout**
   - Sign out — session cleared; `/admin` redirects to `/login`
4. **RBAC redirects**
   - As ADMIN, `/doctor/dashboard` redirects away to admin area
   - As DOCTOR, `/admin/dashboard` redirects away to doctor area
   - Unauthenticated `/admin/*` and `/doctor/*` redirect to `/login?callbackUrl=…`
5. **Cookies** (browser DevTools → Application → Cookies)
   - Production names include `__Secure-authjs.session-token` / `__Host-authjs.csrf-token`
   - `Secure` + `HttpOnly` set; `SameSite=Lax`
6. **Proxy sanity**
   - No redirects to `http://…:3000` or internal hostnames
   - Callback / CSRF errors absent in logs (Auth.js logger emits codes only; never secrets)

This checklist is the production proof for Coolify; unit tests cannot hit
your VPS from a developer machine.

## 7. Related docs

- `docs/ARCHITECTURE.md` — auth and deployment overview
- `docs/DATABASE.md` — schema and Prisma 7 notes
- `.env.example` — full placeholder list

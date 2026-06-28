# Deploying to Vercel

Single Next.js application — Vercel auto-detects everything.

> For the Neon Postgres setup specifically, see [`db/README.md`](./db/README.md).

---

## TL;DR — Deploy in 4 steps

1. **Push to GitHub** → in Vercel `New Project` → pick the repo.
2. Vercel auto-detects Next.js 15. Leave all build settings at their defaults.
3. *(Optional but recommended)* Add `DATABASE_URL` and the other env vars in
   **Vercel → Project → Settings → Environment Variables** (see the table below).
4. Click **Deploy**.

> No environment variables are required for the first deploy. The contact form
> works in fallback mode (validates + logs submission to server console).

---

## Environment variables

Add these in **Vercel → Project → Settings → Environment Variables** (set the
environment to **Production**, and optionally also **Preview** for branch deploys).

| Key | Required for | Value |
|-----|--------------|-------|
| `DATABASE_URL` | Storing real bookings | Neon Postgres connection string from https://console.neon.tech (format: `postgresql://USER:PASS@ep-xxxx-...neon.tech/neondb?sslmode=require`) |
| `RESEND_API_KEY` | Email notifications | Resend API key (`re_…`) from https://resend.com |
| `SENDER_EMAIL` | Email notifications | `onboarding@resend.dev` (test) or `noreply@jmamotorservice.ie` (verified domain) |
| `BUSINESS_EMAIL` | Email notifications | The inbox that receives notifications |
| `REPLY_TO_EMAIL` | Customer confirmations | Optional reply-to address shown on outgoing customer emails (falls back to `BUSINESS_EMAIL`) |
| `ADMIN_SECRET` | Protecting `/admin` | Long random secret used to sign the admin session cookie |
| `ADMIN_BOOTSTRAP_EMAIL` | First admin setup | Email for the first admin account you will insert into `admin_users` |
| `ADMIN_BOOTSTRAP_PASSWORD` | First admin setup | Plain-text password you will hash before inserting into `admin_users` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Showing WhatsApp button | International format, no `+` (e.g. `353852246411`) |

After adding env vars: **Deployments → ⋯ → Redeploy** (envs only apply to new deploys).

### Quick-copy template

```bash
DATABASE_URL=postgresql://USER:PASS@ep-xxxx-...neon.tech/neondb?sslmode=require
RESEND_API_KEY=
SENDER_EMAIL=onboarding@resend.dev
BUSINESS_EMAIL=info@jmamotorservice.ie
REPLY_TO_EMAIL=info@jmamotorservice.ie
ADMIN_SECRET=choose-a-long-random-secret
ADMIN_BOOTSTRAP_EMAIL=admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=choose-a-strong-password
NEXT_PUBLIC_WHATSAPP_NUMBER=353852246411
```

---

## Step-by-step: from zero to live

### 1. Create the Neon database

Follow [`db/README.md`](./db/README.md). Total time ≈ 3 minutes:

1. Sign up at https://console.neon.tech (free, no card).
2. Create project `jma-motor-service` in the EU region.
3. Copy the connection string Neon shows you.
4. Open the Neon SQL Editor → paste the contents of [`db/schema.sql`](./db/schema.sql) → Run.

### 2. (Optional) Set up Resend for email

1. Sign up at https://resend.com.
2. API Keys → Create API Key → copy the `re_…` value.
3. *(Optional)* Domains → Add Domain → follow Resend's DNS instructions. Once verified, set `SENDER_EMAIL=noreply@yourdomain.com`. Until then, leave `SENDER_EMAIL=onboarding@resend.dev`.

### 3. Connect Vercel to GitHub

1. https://vercel.com/new → Import the repository.
2. Build & dev presets: leave at defaults (Next.js, `yarn install`, `next build`).
3. Skip adding env vars in the initial wizard if you want — you can add them after the first deploy.
4. Click **Deploy** — the site is live in ~60 seconds.

### 4. Add env vars and redeploy

1. Project Settings → Environment Variables → add each row from the table above.
2. Deployments → click the latest deploy → ⋯ → **Redeploy**.

### 5. Create at least one admin user

Generate a bcrypt hash locally:

```bash
node -e "const { hashSync } = require('bcryptjs'); console.log(hashSync('ChangeMe123!', 12));"
```

Then insert it in Neon:

```sql
INSERT INTO admin_users (email, password_hash, display_name)
VALUES ('admin@example.com', '$2a$12$replace_with_generated_hash', 'Main Admin');
```

Repeat for any additional admins, then use that email/password on `/admin/login`.

6. Verify

```bash
# Health
curl https://<your-domain>.vercel.app/api/service-requests
# → { "db_configured": true, "db_reachable": true, ... }

# Test submit
curl -X POST https://<your-domain>.vercel.app/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"085 555 5555","car_make_model":"VW Golf","service_needed":"Full car service","selected_language":"en"}'
```

Then in the Neon SQL Editor:

```sql
SELECT id, customer_name, service_needed, selected_language, status, created_at
FROM service_requests
ORDER BY created_at DESC
LIMIT 5;
```

You should see your submission.

---

## Testing the booking form

### Locally

```bash
# 1. Add DATABASE_URL to .env.local
echo "DATABASE_URL=postgresql://..." >> .env.local

# 2. Start the dev server
yarn dev

# 3. Open http://localhost:3000, scroll to "Tell us about your car", submit
# 4. Check Neon SQL Editor → SELECT * FROM service_requests ORDER BY created_at DESC LIMIT 5;
```

### Production

1. Open the deployed site
2. Switch to Somali via the header toggle (verify the language persists across reloads)
3. Click "Ask about this service" on any service card → verify the form preselects that service
4. Submit the form → verify the success message
5. Check Neon for the new row

---

## Manual steps on Vercel/Emergent

- After **adding any env var** → redeploy from Vercel UI (envs apply to new deploys only).
- After **changing slideshow photos** → just push to GitHub. Vercel auto-deploys.
- After **editing Somali translations** in `lib/i18n.js` → push to GitHub. Auto-deploy.

---

## Replacing slideshow photos

1. Open `/public/images/hero-slideshow/`
2. Overwrite `slide-1.jpg` … `slide-4.jpg` with your own images
   - Same filenames (the component reads them by name)
   - 1920×1080, JPEG, ideally under ~400 KB each
3. Commit + push → Vercel auto-deploys
4. The site updates automatically — no code changes

See [`public/images/hero-slideshow/README.md`](./public/images/hero-slideshow/README.md) for tips.

---

## Caveats

| Caveat | Notes |
|--------|-------|
| Cold starts on the API route (~2-5 s after long inactivity) | Acceptable for a low-traffic local business |
| 10 s max request duration on Vercel Hobby (60 s on Pro) | Form POST + email is well under 10 s |
| Neon free tier auto-suspends after 5 min idle | First request after suspension takes ~500 ms extra to wake the database |

---

## Alternatives

If serverless cold starts ever become noticeable, you can move only the API route to:
- **Render** (always-on Node server, free tier available)
- **Railway** (~$5/mo hobby)
- **Fly.io** (global edge)

The Next.js app on Vercel doesn't need to change — only the hosting provider for the backend.

---

<sub>Questions? Open an issue or see `README.md` for the project overview.</sub>

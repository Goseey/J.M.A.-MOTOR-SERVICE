# Deploying to Vercel + Neon

This is a **single Next.js application**. Vercel auto-detects everything — no special config required for a first successful deploy.

---

## TL;DR — Deploy in 5 steps

1. **Push this repo to GitHub** using the **Save to GitHub** button.
2. In **Vercel**, import the repo — it auto-detects Next.js 15.
3. Create a **Neon** project.
4. Run [`db/schema.sql`](./db/schema.sql) in the **Neon SQL Editor**.
5. Add `DATABASE_URL` to **Vercel → Project → Settings → Environment Variables** and redeploy.

After redeploy, smoke-test:

```bash
curl https://<your-domain>.vercel.app/api/service-requests
```

Expected result:

```json
{
  "status": "ok",
  "service": "jma-motor-service",
  "db_configured": true,
  "email_configured": false,
  "time": "2026-06-24T21:06:21.086Z"
}
```

---

## 1) Push to GitHub

Use the project UI button:
- **Save to GitHub**

Once GitHub updates, Vercel will auto-redeploy if the repo is already connected.

---

## 2) Import / deploy in Vercel

Leave defaults as-is:
- Framework Preset: **Next.js**
- Build Command: `next build`
- Output Directory: `.next`
- Install Command: `npm install`

> No env vars are required for the first deploy. Without `DATABASE_URL`, the form still works in fallback log-only mode.

---

## 3) Create a Neon project

1. Sign in to **Neon**.
2. Create a new project.
3. Open the project dashboard.
4. Copy the connection string later for `DATABASE_URL`.

Use the pooled/serverless connection string Neon gives you.

---

## 4) Run the schema

Open the **Neon SQL Editor** and paste the contents of:
- [`db/schema.sql`](./db/schema.sql)

That creates:
- `service_requests` table
- indexes for date / name / service
- `updated_at` trigger

---

## 5) Add environment variables in Vercel

Go to:
- **Vercel → Project → Settings → Environment Variables**

Add:

| Key | Required | Notes |
|-----|:--------:|-------|
| `DATABASE_URL` | Yes, for real persistence | Neon/Postgres connection string |
| `RESEND_API_KEY` | Optional | Enables email notifications |
| `SENDER_EMAIL` | Optional | Defaults to `onboarding@resend.dev` |
| `BUSINESS_EMAIL` | Optional | Inbox for notifications |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | International format, no `+` |

Then **redeploy**.

---

## Quick-copy env block

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
RESEND_API_KEY=
SENDER_EMAIL=onboarding@resend.dev
BUSINESS_EMAIL=info@jmamotorservice.ie
NEXT_PUBLIC_WHATSAPP_NUMBER=353852246411
```

---

## Smoke test after redeploy

### Health check

```bash
curl https://<your-domain>.vercel.app/api/service-requests
```

You want:
- `db_configured: true`

### Test submit

```bash
curl -X POST https://<your-domain>.vercel.app/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"085 555 5555","car_make_model":"VW Golf","service_needed":"Full car service"}'
```

Then check Neon table:
- `service_requests`

---

## Current behavior notes

- If `DATABASE_URL` is missing or unavailable:
  - API still returns success for valid form submissions
  - submissions are logged server-side
- If `RESEND_API_KEY` is missing:
  - email sending is skipped
- The `/admin` route is still a **UI scaffold**, not a live DB dashboard yet

---

## Next sensible step after deploy

Once Neon is wired and submissions are landing in Postgres, the next phase is:
- connect `/admin` to real SQL reads
- add auth / protection for admin data
- add request details / statuses / notes

---

<sub>Questions? See `README.md` for the overview.</sub>

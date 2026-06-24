# Deploying to Vercel

This is a **single Next.js application**. Vercel auto-detects everything — no special config required for a first successful deploy.

---

## TL;DR — Deploy in 3 steps

1. **Push this repo to GitHub** → in Vercel click `New Project` → pick the repo.
2. Vercel auto-detects Next.js 15. Leave all build settings at their defaults:
   - Framework Preset: **Next.js**
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `yarn install` (default)
3. Click **Deploy**. Done — the site is live within ~60 seconds.

> No environment variables are required for the first deploy. The contact form works in fallback mode: submissions are validated and the user sees a success message, but they're only logged to the server console.

---

## After the first deploy — enabling persistence + email

When you're ready to actually receive submissions, add these in **Vercel → Project → Settings → Environment Variables**:

### Database (recommended)

| Key | Example value | Notes |
|-----|---------------|-------|
| `MONGO_URL` | `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority` | Free M0 cluster at https://cloud.mongodb.com |
| `DB_NAME`   | `jma_motor_service` | Any name; collection `service_requests` is created automatically |

**MongoDB Atlas setup (5 min):**

1. Sign up at https://cloud.mongodb.com (free, no card).
2. Create a Cluster → **M0 Free** tier.
3. **Database Access** → add a user (e.g. `jma_app`) + strong password.
4. **Network Access** → add IP `0.0.0.0/0` (required for Vercel's egress IPs).
5. **Connect → Drivers → Node.js** → copy the URI, replace `<password>` with the real value.

### Email notifications (optional)

| Key | Example value | Notes |
|-----|---------------|-------|
| `RESEND_API_KEY`  | `re_xxxxxxxxxxxxxxxxxxxxxxxxxx` | Get one at https://resend.com → API Keys |
| `SENDER_EMAIL`    | `onboarding@resend.dev` (test) **or** `noreply@jmamotorservice.ie` (after domain verify) | Must match a verified sender in Resend |
| `BUSINESS_EMAIL`  | `info@jmamotorservice.ie` | Where notifications are forwarded |

**Resend setup (10 min):**

1. Create account at https://resend.com.
2. API Keys → Create API Key → paste into Vercel as `RESEND_API_KEY`.
3. *(Optional but recommended)* Domains → Add Domain → add the DNS records Resend gives you at your domain registrar. Once verified, set `SENDER_EMAIL=noreply@yourdomain.com`.

Until the domain is verified, leave `SENDER_EMAIL=onboarding@resend.dev` — Resend will send to verified-in-dashboard recipients only.

### Public (browser) variables

| Key | Example value | Notes |
|-----|---------------|-------|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `353852246411` | International format, **no `+`**. Empty → WhatsApp buttons hidden. |

> **Important** — variables prefixed with `NEXT_PUBLIC_` are inlined into the JS bundle at build time. Change them → trigger a redeploy.

---

## Quick-copy `.env.local` block

```bash
# Server-only
MONGO_URL=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=jma_motor_service
RESEND_API_KEY=
SENDER_EMAIL=onboarding@resend.dev
BUSINESS_EMAIL=info@jmamotorservice.ie

# Browser-exposed
NEXT_PUBLIC_WHATSAPP_NUMBER=353852246411
```

---

## Verify the deploy

```bash
# Health check
curl https://<your-domain>.vercel.app/api/service-requests
# → {"status":"ok","service":"jma-motor-service","db_configured":true,"email_configured":true,...}

# Test submit
curl -X POST https://<your-domain>.vercel.app/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"085 555 5555","car_make_model":"VW Golf","service_needed":"Full car service"}'
```

Submit the form from the live site → if MongoDB is configured, check the `service_requests` collection in Atlas.

---

## Caveats

| Caveat | Notes |
|--------|-------|
| **Cold starts** on the API route (2-5 s after inactivity) | Acceptable for a low-traffic local business. The page itself is static and instant. |
| **10 s max** request duration (Hobby plan), 60 s (Pro) | The form POST + email is well under 10 s. Fine. |
| **No WebSockets** on serverless | Not used in this project. |
| **MongoDB connections per cold start** | Already mitigated — the client is cached in a module-level variable and reused across invocations of the same lambda. |

---

## Alternatives

If serverless cold starts ever become noticeable:

- **Render** — `render.yaml` for an always-on Node.js server. Free tier available.
- **Railway** — same idea, ~$5/mo for a hobby app.
- **Fly.io** — global edge, more control, slightly more setup.

The Next.js app itself doesn't need to change — only the hosting provider.

---

<sub>Questions? Open an issue or see `README.md` for the project overview.</sub>

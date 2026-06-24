# Deploying to Vercel

This repo is configured for Vercel's experimental monorepo deploy (CRA frontend + FastAPI backend) via `vercel.json`.

> **Note**: Vercel's `experimentalServices` feature is still in beta. It works, but is subject to change. If you want a more stable always-on backend, see the alternatives at the bottom of this file.

---

## TL;DR — Deploy in 5 steps

1. **Push this repo to GitHub** → import it in Vercel (`New Project` → pick repo).
2. **Create a MongoDB Atlas free cluster** → grab the `mongodb+srv://…` URI.
3. **(Optional)** Create a Resend account → grab an API key + verify your sender domain.
4. **Paste env vars** into Vercel → *Settings → Environment Variables* (table below).
5. Click **Deploy**. Done.

---

## 1. The `vercel.json` (already in the repo root)

```json
{
  "experimentalServices": {
    "frontend": {
      "root": "frontend",
      "routePrefix": "/",
      "framework": "create-react-app"
    },
    "backend": {
      "root": "backend",
      "routePrefix": "/_/backend"
    }
  }
}
```

### What this does
- **Frontend** (CRA in `/frontend`) is served at the **root** of the domain (`/`).
- **Backend** (FastAPI in `/backend`) is mounted at `/_/backend`.

Because our FastAPI app already prefixes every route with `/api`, the final public paths become:

| Endpoint                                | Production URL                                                |
|-----------------------------------------|---------------------------------------------------------------|
| Health                                  | `https://<your-domain>.vercel.app/_/backend/api/health`       |
| Create service request                  | `https://<your-domain>.vercel.app/_/backend/api/service-requests` |
| List service requests                   | `https://<your-domain>.vercel.app/_/backend/api/service-requests?limit=20` |

---

## 2. MongoDB Atlas (required — Vercel serverless cannot reach local Mongo)

1. Sign up at https://cloud.mongodb.com (free).
2. Create a cluster → **M0 Free** tier.
3. **Database Access** → add a user (e.g. `jma_app`) with a strong password. Save it.
4. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere) — required for Vercel serverless egress IPs.
5. **Connect → Drivers → Python** → copy the URI. It looks like:
   ```
   mongodb+srv://jma_app:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
6. Replace `<password>` with the real value. **Keep this — you'll paste it into Vercel below.**

---

## 3. Vercel — environment variables to paste

Open **Vercel project → Settings → Environment Variables** and add each row.
Set the **Environment** column to *Production* (and *Preview* if you want preview deploys to work too).

| Key                          | Example value                                                                                       | Required | Notes |
|------------------------------|-----------------------------------------------------------------------------------------------------|:--------:|-------|
| `MONGO_URL`                  | `mongodb+srv://jma_app:STRONG_PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`         |    ✅    | From Atlas (step 2.5) |
| `DB_NAME`                    | `jma_motor_service`                                                                                  |    ✅    | Any name; will be created automatically |
| `CORS_ORIGINS`               | `*`                                                                                                  |          | Or `https://<your-domain>.vercel.app` for stricter security once you have the real domain |
| `RESEND_API_KEY`             | `re_xxxxxxxxxxxxxxxxxxxxxxxxxx`                                                                      |          | Leave empty to disable email — form still saves |
| `SENDER_EMAIL`               | `onboarding@resend.dev` (test) **or** `noreply@jmamotorservice.ie` (after domain verification)       |          | |
| `BUSINESS_EMAIL`             | `info@jmamotorservice.ie`                                                                            |          | Where service requests are forwarded |
| `REACT_APP_BACKEND_URL`      | `/_/backend`                                                                                         |    ✅    | **Relative path** — frontend appends `/api` itself |
| `REACT_APP_WHATSAPP_NUMBER`  | `353852246411`                                                                                       |          | International, no `+`. Empty → WhatsApp button is hidden |

### Quick-copy block (paste into Vercel CLI / `.env.production` if you prefer)

```bash
# Backend
MONGO_URL=mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=jma_motor_service
CORS_ORIGINS=*
RESEND_API_KEY=
SENDER_EMAIL=onboarding@resend.dev
BUSINESS_EMAIL=info@jmamotorservice.ie

# Frontend
REACT_APP_BACKEND_URL=/_/backend
REACT_APP_WHATSAPP_NUMBER=353852246411
```

> **Important**: Vercel shares env vars across all services in `experimentalServices` by default — you do **not** need separate frontend/backend env scopes.

---

## 4. Resend (optional — only if you want the business to receive emails)

1. Create account at https://resend.com.
2. **API Keys → Create API Key** → copy the `re_…` value → paste as `RESEND_API_KEY` in Vercel.
3. **Domains → Add Domain** → enter `jmamotorservice.ie` (or your real domain) → add the DNS records Resend shows you (TXT + MX + DKIM) at your domain registrar.
4. Once verified, change `SENDER_EMAIL` to a real address on that domain, e.g. `noreply@jmamotorservice.ie`.

Until DNS is verified, keep `SENDER_EMAIL=onboarding@resend.dev` — emails will still send, just from Resend's testing sender (only to verified-in-dashboard recipient addresses).

---

## 5. Deploy

1. In Vercel: **Deployments → Redeploy** (or just push to `main` — auto-deploys are on by default).
2. Watch the build logs. Both services build in parallel.
3. Once green, visit `https://<your-domain>.vercel.app/`.
4. Smoke test:
   ```bash
   curl https://<your-domain>.vercel.app/_/backend/api/health
   # → {"status":"ok","service":"jma-motor-service","email_configured":true,...}
   ```
5. Submit the form on the live site → check `service_requests` collection in Atlas.

---

## ⚠️ Vercel-specific caveats to keep in mind

| Caveat | Impact for this project |
|--------|-------------------------|
| **Cold starts** (2-5 s on first request after inactivity) | Customers submitting the form may wait a few seconds. Acceptable for a low-traffic Dublin local business. |
| **10 s max execution** (Hobby plan), 60 s (Pro) | The form POST + email is well under 10 s. Fine. |
| **No WebSockets / background tasks** | Not used in this project. Fine. |
| **MongoDB connections per cold start** | Already mitigated — `AsyncIOMotorClient` connects lazily and Atlas handles pooling. For higher traffic, consider adding `maxPoolSize=10` to `server.py`. |

---

## Alternatives — if cold starts bother you

| Platform | Why it might be better here |
|----------|------------------------------|
| **Render** | Free tier with always-on backend, simple `render.yaml`. No cold starts after warm-up. |
| **Railway** | Always-on, simpler env management, no serverless quirks. ~$5/mo for hobby. |
| **Emergent Deploy** | One-click from the Emergent platform — managed Mongo + backend + frontend together. |

A quick way to switch later: keep the React app on Vercel (its CDN is excellent), and move only the FastAPI backend to Railway/Render. Just update `REACT_APP_BACKEND_URL` to point to the new backend domain.

---

<sub>Questions? Check `/app/README.md` for the full project overview.</sub>

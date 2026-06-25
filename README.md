# J.M.A. Motor Service — Landing Page

> Premium dark cinematic landing page for **J.M.A. Motor Service**, a real car repair & maintenance business in Dublin City Centre.
> Built as a single Next.js application — no fake reviews, no fake luxury copy, no template feel.

<p align="center">
  <img alt="Next.js"    src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white&style=flat-square">
  <img alt="React"      src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square">
  <img alt="Tailwind"   src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square">
  <img alt="Neon"       src="https://img.shields.io/badge/Database-Neon_Postgres-00E599?style=flat-square">
  <img alt="Vercel"     src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white&style=flat-square">
  <img alt="License"    src="https://img.shields.io/badge/license-MIT-D4AF37?style=flat-square">
</p>

---

## ✨ Highlights

- **Cinematic hero** — realistic licensed car photo + animated headlight glows, diagonal light sweep, drifting smoke, parallax. Fully `prefers-reduced-motion` aware.
- **Premium dark palette** — graphite + black with gold (`#D4AF37`) accents. Sora (display) + Manrope (body), loaded via `next/font/google`.
- **Real data only** — Google rating shown as the actual aggregate `5.0 / 8 reviews`. No fabricated testimonials.
- **Same-origin contact form** — validated → Next.js API route (`/api/service-requests`) → Neon Postgres (optional) + Resend email (optional). Both are best-effort: if not configured, the form **still succeeds**.
- **Admin preview scaffold** — `/admin` includes a table layout, search, date filters, reset filters and pagination ready to be connected to live data later.
- **Mobile-first** — sticky header with burger drawer, floating Call / WhatsApp / Directions cluster on scroll, fluid down to 360 px.
- **SEO ready** — Next.js metadata API + JSON-LD `AutoRepair` structured data baked into the root layout.
- **Single-deploy on Vercel** — auto-detected as Next.js, no monorepo / serverless gymnastics needed.

---

## 🧱 Tech stack

| Layer       | Choice                                                           |
|-------------|------------------------------------------------------------------|
| Framework   | Next.js 15 (App Router) + React 19                              |
| Styling     | Tailwind CSS 3.4, lucide-react icons, `next/font` for Sora + Manrope |
| API         | Next.js Route Handler at `/api/service-requests` (Node runtime) |
| Database    | Neon Postgres (optional) via `@neondatabase/serverless`         |
| Email       | Resend (optional) — gracefully no-ops when API key is missing    |
| Deploy      | Vercel — auto-detected, single application                       |

---

## 📁 Project structure

```text
.
├── app/
│   ├── admin/
│   │   ├── layout.jsx                    # Admin route metadata
│   │   └── page.jsx                      # Admin scaffold with search / filters / pagination
│   ├── layout.jsx                        # Root layout — fonts, metadata, JSON-LD
│   ├── page.jsx                          # Home page — composes all sections
│   ├── globals.css                       # Tailwind base + custom CSS effects
│   ├── icon.svg                          # Favicon (JMA wordmark)
│   └── api/service-requests/route.js     # POST/GET API route
├── components/
│   ├── AdminShell.jsx       # Admin header shell
│   ├── Header.jsx           # sticky nav + mobile drawer
│   ├── Hero.jsx             # cinematic hero
│   ├── Services.jsx         # 9 service cards
│   ├── WhyUs.jsx
│   ├── Reviews.jsx
│   ├── Contact.jsx
│   ├── ServiceRequestForm.jsx
│   ├── FAQ.jsx
│   ├── Footer.jsx
│   ├── FloatingActions.jsx
│   ├── Logo.jsx
│   ├── form/FormField.jsx
│   └── reviews/RatingCard.jsx
├── db/
│   └── schema.sql                       # Neon / Postgres schema
├── hooks/useScrollY.js                  # shared scroll + reduced-motion hook
├── lib/
│   ├── business.js                      # SINGLE source of truth for business data
│   ├── validation.js                    # data-driven form validation rules
│   └── api.js                           # same-origin fetch wrapper
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json                        # @/ → repo root alias
├── vercel.json                          # minimal — declares the Next.js framework
├── .env.example
├── DEPLOY.md
└── README.md
```

---

## 🚀 Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:
- Landing page: `http://localhost:3000`
- Admin preview: `http://localhost:3000/admin`

Production build & run:

```bash
npm run build
npm start
```

> The site works with **no environment variables at all** — submissions are validated and the success response is returned, but they're only logged to the server console (no DB persistence, no email). For real persistence, configure `DATABASE_URL` and optionally `RESEND_API_KEY`.

---

## 🔐 Environment variables

Everything is optional for the first deploy. Add what you need, when you need it.

| Key                            | Where    | Required | Notes                                                                 |
|--------------------------------|----------|:--------:|-----------------------------------------------------------------------|
| `DATABASE_URL`                 | Server   |          | Neon/Postgres connection string. Empty → log-only mode               |
| `RESEND_API_KEY`               | Server   |          | Resend API key (`re_…`). Empty → email is skipped                    |
| `SENDER_EMAIL`                 | Server   |          | Default `onboarding@resend.dev`. Use a verified domain in prod       |
| `BUSINESS_EMAIL`               | Server   |          | Inbox that receives form notifications                               |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`  | Browser  |          | International, no `+`. Empty → WhatsApp buttons are hidden           |

See [`.env.example`](./.env.example) for a copy-paste template.

---

## 🗄️ Neon setup

1. Create a **Neon** project (free tier is enough to start).
2. Open the **SQL Editor**.
3. Run [`db/schema.sql`](./db/schema.sql).
4. Copy the Neon connection string.
5. Add it to Vercel as `DATABASE_URL`.
6. Redeploy.

The API route checks `DATABASE_URL` directly, so after redeploy the health endpoint should report `db_configured: true`.

---

## 🔌 API reference

Base URL: `/api` (same-origin).

### `GET /api/service-requests`

Lightweight health/status probe.

```json
{
  "status": "ok",
  "service": "jma-motor-service",
  "db_configured": true,
  "email_configured": false,
  "time": "2026-06-24T21:06:21.086Z"
}
```

### `POST /api/service-requests`

**Body**
```json
{
  "name": "John O'Connor",
  "phone": "085 123 4567",
  "email": "john@example.com",
  "car_make_model": "VW Golf 2016",
  "service_needed": "Full car service",
  "preferred_date": "2026-02-15",
  "message": "Squealing brakes"
}
```

**Response — 201**
```json
{
  "id": "310d8f14-a758-44b7-bb78-6388a0588d50",
  "name": "John O'Connor",
  "phone": "085 123 4567",
  "email": "john@example.com",
  "car_make_model": "VW Golf 2016",
  "service_needed": "Full car service",
  "preferred_date": "2026-02-15",
  "message": "Squealing brakes",
  "email_sent": false,
  "created_at": "2026-06-24T21:06:37.380Z"
}
```

Returns **422** on validation errors with an `errors` map per field. The request is **always validated first**, then best-effort persisted, then best-effort emailed — any single failure does not break the user-facing success path.

---

## ☁️ Deploy to Vercel

See **[DEPLOY.md](./DEPLOY.md)** for the step-by-step guide.

The TL;DR:

1. Push to GitHub.
2. Import the repo into Vercel — it auto-detects Next.js, no config needed.
3. Add `DATABASE_URL` if you want real persistence.
4. *(Optional)* Add `RESEND_API_KEY`, `SENDER_EMAIL`, `BUSINESS_EMAIL` for email notifications.
5. Click Deploy or redeploy. Done.

---

## 🛣️ Roadmap

- [ ] Connect `/admin` to real Postgres queries
- [ ] Protect admin data with auth / API key / role checks
- [ ] Verified Resend domain + customer auto-acknowledgement email
- [ ] Real opening hours block
- [ ] OG share image (1200×630) + `sitemap.xml` / `robots.txt`
- [ ] Replace background image with a self-hosted optimized version (`next/image`)

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

---

<sub>Built with care for **J.M.A. Motor Service** · Brunswick Pl, Dublin D02 VK57 · ☎ 085 224 6411</sub>

# J.M.A. Motor Service — Landing Page

> Premium dark cinematic landing page for **J.M.A. Motor Service**, a real car repair & maintenance business in Dublin City Centre.
> Built as a single Next.js application — no fake reviews, no fake luxury copy, no template feel.

<p align="center">
  <img alt="Next.js"    src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white&style=flat-square">
  <img alt="React"      src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square">
  <img alt="Tailwind"   src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square">
  <img alt="Vercel"     src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white&style=flat-square">
  <img alt="License"    src="https://img.shields.io/badge/license-MIT-D4AF37?style=flat-square">
</p>

---

## ✨ Highlights

- **Cinematic hero** — realistic licensed car photo + animated headlight glows, diagonal light sweep, drifting smoke, parallax. Fully `prefers-reduced-motion` aware.
- **Premium dark palette** — graphite + black with gold (`#D4AF37`) accents. Sora (display) + Manrope (body), loaded via `next/font/google`.
- **Real data only** — Google rating shown as the actual aggregate `5.0 / 8 reviews`. No fabricated testimonials.
- **Same-origin contact form** — validated → Next.js API route (`/api/service-requests`) → MongoDB (optional) + Resend email (optional). Both are best-effort: if not configured, the form **still succeeds**.
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
| Database    | MongoDB (optional) via the official `mongodb` driver — lazy-connected |
| Email       | Resend (optional) — gracefully no-ops when API key is missing    |
| Deploy      | Vercel — auto-detected, single application                       |

---

## 📁 Project structure

```
.
├── app/
│   ├── layout.jsx                       # Root layout — fonts, metadata, JSON-LD
│   ├── page.jsx                         # Home page — composes all sections
│   ├── globals.css                      # Tailwind base + custom CSS effects
│   ├── icon.svg                         # Favicon (JMA wordmark)
│   └── api/service-requests/route.js    # POST/GET API route
├── components/
│   ├── Header.jsx          # sticky nav + mobile drawer
│   ├── Hero.jsx            # cinematic hero
│   ├── Services.jsx        # 9 service cards
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
├── hooks/useScrollY.js     # shared scroll + reduced-motion hook
├── lib/
│   ├── business.js         # SINGLE source of truth for business data
│   ├── validation.js       # data-driven form validation rules
│   └── api.js              # same-origin fetch wrapper
├── public/                 # static assets (currently empty)
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json           # @/ → repo root alias
├── vercel.json             # minimal — declares the Next.js framework
├── .env.example
├── DEPLOY.md
└── README.md
```

---

## 🚀 Quick start

```bash
yarn install            # or `npm install`
cp .env.example .env.local   # (optional — see env vars below)
yarn dev                # http://localhost:3000
```

Production build & run:

```bash
yarn build
yarn start
```

> The site works with **no environment variables at all** — submissions are validated and the success response is returned, but they're only logged to the server console (no DB persistence, no email). For real persistence, configure `MONGO_URL` and `RESEND_API_KEY` (see below).

---

## 🔐 Environment variables

Everything is optional for the first deploy. Add what you need, when you need it.

| Key                            | Where    | Required | Notes                                                              |
|--------------------------------|----------|:--------:|--------------------------------------------------------------------|
| `MONGO_URL`                    | Server   |          | MongoDB Atlas `mongodb+srv://...` URI. Empty → log-only mode       |
| `DB_NAME`                      | Server   |          | Defaults to `jma_motor_service`                                     |
| `RESEND_API_KEY`               | Server   |          | Resend API key (`re_…`). Empty → email is skipped                  |
| `SENDER_EMAIL`                 | Server   |          | Default `onboarding@resend.dev`. Use a verified domain in prod     |
| `BUSINESS_EMAIL`               | Server   |          | Inbox that receives form notifications                              |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`  | Browser  |          | International, no `+`. Empty → WhatsApp buttons are hidden          |

See [`.env.example`](./.env.example) for a copy-paste template.

---

## 🔌 API reference

Base URL: `/api` (same-origin).

### `GET /api/service-requests`

Lightweight health/status probe.

```json
{
  "status": "ok",
  "service": "jma-motor-service",
  "db_configured": false,
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
  "email": "john@example.com",        // optional
  "car_make_model": "VW Golf 2016",
  "service_needed": "Full car service",
  "preferred_date": "2026-02-15",     // optional
  "message": "Squealing brakes"       // optional
}
```

**Response — 201**
```json
{
  "id": "310d8f14-a758-44b7-bb78-6388a0588d50",
  "...": "...same fields...",
  "email_sent": false,
  "created_at": "2026-06-24T21:06:37.380Z"
}
```

Returns **422** on validation errors with an `errors` map per field. The request is **always validated first**, then best-effort persisted, then best-effort emailed — any single failure does not break the user-facing success path.

---

## 🎨 Design language

| Token        | Value         |
|--------------|---------------|
| Background   | `#050505` deep obsidian, `#121214` surface, `#18181b` card |
| Accent       | `#D4AF37` gold, `#F59E0B` amber              |
| Text         | `#FFFFFF` primary, `#A3A3A3` muted           |
| Fonts        | **Sora** (display) / **Manrope** (body)      |
| Radii        | `rounded-sm` — mechanical / precision feel   |
| Motion       | All animations honour `prefers-reduced-motion: reduce` |

---

## ☁️ Deploy to Vercel

See **[DEPLOY.md](./DEPLOY.md)** for the step-by-step guide.

The TL;DR:

1. Push to GitHub.
2. Import the repo into Vercel — it auto-detects Next.js, no config needed.
3. *(Optional)* Add `MONGO_URL`, `RESEND_API_KEY`, etc. in Vercel → Settings → Environment Variables.
4. Click Deploy. Done.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🛣️ Roadmap

- [ ] Protect admin listing (`GET /api/service-requests?admin=1`) with API-key auth
- [ ] Verified Resend domain + customer auto-acknowledgement email
- [ ] Real opening hours block
- [ ] OG share image (1200×630) + `sitemap.xml` / `robots.txt`
- [ ] Replace background image with a self-hosted optimized version (`next/image`)

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

---

<sub>Built with care for **J.M.A. Motor Service** · Brunswick Pl, Dublin D02 VK57 · ☎ 085 224 6411</sub>

# J.M.A. Motor Service — Landing Page

> Premium dark cinematic landing page for **J.M.A. Motor Service**, a real car repair & maintenance business in Dublin City Centre.
> Bilingual (English + Somali), Next.js 15, deployed on Vercel with Neon Postgres.

<p align="center">
  <img alt="Next.js"    src="https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white&style=flat-square">
  <img alt="React"      src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square">
  <img alt="Tailwind"   src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square">
  <img alt="Neon"       src="https://img.shields.io/badge/DB-Neon%20Postgres-00E599?logo=postgresql&logoColor=white&style=flat-square">
  <img alt="Vercel"     src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white&style=flat-square">
  <img alt="License"    src="https://img.shields.io/badge/license-MIT-D4AF37?style=flat-square">
</p>

---

## ✨ Highlights

- **Bilingual EN + SO** with a clean pill-style language switcher in the header (active segment is gold), persisted in `localStorage`, `<html lang>` auto-synced.
- **Cinematic hero with a 4-slide carousel** (auto-advance, manual arrows + dots, keyboard support, reduced-motion friendly). Images live in `/public/images/hero-slideshow/` — drop new JPEGs in to replace them, no code changes needed.
- **Same-origin contact form** → validated → Next.js API route → Neon Postgres (optional). Email is now required on the form; Resend can notify both the business inbox and the customer with a confirmation email. Service preselect: clicking "Ask about this service" on any card jumps to the form and fills the dropdown.
- **TikTok** linked from header (icon), mobile menu, footer, and the Contact "Follow us" block.
- **Real data only** — Google rating shown as the actual aggregate `5.0 / 8 reviews`. No fabricated testimonials.
- **Mobile-first** — sticky header with burger drawer, floating Call / WhatsApp / Directions cluster on scroll.
- **SEO ready** — Next.js metadata API + JSON-LD `AutoRepair` structured data + `sameAs` linking to the TikTok profile.
- **Single-deploy on Vercel** — auto-detected as Next.js.

---

## 🧱 Tech stack

| Layer       | Choice                                                                 |
|-------------|------------------------------------------------------------------------|
| Framework   | Next.js 15 (App Router) + React 19                                    |
| Styling     | Tailwind CSS 3.4, lucide-react icons, `next/font` for Sora + Manrope   |
| API         | Next.js Route Handler at `/api/service-requests` (Node runtime)        |
| Database    | **Neon Postgres** via `@neondatabase/serverless` — optional, lazy      |
| Email       | Resend — optional, gracefully no-ops when key is missing               |
| i18n        | Custom — `lib/i18n.js` dictionary + `AppContext` with `localStorage`   |
| Deploy      | Vercel — auto-detected, single application                             |

---

## 📁 Project structure

```
.
├── app/
│   ├── layout.jsx                       # Root layout — fonts, metadata, JSON-LD, AppProvider
│   ├── page.jsx                         # Home page — composes all sections
│   ├── globals.css
│   ├── icon.svg                         # Favicon (JMA wordmark)
│   └── api/service-requests/route.js    # POST/GET API route
├── components/
│   ├── Header.jsx                       # nav + language switcher + TikTok + Call Now
│   ├── Hero.jsx                         # cinematic hero with slideshow background
│   ├── HeroSlideshow.jsx                # 4-slide carousel
│   ├── LanguageSwitcher.jsx             # EN / SO pill toggle
│   ├── Services.jsx                     # 9 service cards (preselect → form)
│   ├── WhyUs.jsx
│   ├── Reviews.jsx + reviews/RatingCard.jsx
│   ├── Contact.jsx                      # incl. "Follow us" with TikTok button
│   ├── ServiceRequestForm.jsx           # validated form with i18n + preselect
│   ├── FAQ.jsx
│   ├── Footer.jsx
│   ├── FloatingActions.jsx
│   ├── Logo.jsx
│   ├── form/FormField.jsx
│   └── icons/TikTokIcon.jsx
├── contexts/AppContext.jsx              # global UI state: language + preselectedService
├── hooks/useScrollY.js
├── lib/
│   ├── business.js                      # SINGLE source of truth for business data
│   ├── i18n.js                          # TRANSLATIONS (EN + SO) + makeT()
│   ├── validation.js
│   ├── api.js
│   └── db.js                            # Neon helper — insertServiceRequest()
├── db/
│   ├── schema.sql                       # PostgreSQL migration — run once
│   └── README.md                        # Neon setup walkthrough
├── public/
│   └── images/hero-slideshow/
│       ├── slide-1.jpg  ← drop new photos here
│       ├── slide-2.jpg
│       ├── slide-3.jpg
│       ├── slide-4.jpg
│       └── README.md                    # how to replace the slideshow photos
├── next.config.mjs
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── vercel.json
├── .env.example
├── DEPLOY.md                            # Vercel deploy step-by-step
└── README.md
```

---

## 🚀 Quick start

```bash
yarn install               # or `npm install`
cp .env.example .env.local # then edit values (all are OPTIONAL for first run)
yarn dev                   # http://localhost:3000
```

Production build & run:

```bash
yarn build && yarn start
```

> The site works with **no environment variables at all**. Submissions are
> validated and a success response is returned; with no DB they're logged
> to the server console, with no email key the notification step is skipped.
> Configure them when you're ready (see below).

---

## 🔐 Environment variables

All optional for the first deploy.

| Key                            | Where    | Purpose |
|--------------------------------|----------|---------|
| `DATABASE_URL`                 | Server   | Neon Postgres connection string (`postgresql://...`). When empty → log-only mode |
| `RESEND_API_KEY`               | Server   | Resend API key (`re_…`). When empty → email skipped |
| `SENDER_EMAIL`                 | Server   | Verified sender (default `onboarding@resend.dev`) |
| `BUSINESS_EMAIL`               | Server   | Inbox that receives form notifications |
| `REPLY_TO_EMAIL`               | Server   | Optional reply-to address used in customer confirmations (falls back to `BUSINESS_EMAIL`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`  | Browser  | International, no `+`. Empty → WhatsApp buttons hidden |

See [`.env.example`](./.env.example) for a template and [`db/README.md`](./db/README.md) for Neon setup.

---

## 🌐 Internationalisation

The whole site supports **English** and **Af-Soomaali** (Somali).

- All strings live in [`lib/i18n.js`](./lib/i18n.js) under `TRANSLATIONS.en` and `TRANSLATIONS.so`.
- Components use `const { t } = useApp()` and `t('nav.home')`.
- The switcher is in the header (visible everywhere) and the chosen language is saved in `localStorage` (`jma.lang`).
- Default is **English**. Missing Somali keys fall back to English automatically.
- The submitted language is stored in the database (`selected_language` column).

> ⚠️ **Somali translations** were written carefully but should be reviewed by a native speaker before launch. To edit, open `lib/i18n.js` and update the `so` branch.

---

## 🎞️ Hero slideshow

- Component: [`components/HeroSlideshow.jsx`](./components/HeroSlideshow.jsx)
- Images: [`public/images/hero-slideshow/`](./public/images/hero-slideshow/)
- To replace: just overwrite `slide-1.jpg` … `slide-4.jpg` with your own photos (same filenames, ideally 1920×1080, JPEG, under ~400 KB each) and redeploy. **No code changes.**
- Behaviour: auto-advance 6 s, pauses on hover/focus, prev/next arrows on desktop, dot indicators, keyboard arrows, `prefers-reduced-motion` aware.

---

## 🔌 API reference

Base URL: `/api` (same-origin).

### `GET /api/service-requests` — health/status

```json
{
  "status": "ok",
  "service": "jma-motor-service",
  "db_configured": true,
  "db_reachable": true,
  "email_configured": false,
  "time": "2026-06-25T..."
}
```

### `POST /api/service-requests` — create booking

**Body**
```json
{
  "name": "Maxamed Cali",
  "phone": "085 123 4567",
  "email": "you@example.com",
  "car_make_model": "VW Golf 2016",
  "service_needed": "Full car service",
  "preferred_date": "2026-02-15",        // optional
  "message": "...",                      // optional
  "selected_language": "so"              // 'en' | 'so'
}
```

**Response — 201**
```json
{
  "id": "<uuid>",
  "...": "...",
  "selected_language": "so",
  "status": "new",
  "email_sent": false,
  "created_at": "2026-06-25T..."
}
```

Validation errors return **422** with a field-level `errors` map.

---

## 🎨 Design tokens

| Token        | Value         |
|--------------|---------------|
| Background   | `#050505` deep obsidian, `#121214` surface, `#18181b` card |
| Accent       | `#D4AF37` gold, `#F59E0B` amber              |
| Text         | `#FFFFFF` primary, `#A3A3A3` muted           |
| Fonts        | **Sora** (display) / **Manrope** (body)      |
| Radii        | `rounded-sm` — mechanical / precision feel   |
| Motion       | All animations honour `prefers-reduced-motion: reduce` |

---

## ☁️ Deploy

See **[DEPLOY.md](./DEPLOY.md)** for the step-by-step guide and **[db/README.md](./db/README.md)** for the Neon walkthrough.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

---

<sub>Built with care for **J.M.A. Motor Service** · Brunswick Pl, Dublin D02 VK57 · ☎ 085 224 6411 · TikTok: [@j.m.a.motor.servi7](https://www.tiktok.com/@j.m.a.motor.servi7)</sub>

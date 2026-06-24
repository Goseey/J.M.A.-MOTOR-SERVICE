# J.M.A. Motor Service — Landing Page

> Premium dark cinematic landing page for **J.M.A. Motor Service**, a real car repair & maintenance business in Dublin City Centre.
> Built to look ready-to-ship: no fake reviews, no fake luxury copy, no template feel.

<p align="center">
  <img alt="React"      src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&style=flat-square">
  <img alt="FastAPI"    src="https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white&style=flat-square">
  <img alt="MongoDB"    src="https://img.shields.io/badge/MongoDB-Async%20Motor-13aa52?logo=mongodb&logoColor=white&style=flat-square">
  <img alt="Tailwind"   src="https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square">
  <img alt="License"    src="https://img.shields.io/badge/license-MIT-D4AF37?style=flat-square">
</p>

---

## ✨ Highlights

- **Cinematic hero** — realistic licensed car photo + animated headlight glows, diagonal light sweep, drifting smoke, parallax. Fully `prefers-reduced-motion` aware.
- **Premium dark palette** — graphite + black with gold (`#D4AF37`) accents. Sora (display) + Manrope (body), all from Google Fonts.
- **Real data only** — Google rating shown as the actual aggregate `5.0 / 8 reviews`. No fabricated testimonials, no fake awards.
- **Service request flow** — validated React form → FastAPI → MongoDB. Best-effort transactional email via Resend (gracefully no-ops if not configured).
- **Mobile-first** — sticky header with burger drawer, floating Call / WhatsApp / Directions cluster on scroll, fluid down to 360 px.
- **SEO ready** — page title, meta description, OpenGraph, and JSON-LD `AutoRepair` structured data baked in.
- **Accessibility** — semantic landmarks, `data-testid` on every interactive element, focus rings, reduced-motion safe, contrast checked.

---

## 🧱 Tech stack

| Layer       | Choice                                                                 |
|-------------|------------------------------------------------------------------------|
| Frontend    | React 19, CRA + CRACO, Tailwind CSS 3.4, lucide-react, Framer Motion   |
| Backend     | FastAPI, Motor (async MongoDB), Pydantic v2, Resend SDK                |
| Database    | MongoDB (collection: `service_requests`)                               |
| Email       | Resend — optional, gracefully degrades when API key is missing         |
| Testing     | pytest (backend), Playwright (frontend smoke)                          |

---

## 📁 Project structure

```
.
├── backend/
│   ├── server.py                 # FastAPI app, all routes under /api
│   ├── requirements.txt
│   ├── .env.example              # copy → .env and fill in
│   └── tests/
│       └── backend_test.py       # 12 pytest cases
├── frontend/
│   ├── src/
│   │   ├── App.js                # composition root
│   │   ├── components/
│   │   │   ├── Header.jsx        # sticky nav + mobile drawer
│   │   │   ├── Hero.jsx          # cinematic hero
│   │   │   ├── Services.jsx      # 9 service cards
│   │   │   ├── WhyUs.jsx
│   │   │   ├── Reviews.jsx       # Google rating card (real data)
│   │   │   ├── Contact.jsx       # address + map + CTAs
│   │   │   ├── ServiceRequestForm.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── FloatingActions.jsx
│   │   │   ├── Logo.jsx
│   │   │   ├── form/FormField.jsx
│   │   │   └── reviews/RatingCard.jsx
│   │   ├── hooks/useScrollY.js   # shared scroll + reduced-motion hook
│   │   ├── lib/
│   │   │   ├── api.js            # axios client + submitServiceRequest
│   │   │   ├── business.js       # SINGLE source of truth for business data
│   │   │   └── validation.js     # data-driven form validation rules
│   │   ├── App.css / index.css
│   │   └── index.js
│   ├── public/
│   │   ├── index.html            # title, meta, JSON-LD AutoRepair
│   │   └── favicon.svg           # JMA wordmark favicon
│   ├── tailwind.config.js
│   ├── craco.config.js
│   └── .env.example
├── README.md
└── LICENSE
```

---

## 🚀 Quick start

### Prerequisites
- Node.js 20+, Yarn 1.x
- Python 3.11+
- MongoDB (local or cloud)

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # then edit values
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Health check: `curl http://localhost:8001/api/health`

### 2. Frontend

```bash
cd frontend
yarn install
cp .env.example .env          # then edit REACT_APP_BACKEND_URL
yarn start
```

The app starts on http://localhost:3000.

> ⚠️ `REACT_APP_BACKEND_URL` must be your backend's **public** base URL (no trailing slash, no `/api` suffix). The frontend appends `/api` itself.

---

## 🔐 Environment variables

### `backend/.env`

| Key               | Required | Notes                                                                         |
|-------------------|----------|-------------------------------------------------------------------------------|
| `MONGO_URL`       | ✅       | e.g. `mongodb://localhost:27017`                                              |
| `DB_NAME`         | ✅       | e.g. `jma_motor_service`                                                      |
| `CORS_ORIGINS`    |          | `*` or comma-separated list of origins                                        |
| `RESEND_API_KEY`  |          | Get from https://resend.com → API Keys. Empty → email skipped, form still works |
| `SENDER_EMAIL`    |          | Default `onboarding@resend.dev`. Use a verified domain for production         |
| `BUSINESS_EMAIL`  |          | Where service requests are forwarded                                          |

### `frontend/.env`

| Key                          | Required | Notes                                                       |
|------------------------------|----------|-------------------------------------------------------------|
| `REACT_APP_BACKEND_URL`      | ✅       | Public URL of the FastAPI backend                           |
| `REACT_APP_WHATSAPP_NUMBER`  |          | International format, no `+` (e.g. `353852246411`). Empty → WhatsApp button hidden |
| `WDS_SOCKET_PORT`            |          | Dev server WebSocket port (default `443` for HTTPS previews) |

---

## 🧪 Tests

```bash
# Backend
cd backend
pytest tests/backend_test.py -v
# → 12 passed
```

The pytest suite hits the live backend (no mocks) — health, CORS, create + persistence,
validation rules, list endpoint.

---

## 🔌 API reference

Base URL: `{REACT_APP_BACKEND_URL}/api`

### `GET /api/health`
```json
{
  "status": "ok",
  "service": "jma-motor-service",
  "email_configured": false,
  "time": "2026-06-24T20:25:22.476Z"
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
  "id": "618f611f-dac0-4e0d-9614-c3c246f1ea15",
  "...": "...same fields...",
  "email_sent": false,
  "created_at": "2026-06-24T20:07:52.768Z"
}
```
Returns **422** on validation errors. The request is always persisted before the email
attempt — email is best-effort.

### `GET /api/service-requests?limit=N`
Admin endpoint — returns the latest submissions sorted by `created_at` desc.
**Currently unauthenticated — protect before exposing publicly.**

---

## 🎨 Design language

| Token        | Value         |
|--------------|---------------|
| Background   | `#050505` deep obsidian, `#121214` surface, `#18181b` card |
| Accent       | `#D4AF37` gold, `#F59E0B` amber              |
| Text         | `#FFFFFF` primary, `#A3A3A3` muted           |
| Fonts        | **Sora** (display, headings) / **Manrope** (body) |
| Radii        | `rounded-sm` — mechanical / precision feel   |
| Motion       | All animations honour `prefers-reduced-motion: reduce` |

---

## 🛣️ Roadmap

- [ ] Protect `GET /api/service-requests` with API-key auth + simple admin page
- [ ] Verified Resend sending domain (`noreply@jmamotorservice.ie`) + customer auto-acknowledgement email
- [ ] Add real opening hours block
- [ ] OG share image (1200×630) + `sitemap.xml` / `robots.txt`
- [ ] Replace deprecated `@app.on_event("shutdown")` with FastAPI `lifespan` handler

---

## ☁️ Deploy

Vercel-ready out of the box — see **[DEPLOY.md](./DEPLOY.md)** for the step-by-step guide
(monorepo via `vercel.json`, MongoDB Atlas setup, env-var mapping, Resend domain verification).

Quick deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

---

<sub>Built with care for **J.M.A. Motor Service** · Brunswick Pl, Dublin D02 VK57 · ☎ 085 224 6411</sub>

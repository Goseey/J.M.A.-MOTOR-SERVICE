# J.M.A. Motor Service — Product Requirements Document

## Original Problem Statement
Build a professional, premium landing page for **J.M.A. Motor Service**, a real car repair and maintenance business located in Dublin City Centre (Brunswick Pl, D02 VK57). The site must look serious, trustworthy, and ready to show to a real business owner — no fake reviews, no fake luxury text, no cheap template feel.

## Business Profile (single source of truth — `/app/frontend/src/lib/business.js`)
- **Name**: J.M.A. Motor Service
- **Type**: Car repair & maintenance
- **Address**: Brunswick Pl, City centre, Dublin, D02 VK57
- **Phone**: 085 224 6411 (international: +353 85 224 6411)
- **Plus code**: 8QV4+4C Dublin
- **Google rating**: 5.0 · 8 reviews (real data only — no fake testimonials)
- **WhatsApp**: 353852246411 (configurable via `REACT_APP_WHATSAPP_NUMBER`)
- **Business email (placeholder)**: info@jmamotorservice.ie (configurable via `BUSINESS_EMAIL`)

## Architecture
- **Frontend**: React 19 + CRA/CRACO + Tailwind CSS + Framer Motion + lucide-react (port 3000)
- **Backend**: FastAPI + Motor (async MongoDB) + Pydantic v2 + Resend SDK (port 8001, all routes under `/api`)
- **Database**: MongoDB (collection: `service_requests`)
- **Email**: Resend (best-effort; graceful fallback when `RESEND_API_KEY` is empty)
- **Hosting**: Supervisor (backend + frontend + mongodb)

### Environment variables
**Backend `/app/backend/.env`**
- `MONGO_URL`, `DB_NAME` (protected)
- `CORS_ORIGINS=*`
- `RESEND_API_KEY` (empty by default; required to enable email notifications)
- `SENDER_EMAIL=onboarding@resend.dev`
- `BUSINESS_EMAIL=info@jmamotorservice.ie`

**Frontend `/app/frontend/.env`**
- `REACT_APP_BACKEND_URL` (protected)
- `REACT_APP_WHATSAPP_NUMBER=353852246411`

## User Personas
1. **Local Dublin driver** — needs a trustworthy garage nearby, wants to call quickly or get directions.
2. **Pre-NCT preparer** — searching for a workshop to do a pre-test inspection.
3. **First-time visitor** — wants to gauge trust (rating, location, real contact info) before calling.

## Core Static Requirements
- Premium dark cinematic style — graphite/black with gold (#D4AF37) accents.
- Modern geometric sans typography — Sora (display) + Manrope (body).
- Cinematic hero with realistic licensed car image + animated headlight glows + diagonal light sweep + smoke layer + parallax + reduced-motion support.
- Sticky header with mobile burger menu + Call Now CTA.
- 9 service cards · 6 "Why Us" trust points · Google 5.0 rating card · contact block with Google Maps embed · service request form · 6-question FAQ accordion · footer.
- All interactive elements have `data-testid` attributes (≈80+ across the site).
- Fully responsive down to 390px viewport.
- SEO: page title, meta description, OG tags, JSON-LD `AutoRepair` structured data.

## Implemented (Jan 2026)
- **Backend API** (`/app/backend/server.py`):
  - `GET /api/health` — service health + email-configured flag
  - `POST /api/service-requests` — validates payload, persists to MongoDB, best-effort email via Resend
  - `GET /api/service-requests?limit=N` — admin list endpoint
- **Frontend sections** (`/app/frontend/src/components/`):
  - `Header.jsx` — sticky glassmorphism header, desktop nav, mobile drawer, Call Now CTA
  - `Hero.jsx` — cinematic hero (parallax + headlight blobs + light sweep + smoke + grain), 4 trust badges, 3 CTAs, direct line phone
  - `Services.jsx` — 9 bento-grid service cards with thin lucide icons + corner gold accents on hover
  - `WhyUs.jsx` — 6-point asymmetric list with sticky heading column
  - `Reviews.jsx` — Google 5.0/8 rating card with metallic gold "5.0", 5 stars, verified badge, gold corner accents, View on Google Maps CTA
  - `Contact.jsx` — address, plus code, phone + Call/Directions/Send Request/WhatsApp buttons + grayscale Google Maps embed with floating address tag
  - `ServiceRequestForm.jsx` — client-side validation, axios POST, success card with disclaimer, server error banner
  - `FAQ.jsx` — accordion (single-open) with smooth grid-rows-[1fr]/[0fr] transitions
  - `Footer.jsx` — brand + contact + quick links + copyright
  - `FloatingActions.jsx` — Call / Directions / WhatsApp floating buttons appearing after scrollY > 700
- **Branding**:
  - Text-based JMA wordmark (metallic silver) with gold dot accents in `Logo.jsx`
  - Custom favicon SVG
- **Testing**: 10/10 backend pytest passing; full frontend Playwright suite passing (iteration 1 report).

## Backlog (P0 → P2)
- **P1**: Add admin auth (basic API key) to `GET /api/service-requests` before exposing real customer data.
- **P1**: Hook up real Resend API key + verified sender domain (replace `onboarding@resend.dev`).
- **P2**: Replace `@app.on_event('shutdown')` with FastAPI lifespan handler.
- **P2**: Add opening hours block (real hours needed from owner).
- **P2**: Add a small "before your visit" checklist card on the form page.
- **P2**: Add OG share image (1200x630) for social link previews.
- **P2**: Add a sitemap.xml + robots.txt for SEO.

## Notes
- No fake reviews, no invented years of experience, no fake awards (per brief).
- Hero image source: Pexels (licensed for commercial use, no attribution required).
- Reduced-motion is respected globally — heavy animations are disabled via `prefers-reduced-motion: reduce`.

## Next Action Items
- Provide a real Resend API key + verified sending domain so service requests trigger email to the business inbox.
- Confirm WhatsApp number (currently 353852246411) and Brunswick Pl exact pin in Google Maps.
- Optional: Provide opening hours and any genuine business milestones to surface in "Why Us".

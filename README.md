# J.M.A. Motor Service

Premium dark bilingual website + protected admin workflow for **J.M.A. Motor Service**, a real car repair and maintenance business in Dublin city centre.

Current stack on this commit:
- **Next.js 15** + **React 19**
- **Tailwind CSS**
- **Neon Postgres**
- **Resend** for optional email delivery
- **Custom EN / SO i18n**
- **Protected admin area** with cookie-based sessions

---

## What the project includes

### Public website
- Bilingual landing page (**English + Somali**)
- Premium dark automotive visual system
- Hero slideshow
- Services, trust section, reviews, contact, FAQ
- Booking / service request form
- Optional email notifications

### Admin area
- `/admin/login` protected login
- `/admin` service request table
- Search, sort, date filters
- Auto-apply filters without an Apply button
- Manual admin entry / journal flow
- Update request modal
- Internal admin notes
- Visual note indicators in the client column
- Short request IDs for cleaner scanning

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| UI | React 19 + Tailwind CSS + lucide-react |
| Data | Neon Postgres via `@neondatabase/serverless` |
| Email | Resend |
| Auth | Cookie-signed admin session using `ADMIN_SECRET` |
| i18n | `lib/i18n.js` + `AppContext` |
| Deploy | Vercel |

---

## Project structure

```text
.
├── app/
│   ├── layout.jsx
│   ├── page.jsx
│   ├── globals.css
│   ├── icon.svg
│   ├── admin/
│   │   ├── layout.jsx
│   │   ├── page.jsx
│   │   ├── login/page.jsx
│   │   └── logout/route.js
│   └── api/service-requests/route.js
├── components/
│   ├── AdminAutoSubmitFilters.jsx
│   ├── AdminQuickEntryForm.jsx
│   ├── AdminRequestMessage.jsx
│   ├── AdminShell.jsx
│   ├── AdminUpdateRequestButton.jsx
│   ├── Contact.jsx
│   ├── FAQ.jsx
│   ├── FloatingActions.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── HeroSlideshow.jsx
│   ├── LanguageSwitcher.jsx
│   ├── Logo.jsx
│   ├── Reviews.jsx
│   ├── ServiceRequestForm.jsx
│   ├── Services.jsx
│   ├── WhyUs.jsx
│   └── form/FormField.jsx
├── contexts/
│   └── AppContext.jsx
├── hooks/
│   ├── useBodyScrollLock.js
│   └── useScrollY.js
├── lib/
│   ├── admin.js
│   ├── admin-auth.js
│   ├── admin-password.js
│   ├── api.js
│   ├── business.js
│   ├── db.js
│   ├── i18n.js
│   └── validation.js
├── db/
│   ├── schema.sql
│   └── README.md
├── public/
│   └── images/hero-slideshow/
├── .env.example
├── DEPLOY.md
├── design_guidelines.json
└── README.md
```

---

## Environment variables

| Key | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `RESEND_API_KEY` | Enables outgoing emails |
| `SENDER_EMAIL` | From-address for Resend |
| `BUSINESS_EMAIL` | Inbox for business notifications |
| `REPLY_TO_EMAIL` | Optional reply-to for outgoing customer mail |
| `ADMIN_SECRET` | Required to sign admin session cookies |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp number for public CTA buttons |

Create the first admin user with:

```bash
DATABASE_URL=... node scripts/create-admin.mjs admin@example.com 'StrongPassword123'
```

Admin login checks use rows stored in `admin_users` with bcrypt password hashes.
Login is brute-force protected: 10 failed attempts from one IP trigger a 1 minute
block that doubles on every repeat offence, capped at 1 hour.

---

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

---

## Admin auth model

The current admin flow is:

1. Admin user rows live in `admin_users`
2. Passwords are stored as **bcrypt hashes**
3. Login verifies email + password on the server
4. Successful login creates an **HttpOnly signed cookie**
5. `/admin/logout` clears that cookie

Important:
- `ADMIN_SECRET` is required in production
- at least one `admin_users` row must exist
- there is **no** single `ADMIN_PASSWORD` env-based login in the current version

---

## Booking flow

### Public form
`POST /api/service-requests`
- validates the payload
- stores the request in Postgres when `DATABASE_URL` exists
- falls back gracefully when DB is missing
- optionally sends email through Resend

### Admin updates
Admins can:
- update requests
- create internal admin entries
- write internal notes
- change status

If a request date changes and the customer has an email address, the system can send an update email when Resend is configured.

---

## Notes about current UI behaviour

- Admin filters auto-apply
- Admin modals lock background page scroll
- Client column contains note/message indicators:
  - blue = customer message
  - amber = admin note
- Request IDs are intentionally shortened in the table for readability

---

## Documentation map

- `README.md` — project overview
- `DEPLOY.md` — deployment and env setup
- `db/README.md` — Neon + schema + admin user setup
- `design_guidelines.json` — visual system / style rules

---

## Maintenance guidance

This project intentionally prefers:
- small reusable hooks for behaviour
- server-side safety for admin actions
- graceful fallbacks when DB/email are missing
- bilingual strings centralized in `lib/i18n.js`

When editing:
- keep UI in the same premium dark automotive style
- do not pass server-only functions into client components
- keep admin UI and public UI visually coherent
- update docs when behaviour changes

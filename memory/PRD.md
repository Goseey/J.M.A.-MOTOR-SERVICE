# J.M.A. Motor Service — Current Product / Engineering Snapshot

This file was previously an older PRD from a different stack generation.
It is now repurposed as a lightweight project snapshot so internal notes match the current codebase.

---

## Current product state

J.M.A. Motor Service is currently implemented as a:
- **Next.js 15** website
- bilingual public booking flow (**EN + SO**)
- **Neon Postgres** data layer
- optional **Resend** email delivery
- protected **admin panel** with database-backed user auth

---

## Public experience

The public site currently includes:
- premium dark automotive landing page
- hero slideshow
- service cards
- trust / why-us section
- reviews block
- contact section
- booking form
- FAQ
- floating action buttons

The booking form:
- validates client-side
- submits to `/api/service-requests`
- stores requests in Postgres when configured
- can send email notifications when Resend is configured
- stores the selected language on the request

---

## Admin experience

The admin area currently includes:
- `/admin/login`
- cookie-signed auth using `ADMIN_SECRET`
- `admin_users` table with bcrypt password hashes
- request table with search / sort / date filters
- auto-applying filters
- manual admin journal entry creation
- update modal for request editing
- internal admin notes
- request status updates
- short request IDs in the table
- note indicators in the client column:
  - blue = customer message
  - amber = admin note

---

## Important implementation rules already learned in this project

- Keep admin UI visually native to the public site
- Do not pass server-only functions into client components
- Keep bilingual strings centralized in `lib/i18n.js`
- Prefer graceful fallback when DB / email config is missing
- Preserve compatibility with older DB schemas when possible

---

## Source of truth docs

For real operational documentation, use:
- `README.md`
- `DEPLOY.md`
- `db/README.md`

This file is now only a compact internal project snapshot.

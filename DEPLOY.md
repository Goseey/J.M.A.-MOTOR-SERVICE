# Deploying J.M.A. Motor Service to Vercel

This project is a single **Next.js application**. Vercel auto-detects it correctly.

For database setup details, see [`db/README.md`](./db/README.md).

---

## Quick deploy

1. Push the repository to GitHub
2. Create a new Vercel project from that repo
3. Add environment variables
4. Deploy or redeploy

---

## Environment variables

Add these in **Vercel → Project → Settings → Environment Variables**.

| Key | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `RESEND_API_KEY` | Enables outgoing emails |
| `SENDER_EMAIL` | Sender identity for Resend |
| `BUSINESS_EMAIL` | Inbox for booking notifications |
| `REPLY_TO_EMAIL` | Optional reply-to used in customer confirmations |
| `ADMIN_SECRET` | Signs admin session cookies |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Public WhatsApp CTA number |

Create the first admin user with:

```bash
DATABASE_URL=... node scripts/create-admin.mjs admin@example.com 'StrongPassword123'
```

After changing env vars, **redeploy**. Vercel only applies new env values to new deployments.

---

## Database setup

1. Create a Neon project
2. Run `db/schema.sql`
3. Copy the Neon connection string into `DATABASE_URL`

See [`db/README.md`](./db/README.md) for the exact steps.

---

## Creating the first admin user

The current production admin model is **database-backed multi-user auth**, not a single env password.

### 1. Generate a bcrypt hash locally

```bash
node -e "const { hashSync } = require('bcryptjs'); console.log(hashSync('ChangeMe123!', 12));"
```

### 2. Insert an admin row in Neon

```sql
INSERT INTO admin_users (email, password_hash, display_name)
VALUES ('admin@example.com', '$2a$12$replace_with_generated_hash', 'Main Admin');
```

### 3. Set `ADMIN_SECRET`

```bash
ADMIN_SECRET=choose-a-long-random-secret
```

### 4. Log in at `/admin/login`

The login flow:
- verifies the bcrypt password hash on the server
- creates an HttpOnly signed session cookie
- protects `/admin` and `/admin/logout`

---

## Verifying deployment

### Health check

```bash
curl https://<your-domain>.vercel.app/api/service-requests
```

Expected shape (anonymous callers see only the minimal response; the detailed
fields require a valid admin session cookie):

```json
{ "status": "ok", "service": "jma-motor-service" }
```

### Test booking request

```bash
curl -X POST https://<your-domain>.vercel.app/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"085 555 5555","email":"test@example.com","car_make_model":"VW Golf","service_needed":"Full car service","selected_language":"en"}'
```

Then verify in Neon:

```sql
SELECT id, customer_name, service_needed, selected_language, status, created_at
FROM service_requests
ORDER BY created_at DESC
LIMIT 5;
```

---

## Current operational notes

- Public form works without DB, but only in fallback/log mode
- Emails are skipped when `RESEND_API_KEY` is missing
- Admin panel needs both:
  - `ADMIN_SECRET`
  - at least one real row in `admin_users`
- Admin filters auto-apply in the current UI
- Admin update and quick-entry modals use locked body scroll

---

## Recommended post-deploy checks

- Public home page renders correctly
- EN / SO language switch works
- Booking form submits successfully
- Record appears in Neon
- `/admin/login` works
- Update modal and quick entry modal scroll correctly
- Customer/admin note indicators appear correctly in the client column

---

## When to update this document

Update `DEPLOY.md` whenever you change:
- environment variables
- admin auth model
- booking submission flow
- deployment assumptions

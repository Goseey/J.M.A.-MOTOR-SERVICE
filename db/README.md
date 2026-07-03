# Neon PostgreSQL setup for J.M.A. Motor Service

This project stores public booking requests and admin-side request data in **Neon Postgres**.

This document reflects the **current Next.js + Neon + database-backed admin auth** version of the project.

---

## 1. Create the Neon project

1. Sign up at <https://console.neon.tech>
2. Create a project such as `jma-motor-service`
3. Choose an EU region close to Dublin / your Vercel deployment
4. Copy the connection string Neon gives you

It will look roughly like:

```text
postgresql://USER:PASSWORD@ep-xxxx-xxxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Never commit this value. Keep it in environment variables only.

---

## 2. Run the schema

Run the SQL in [`db/schema.sql`](./schema.sql).

### In Neon SQL Editor
- Open SQL Editor
- Paste the file contents
- Run it

### Or locally with `psql`

```bash
psql "postgresql://USER:PASSWORD@ep-xxxx-...neon.tech/neondb?sslmode=require" -f db/schema.sql
```

---

## 3. Configure Vercel

Set:

| Key | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |

Then redeploy.

For local development, add the same value to `.env.local`.

---

## 4. Verify the connection

Health check:

```bash
curl https://<your-domain>.vercel.app/api/service-requests
```

Anonymous callers get a minimal response:

```json
{ "status": "ok", "service": "jma-motor-service" }
```

The detailed shape (`db_configured`, `db_reachable`, `email_configured`, `time`)
is only returned when the request carries a valid admin session cookie —
configuration details are not exposed publicly.

Then create a test booking and verify rows in Neon.

---

## 5. Create admin users

The current admin area uses:
- `admin_users` table
- bcrypt password hashes
- signed session cookies

### Create the first admin (recommended)

```bash
DATABASE_URL="postgresql://..." node scripts/create-admin.mjs admin@example.com 'StrongPassword123'
```

The script hashes the password with bcrypt and upserts the row (re-running it
updates the password). You can create additional admins the same way.

### Or manually via SQL

```bash
node -e "const { hashSync } = require('bcryptjs'); console.log(hashSync('ChangeMe123!', 12));"
```

```sql
INSERT INTO admin_users (email, password_hash, display_name)
VALUES (
  'admin@example.com',
  '$2a$12$replace_with_generated_hash',
  'Main Admin'
);
```

### Required env for login

```bash
ADMIN_SECRET=choose-a-long-random-secret
```

Important:
- `ADMIN_SECRET` signs the cookie
- the actual password check uses the bcrypt hash stored in `admin_users`
- sessions expire after 12 hours (enforced server-side)
- login is rate limited: 10 failed attempts from one IP → 1 minute block,
  doubling on every subsequent block up to 1 hour (`login_throttle` table)

---

## 6. Useful queries

### Recent requests

```sql
SELECT id, customer_name, phone, service_needed, preferred_date, created_at
FROM service_requests
ORDER BY created_at DESC
LIMIT 20;
```

### Requests by status

```sql
SELECT status, count(*)
FROM service_requests
GROUP BY status
ORDER BY status;
```

### Requests by language

```sql
SELECT selected_language, count(*)
FROM service_requests
GROUP BY selected_language;
```

### Last 30 days

```sql
SELECT date_trunc('day', created_at) AS day, count(*)
FROM service_requests
WHERE created_at > now() - interval '30 days'
GROUP BY 1
ORDER BY 1 DESC;
```

---

## 7. Current schema expectations

The codebase gracefully handles older schemas, but the current version expects these `service_requests` columns when fully up to date:

- `id`
- `customer_name`
- `phone`
- `email`
- `car_make_model`
- `service_needed`
- `preferred_date`
- `message`
- `admin_note`
- `selected_language`
- `source`
- `created_by_admin_id`
- `status`
- `email_sent`
- `created_at`
- `updated_at`

Admin auth also expects:
- `admin_users`

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `db_configured: false` | `DATABASE_URL` missing | Add it and redeploy |
| `db_reachable: false` | DB exists but connection failed | Recheck Neon connection string |
| `relation "service_requests" does not exist` | Schema not applied | Run `db/schema.sql` |
| `/admin/login` shows config warning | `ADMIN_SECRET` missing or no admin row | Set `ADMIN_SECRET` and create an `admin_users` row |
| Notes / source fields unavailable | Older schema | Re-run / reconcile the latest schema |

---

## 9. Documentation discipline

If schema or admin auth changes again, update all three docs together:
- `README.md`
- `DEPLOY.md`
- `db/README.md`

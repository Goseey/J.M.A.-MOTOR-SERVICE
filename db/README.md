# Neon PostgreSQL — setup for J.M.A. Motor Service

The website stores booking / service request submissions in a Neon Postgres
database. Follow these steps once, then never think about it again.

---

## 1. Create the Neon project (≈ 2 min)

1. Sign up at https://console.neon.tech (free tier is enough — no credit card).
2. **Create Project** → name it `jma-motor-service` → pick the EU region closest
   to your Vercel deployment (Frankfurt or Dublin works great for Dublin
   visitors).
3. After the project is created, Neon shows you a **connection string** that
   looks like this:

   ```
   postgresql://USER:PASSWORD@ep-xxxx-xxxxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

   **Copy this** — you'll paste it into Vercel in step 3.

> Important: Neon connection strings are SECRET. Never commit them, never paste
> them in client-side code. The Next.js API route reads from `process.env` only.

---

## 2. Run the schema migration (≈ 1 min)

Open the **SQL Editor** in the Neon console (left sidebar → SQL Editor) and run
the contents of [`db/schema.sql`](./schema.sql) — paste the whole file in and
hit Run.

You should see:

```
CREATE EXTENSION
CREATE TABLE
ALTER TABLE
ALTER TABLE
CREATE INDEX (x3)
CREATE FUNCTION
CREATE TRIGGER
```

Verify with:

```sql
SELECT count(*) FROM service_requests;
-- → 0
```

Alternatively, from your laptop:

```bash
psql "postgresql://USER:PASSWORD@ep-xxxx-...neon.tech/neondb?sslmode=require" \
     -f db/schema.sql
```

---

## 3. Add the environment variable to Vercel

In **Vercel project → Settings → Environment Variables** add:

| Key            | Value                                  | Environment           |
|----------------|----------------------------------------|-----------------------|
| `DATABASE_URL` | (paste your Neon connection string)    | Production + Preview  |

Redeploy. From the Vercel dashboard: **Deployments → … menu → Redeploy**.

For local development:

```bash
# .env.local — DO NOT COMMIT
DATABASE_URL=postgresql://USER:PASS@ep-xxxx-...neon.tech/neondb?sslmode=require
```

---

## 4. Verify the connection

After the redeploy, hit the health endpoint:

```bash
curl https://<your-domain>.vercel.app/api/service-requests
```

You should see:

```json
{
  "status": "ok",
  "service": "jma-motor-service",
  "db_configured": true,
  "email_configured": false,
  "time": "2026-..."
}
```

If `db_configured` is `true`, Neon is wired up correctly.

Submit a test request from the website. Then in the Neon SQL Editor:

```sql
SELECT id, customer_name, phone, service_needed, status, selected_language, created_at
FROM service_requests
ORDER BY created_at DESC
LIMIT 5;
```

You should see your submission.

---

## 5. Common admin queries

```sql
-- Recent submissions waiting to be contacted
SELECT id, customer_name, phone, service_needed, preferred_date, created_at
FROM service_requests
WHERE status = 'new'
ORDER BY created_at DESC;

-- Mark a request as contacted
UPDATE service_requests
SET status = 'contacted'
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Submissions by language (Somali vs English breakdown)
SELECT selected_language, count(*) FROM service_requests GROUP BY 1;

-- Last 30 days
SELECT date_trunc('day', created_at) AS day, count(*)
FROM service_requests
WHERE created_at > now() - interval '30 days'
GROUP BY 1
ORDER BY 1 DESC;
```

---

## Schema reference

See [`db/schema.sql`](./schema.sql) — it's the single source of truth.

Key fields:
- `id` — UUID, auto-generated
- `customer_name`, `phone`, `car_make_model`, `service_needed` — **required**
- `email`, `preferred_date`, `message` — optional
- `selected_language` — `'en'` or `'so'` (constrained), defaults to `'en'`
- `status` — `'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled'`, defaults to `'new'`
- `created_at` / `updated_at` — auto-managed; `updated_at` is bumped by a trigger

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `db_configured: false` in API health check | `DATABASE_URL` not set on Vercel | Add it under Settings → Environment Variables, redeploy |
| `error: relation "service_requests" does not exist` | Migration not run | Run `db/schema.sql` in Neon SQL Editor |
| `error: password authentication failed` | Connection string copied wrong | Re-copy from Neon dashboard, paste exactly into Vercel |
| Connection times out after deploy | Forgot `?sslmode=require` | Make sure the URL ends with `?sslmode=require` |

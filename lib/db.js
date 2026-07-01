/**
 * Neon Postgres connection helper.
 *
 * Uses the @neondatabase/serverless driver which is purpose-built for serverless
 * environments (Vercel functions) — connections are HTTP-based with no socket
 * pool issues during cold starts.
 *
 * Usage:
 *   import { sql, isDbConfigured } from '@/lib/db';
 *   if (!isDbConfigured()) return; // graceful fallback
 *   const rows = await sql`SELECT * FROM service_requests LIMIT 10`;
 *
 * The connection string is read from process.env.DATABASE_URL.
 * NEVER inline credentials in code, NEVER expose them to the browser.
 */

import { neon } from '@neondatabase/serverless';

let cachedSql = null;

function getSql() {
  if (cachedSql) return cachedSql;
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  cachedSql = neon(url);
  return cachedSql;
}

/** True if a database connection string is configured. */
export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Tagged-template SQL function from the Neon driver.
 *
 * Example:
 *   const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
 *
 * Returns `null` if DATABASE_URL is not configured — callers should check via
 * `isDbConfigured()` first.
 */
export function sql(...args) {
  const fn = getSql();
  if (!fn) throw new Error('DATABASE_URL is not configured');
  return fn(...args);
}

/**
 * Insert a new service request. Returns the created row.
 */
export async function insertServiceRequest(payload) {
  const fn = getSql();
  if (!fn) throw new Error('DATABASE_URL is not configured');
  const {
    customer_name,
    phone,
    email = null,
    car_make_model,
    service_needed,
    preferred_date = null,
    message = null,
    selected_language = 'en',
    source = 'website',
    created_by_admin_id = null,
  } = payload;

  const rows = await fn`
    INSERT INTO service_requests (
      customer_name, phone, email, car_make_model, service_needed,
      preferred_date, message, selected_language, source, created_by_admin_id
    ) VALUES (
      ${customer_name}, ${phone}, ${email}, ${car_make_model}, ${service_needed},
      ${preferred_date}, ${message}, ${selected_language}, ${source}, ${created_by_admin_id}
    )
    RETURNING id, customer_name, phone, email, car_make_model, service_needed,
              preferred_date, message, selected_language, source, created_by_admin_id, status, created_at, updated_at
  `;
  return rows[0];
}

export async function deleteServiceRequest(id) {
  const fn = getSql();
  if (!fn) throw new Error('DATABASE_URL is not configured');

  const rows = await fn`
    DELETE FROM service_requests
    WHERE id = ${id}
    RETURNING id
  `;

  return rows[0] || null;
}

/** Mark an existing service request as email-sent. */
export async function markEmailSent(id) {
  const fn = getSql();
  if (!fn) return;
  try {
    await fn`UPDATE service_requests SET email_sent = TRUE WHERE id = ${id}`;
  } catch {
    /* best effort — never throw */
  }
}

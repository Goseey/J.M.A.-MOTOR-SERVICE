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
let serviceRequestColumnsCache = null;

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

async function getServiceRequestColumnSupport() {
  if (serviceRequestColumnsCache) return serviceRequestColumnsCache;

  const fn = getSql();
  if (!fn) throw new Error('DATABASE_URL is not configured');

  const rows = await fn`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'service_requests'
  `;

  const names = new Set(rows.map((row) => row.column_name));
  serviceRequestColumnsCache = {
    hasSource: names.has('source'),
    hasCreatedByAdminId: names.has('created_by_admin_id'),
    hasAdminNote: names.has('admin_note'),
  };

  return serviceRequestColumnsCache;
}

/**
 * Insert a new service request. Returns the created row.
 */
export async function insertServiceRequest(payload) {
  const fn = getSql();
  if (!fn) throw new Error('DATABASE_URL is not configured');
  const columnSupport = await getServiceRequestColumnSupport();
  const {
    customer_name,
    phone,
    email = null,
    car_make_model,
    service_needed,
    preferred_date = null,
    message = null,
    admin_note = null,
    selected_language = 'en',
    source = 'website',
    created_by_admin_id = null,
  } = payload;

  if (columnSupport.hasSource && columnSupport.hasCreatedByAdminId) {
    const rows = await fn`
      INSERT INTO service_requests (
        customer_name, phone, email, car_make_model, service_needed,
        preferred_date, message, admin_note, selected_language, source, created_by_admin_id
      ) VALUES (
        ${customer_name}, ${phone}, ${email}, ${car_make_model}, ${service_needed},
        ${preferred_date}, ${message}, ${admin_note}, ${selected_language}, ${source}, ${created_by_admin_id}
      )
      RETURNING id, customer_name, phone, email, car_make_model, service_needed,
                preferred_date, message, admin_note, selected_language, source, created_by_admin_id, status, created_at, updated_at
    `;
    return rows[0];
  }

  if (columnSupport.hasSource && columnSupport.hasAdminNote) {
    const rows = await fn`
      INSERT INTO service_requests (
        customer_name, phone, email, car_make_model, service_needed,
        preferred_date, message, admin_note, selected_language, source
      ) VALUES (
        ${customer_name}, ${phone}, ${email}, ${car_make_model}, ${service_needed},
        ${preferred_date}, ${message}, ${admin_note}, ${selected_language}, ${source}
      )
      RETURNING id, customer_name, phone, email, car_make_model, service_needed,
                preferred_date, message, admin_note, selected_language, source, NULL::uuid AS created_by_admin_id, status, created_at, updated_at
    `;
    return rows[0];
  }

  if (columnSupport.hasSource) {
    const rows = await fn`
      INSERT INTO service_requests (
        customer_name, phone, email, car_make_model, service_needed,
        preferred_date, message, selected_language, source
      ) VALUES (
        ${customer_name}, ${phone}, ${email}, ${car_make_model}, ${service_needed},
        ${preferred_date}, ${message}, ${selected_language}, ${source}
      )
      RETURNING id, customer_name, phone, email, car_make_model, service_needed,
                preferred_date, message, NULL::text AS admin_note, selected_language, source, NULL::uuid AS created_by_admin_id, status, created_at, updated_at
    `;
    return rows[0];
  }

  const rows = await fn`
    INSERT INTO service_requests (
      customer_name, phone, email, car_make_model, service_needed,
      preferred_date, message, selected_language
    ) VALUES (
      ${customer_name}, ${phone}, ${email}, ${car_make_model}, ${service_needed},
      ${preferred_date}, ${message}, ${selected_language}
    )
    RETURNING id, customer_name, phone, email, car_make_model, service_needed,
              preferred_date, message, NULL::text AS admin_note, selected_language, 'website'::text AS source, NULL::uuid AS created_by_admin_id, status, created_at, updated_at
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

export async function updateServiceRequest(id, payload) {
  const fn = getSql();
  if (!fn) throw new Error('DATABASE_URL is not configured');
  const columnSupport = await getServiceRequestColumnSupport();

  const {
    customer_name,
    phone,
    email = null,
    car_make_model,
    service_needed,
    preferred_date = null,
    message = null,
    admin_note = null,
    status = 'new',
  } = payload;

  if (columnSupport.hasAdminNote) {
    const rows = await fn`
      UPDATE service_requests
      SET
        customer_name = ${customer_name},
        phone = ${phone},
        email = ${email},
        car_make_model = ${car_make_model},
        service_needed = ${service_needed},
        preferred_date = ${preferred_date},
        message = ${message},
        admin_note = ${admin_note},
        status = ${status}
      WHERE id = ${id}
      RETURNING id, customer_name, phone, email, car_make_model, service_needed,
                preferred_date, message, admin_note, selected_language, status, created_at, updated_at
    `;

    return rows[0] || null;
  }

  const rows = await fn`
    UPDATE service_requests
    SET
      customer_name = ${customer_name},
      phone = ${phone},
      email = ${email},
      car_make_model = ${car_make_model},
      service_needed = ${service_needed},
      preferred_date = ${preferred_date},
      message = ${message},
      status = ${status}
    WHERE id = ${id}
    RETURNING id, customer_name, phone, email, car_make_model, service_needed,
              preferred_date, message, NULL::text AS admin_note, selected_language, status, created_at, updated_at
  `;

  return rows[0] || null;
}

export async function updateServiceRequestAdminNote(id, admin_note) {
  const fn = getSql();
  if (!fn) throw new Error('DATABASE_URL is not configured');
  const columnSupport = await getServiceRequestColumnSupport();
  if (!columnSupport.hasAdminNote) {
    return { supported: false, row: null };
  }

  const rows = await fn`
    UPDATE service_requests
    SET admin_note = ${admin_note}
    WHERE id = ${id}
    RETURNING id, admin_note, updated_at
  `;

  return { supported: true, row: rows[0] || null };
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

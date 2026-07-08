import { isDbConfigured, sql } from '@/lib/db';

// Admin table pagination size. Keep this modest so the page stays snappy on Vercel.
export const PAGE_SIZE = 10;

let serviceRequestColumnsCache = null;

export function normalizeAdminQuery(searchParams) {
  const page = Math.max(1, Number.parseInt(searchParams?.page || '1', 10) || 1);
  const q = (searchParams?.q || '').trim();
  const sort = searchParams?.sort === 'asc' ? 'asc' : 'desc';
  const from = isIsoDate(searchParams?.from) ? searchParams.from : '';
  const to = isIsoDate(searchParams?.to) ? searchParams.to : '';
  const lang = searchParams?.lang === 'so' ? 'so' : 'en';
  return { page, q, sort, from, to, lang };
}

export async function getAdminServiceRequests(filters) {
  if (!isDbConfigured()) {
    return {
      dbConfigured: false,
      dbReachable: false,
      items: [],
      total: 0,
      totalPages: 1,
      page: filters.page,
      pageSize: PAGE_SIZE,
    };
  }

  await markStaleRequests();

  const offset = (filters.page - 1) * PAGE_SIZE;

  try {
    const countRows = await getRequestCount(filters);
    const items = await getRequestItems(filters, offset);

    const total = countRows[0]?.total ?? 0;
    return {
      dbConfigured: true,
      dbReachable: true,
      items,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      page: filters.page,
      pageSize: PAGE_SIZE,
    };
  } catch (error) {
    console.error('[admin] Failed to load service requests:', error?.message || error);
    return {
      dbConfigured: true,
      dbReachable: false,
      items: [],
      total: 0,
      totalPages: 1,
      page: filters.page,
      pageSize: PAGE_SIZE,
    };
  }
}

async function getServiceRequestColumnSupport() {
  if (serviceRequestColumnsCache) return serviceRequestColumnsCache;

  const rows = await sql`
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
    hasCarRegistration: names.has('car_registration'),
  };

  return serviceRequestColumnsCache;
}

function buildWhereParts(filters) {
  const clauses = [];

  if (filters.q) clauses.push(sql`customer_name ILIKE ${`%${filters.q}%`}`);
  if (filters.from) clauses.push(sql`created_at::date >= ${filters.from}::date`);
  if (filters.to) clauses.push(sql`created_at::date <= ${filters.to}::date`);

  return clauses;
}

function joinWhereParts(clauses) {
  if (clauses.length === 0) return sql``;

  let query = sql`WHERE ${clauses[0]}`;
  for (let i = 1; i < clauses.length; i += 1) {
    query = sql`${query} AND ${clauses[i]}`;
  }
  return query;
}

async function getRequestCount(filters) {
  const where = joinWhereParts(buildWhereParts(filters));

  return sql`
    SELECT COUNT(*)::int AS total
    FROM service_requests
    ${where}
  `;
}

async function getRequestItems(filters, offset) {
  // Older databases may still be missing newer admin-facing columns.
  // We detect support once and shape the SELECT so the UI keeps working.
  const columnSupport = await getServiceRequestColumnSupport();
  const sourceColumn = columnSupport.hasSource
    ? sql`source`
    : sql`'website'::text AS source`;
  const createdByAdminColumn = columnSupport.hasCreatedByAdminId
    ? sql`created_by_admin_id`
    : sql`NULL::uuid AS created_by_admin_id`;
  const adminNoteColumn = columnSupport.hasAdminNote
    ? sql`admin_note`
    : sql`NULL::text AS admin_note`;
  const carRegistrationColumn = columnSupport.hasCarRegistration
    ? sql`car_registration`
    : sql`NULL::text AS car_registration`;
  const where = joinWhereParts(buildWhereParts(filters));
  const orderDirection = filters.sort === 'asc' ? sql`ASC` : sql`DESC`;

  return sql`
    SELECT
      id,
      customer_name,
      phone,
      email,
      car_make_model,
      ${carRegistrationColumn},
      service_needed,
      preferred_date,
      message,
      ${adminNoteColumn},
      selected_language,
      ${sourceColumn},
      ${createdByAdminColumn},
      status,
      email_sent,
      created_at,
      updated_at
    FROM service_requests
    ${where}
    ORDER BY created_at ${orderDirection}
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset}
  `;
}

async function markStaleRequests() {
  try {
    await sql`
      UPDATE service_requests
      SET status = 'stale'
      WHERE status = 'new'
        AND created_at < NOW() - INTERVAL '1 day'
    `;
  } catch (error) {
    console.error('[admin] Failed to mark stale requests:', error?.message || error);
  }
}

export async function findAdminUserByEmail(email) {
  if (!isDbConfigured() || !email) return null;
  try {
    const rows = await sql`
      SELECT id, email, password_hash, display_name, is_active, created_at, updated_at
      FROM admin_users
      WHERE lower(email) = lower(${email})
      LIMIT 1
    `;
    const user = rows[0] || null;
    return user?.is_active ? user : null;
  } catch (error) {
    console.error('[admin] Failed to find admin user by email:', error?.message || error);
    return null;
  }
}

export async function findAdminUserById(id) {
  if (!isDbConfigured() || !id) return null;
  try {
    const rows = await sql`
      SELECT id, email, password_hash, display_name, is_active, created_at, updated_at
      FROM admin_users
      WHERE id = ${id}
      LIMIT 1
    `;
    const user = rows[0] || null;
    return user?.is_active ? user : null;
  } catch (error) {
    console.error('[admin] Failed to find admin user by id:', error?.message || error);
    return null;
  }
}

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

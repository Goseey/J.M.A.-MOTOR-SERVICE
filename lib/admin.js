import { isDbConfigured, sql } from '@/lib/db';

export const PAGE_SIZE = 10;

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

  const offset = (filters.page - 1) * PAGE_SIZE;
  const whereParts = [];
  const params = [];

  if (filters.q) {
    params.push(`%${filters.q}%`);
    whereParts.push(`customer_name ILIKE $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    whereParts.push(`created_at::date >= $${params.length}::date`);
  }
  if (filters.to) {
    params.push(filters.to);
    whereParts.push(`created_at::date <= $${params.length}::date`);
  }

  const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';
  const orderClause = filters.sort === 'asc' ? 'ORDER BY created_at ASC' : 'ORDER BY created_at DESC';

  try {
    const countRows = await sql.query(
      `SELECT COUNT(*)::int AS total FROM service_requests ${whereClause}`,
      params,
    );

    const items = await sql.query(
      `
        SELECT
          id,
          customer_name,
          phone,
          email,
          car_make_model,
          service_needed,
          preferred_date,
          message,
          selected_language,
          status,
          email_sent,
          created_at,
          updated_at
        FROM service_requests
        ${whereClause}
        ${orderClause}
        LIMIT ${PAGE_SIZE}
        OFFSET ${offset}
      `,
      params,
    );

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

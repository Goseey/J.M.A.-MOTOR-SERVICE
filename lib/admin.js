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

  const where = [];
  if (filters.q) where.push(sql`customer_name ILIKE ${`%${filters.q}%`}`);
  if (filters.from) where.push(sql`created_at::date >= ${filters.from}::date`);
  if (filters.to) where.push(sql`created_at::date <= ${filters.to}::date`);

  const whereClause = where.length
    ? sql`WHERE ${sql.join(where, sql` AND `)}`
    : sql``;

  const orderClause = filters.sort === 'asc'
    ? sql`ORDER BY created_at ASC`
    : sql`ORDER BY created_at DESC`;

  const offset = (filters.page - 1) * PAGE_SIZE;

  try {
    const countRows = await sql`
      SELECT COUNT(*)::int AS total
      FROM service_requests
      ${whereClause}
    `;

    const items = await sql`
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
    `;

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

function isIsoDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

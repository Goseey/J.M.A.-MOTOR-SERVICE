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

let serviceRequestColumnsCache = null;

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
  };

  return serviceRequestColumnsCache;
}

async function getRequestCount(filters) {
  if (filters.q && filters.from && filters.to) {
    return sql`
      SELECT COUNT(*)::int AS total
      FROM service_requests
      WHERE customer_name ILIKE ${`%${filters.q}%`}
        AND created_at::date >= ${filters.from}::date
        AND created_at::date <= ${filters.to}::date
    `;
  }

  if (filters.q && filters.from) {
    return sql`
      SELECT COUNT(*)::int AS total
      FROM service_requests
      WHERE customer_name ILIKE ${`%${filters.q}%`}
        AND created_at::date >= ${filters.from}::date
    `;
  }

  if (filters.q && filters.to) {
    return sql`
      SELECT COUNT(*)::int AS total
      FROM service_requests
      WHERE customer_name ILIKE ${`%${filters.q}%`}
        AND created_at::date <= ${filters.to}::date
    `;
  }

  if (filters.from && filters.to) {
    return sql`
      SELECT COUNT(*)::int AS total
      FROM service_requests
      WHERE created_at::date >= ${filters.from}::date
        AND created_at::date <= ${filters.to}::date
    `;
  }

  if (filters.q) {
    return sql`
      SELECT COUNT(*)::int AS total
      FROM service_requests
      WHERE customer_name ILIKE ${`%${filters.q}%`}
    `;
  }

  if (filters.from) {
    return sql`
      SELECT COUNT(*)::int AS total
      FROM service_requests
      WHERE created_at::date >= ${filters.from}::date
    `;
  }

  if (filters.to) {
    return sql`
      SELECT COUNT(*)::int AS total
      FROM service_requests
      WHERE created_at::date <= ${filters.to}::date
    `;
  }

  return sql`
    SELECT COUNT(*)::int AS total
    FROM service_requests
  `;
}

async function getRequestItems(filters, offset) {
  const columnSupport = await getServiceRequestColumnSupport();
  const sourceColumn = columnSupport.hasSource
    ? sql`source`
    : sql`'website'::text AS source`;
  const createdByAdminColumn = columnSupport.hasCreatedByAdminId
    ? sql`created_by_admin_id`
    : sql`NULL::uuid AS created_by_admin_id`;
  const orderDesc = filters.sort !== 'asc';

  if (orderDesc) {
    if (filters.q && filters.from && filters.to) {
      return sql`
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
          ${sourceColumn},
          ${createdByAdminColumn},
          status,
          email_sent,
          created_at,
          updated_at
        FROM service_requests
        WHERE customer_name ILIKE ${`%${filters.q}%`}
          AND created_at::date >= ${filters.from}::date
          AND created_at::date <= ${filters.to}::date
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE}
        OFFSET ${offset}
      `;
    }

    if (filters.q && filters.from) {
      return sql`
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
          ${sourceColumn},
          ${createdByAdminColumn},
          status,
          email_sent,
          created_at,
          updated_at
        FROM service_requests
        WHERE customer_name ILIKE ${`%${filters.q}%`}
          AND created_at::date >= ${filters.from}::date
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE}
        OFFSET ${offset}
      `;
    }

    if (filters.q && filters.to) {
      return sql`
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
          ${sourceColumn},
          ${createdByAdminColumn},
          status,
          email_sent,
          created_at,
          updated_at
        FROM service_requests
        WHERE customer_name ILIKE ${`%${filters.q}%`}
          AND created_at::date <= ${filters.to}::date
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE}
        OFFSET ${offset}
      `;
    }

    if (filters.from && filters.to) {
      return sql`
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
          ${sourceColumn},
          ${createdByAdminColumn},
          status,
          email_sent,
          created_at,
          updated_at
        FROM service_requests
        WHERE created_at::date >= ${filters.from}::date
          AND created_at::date <= ${filters.to}::date
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE}
        OFFSET ${offset}
      `;
    }

    if (filters.q) {
      return sql`
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
          ${sourceColumn},
          ${createdByAdminColumn},
          status,
          email_sent,
          created_at,
          updated_at
        FROM service_requests
        WHERE customer_name ILIKE ${`%${filters.q}%`}
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE}
        OFFSET ${offset}
      `;
    }

    if (filters.from) {
      return sql`
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
          ${sourceColumn},
          ${createdByAdminColumn},
          status,
          email_sent,
          created_at,
          updated_at
        FROM service_requests
        WHERE created_at::date >= ${filters.from}::date
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE}
        OFFSET ${offset}
      `;
    }

    if (filters.to) {
      return sql`
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
        WHERE created_at::date <= ${filters.to}::date
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE}
        OFFSET ${offset}
      `;
    }

    return sql`
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
        ${sourceColumn},
        ${createdByAdminColumn},
        status,
        email_sent,
        created_at,
        updated_at
      FROM service_requests
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;
  }

  if (filters.q && filters.from && filters.to) {
    return sql`
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
        ${sourceColumn},
        ${createdByAdminColumn},
        status,
        email_sent,
        created_at,
        updated_at
      FROM service_requests
      WHERE customer_name ILIKE ${`%${filters.q}%`}
        AND created_at::date >= ${filters.from}::date
        AND created_at::date <= ${filters.to}::date
      ORDER BY created_at ASC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;
  }

  if (filters.q && filters.from) {
    return sql`
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
        ${sourceColumn},
        ${createdByAdminColumn},
        status,
        email_sent,
        created_at,
        updated_at
      FROM service_requests
      WHERE customer_name ILIKE ${`%${filters.q}%`}
        AND created_at::date >= ${filters.from}::date
      ORDER BY created_at ASC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;
  }

  if (filters.q && filters.to) {
    return sql`
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
        ${sourceColumn},
        ${createdByAdminColumn},
        status,
        email_sent,
        created_at,
        updated_at
      FROM service_requests
      WHERE customer_name ILIKE ${`%${filters.q}%`}
        AND created_at::date <= ${filters.to}::date
      ORDER BY created_at ASC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;
  }

  if (filters.from && filters.to) {
    return sql`
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
        ${sourceColumn},
        ${createdByAdminColumn},
        status,
        email_sent,
        created_at,
        updated_at
      FROM service_requests
      WHERE created_at::date >= ${filters.from}::date
        AND created_at::date <= ${filters.to}::date
      ORDER BY created_at ASC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;
  }

  if (filters.q) {
    return sql`
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
        ${sourceColumn},
        ${createdByAdminColumn},
        status,
        email_sent,
        created_at,
        updated_at
      FROM service_requests
      WHERE customer_name ILIKE ${`%${filters.q}%`}
      ORDER BY created_at ASC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;
  }

  if (filters.from) {
    return sql`
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
      WHERE created_at::date >= ${filters.from}::date
      ORDER BY created_at ASC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;
  }

  if (filters.to) {
    return sql`
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
      WHERE created_at::date <= ${filters.to}::date
      ORDER BY created_at ASC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;
  }

  return sql`
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
      ${sourceColumn},
      ${createdByAdminColumn},
      status,
      email_sent,
      created_at,
      updated_at
    FROM service_requests
    ORDER BY created_at ASC
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

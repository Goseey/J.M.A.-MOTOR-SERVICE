import {
  ArrowDownAZ,
  ArrowLeft,
  ArrowRight,
  ArrowUpAZ,
  CalendarDays,
  Database,
  ListFilter,
  RotateCcw,
  Search,
} from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import { getAdminServiceRequests, normalizeAdminQuery } from '@/lib/admin';

export default async function AdminPage({ searchParams }) {
  const filters = normalizeAdminQuery(await searchParams);
  const data = await getAdminServiceRequests(filters);

  const rangeStart = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const rangeEnd = data.total === 0 ? 0 : Math.min(data.page * data.pageSize, data.total);

  return (
    <AdminShell>
      <section className="bg-ink-950 border-b border-white/10" data-testid="admin-page-shell">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-10 sm:py-12">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-gold-400" />
                  <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="admin-overline">
                    Admin service requests
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="admin-headline">
                  Service requests
                </h1>
                <p className="mt-4 text-white/65 leading-relaxed max-w-2xl" data-testid="admin-subtext">
                  Live admin table with search, sorting, date filters and pagination.
                  Default order is newest to oldest.
                </p>
              </div>

              <StatusBadge
                dbConfigured={data.dbConfigured}
                dbReachable={data.dbReachable}
              />
            </div>

            <AdminFilters filters={filters} />
          </div>
        </div>
      </section>

      <section className="bg-ink-900" data-testid="admin-table-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="text-sm text-white/55" data-testid="admin-results-count">
              Showing <span className="text-white font-semibold">{data.total}</span> client{data.total === 1 ? '' : 's'}
            </div>
            <div className="text-sm text-white/45" data-testid="admin-default-sort-note">
              Default order: newest to oldest
            </div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-hidden bg-ink-950 shadow-ring" data-testid="admin-table-wrap">
            <div className="hidden lg:grid grid-cols-[1fr_1.2fr_1.05fr_1.2fr_0.85fr_0.9fr_0.95fr] gap-4 px-5 py-4 border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-widest2 text-white/40">
              <span>Request ID</span>
              <span>Client</span>
              <span>Phone</span>
              <span>Vehicle / Service</span>
              <span>Status</span>
              <span>Preferred</span>
              <span>Submitted</span>
            </div>

            {data.items.length > 0 ? (
              <div className="divide-y divide-white/10">
                {data.items.map((request) => (
                  <article
                    key={request.id}
                    className="grid lg:grid-cols-[1fr_1.2fr_1.05fr_1.2fr_0.85fr_0.9fr_0.95fr] gap-4 px-5 py-5 bg-ink-950/60 hover:bg-white/[0.02] transition-colors"
                    data-testid={`admin-row-${request.id}`}
                  >
                    <Cell label="Request ID" primary={request.id} secondary={request.selected_language === 'so' ? 'Somali' : 'English'} />
                    <Cell label="Client" primary={request.customer_name} secondary={request.email || null} />
                    <Cell label="Phone" primary={request.phone} />
                    <Cell label="Vehicle / Service" primary={request.car_make_model} secondary={request.service_needed} />
                    <StatusCell status={request.status} />
                    <Cell label="Preferred" primary={request.preferred_date ? formatDate(request.preferred_date) : 'Not specified'} />
                    <Cell label="Submitted" primary={formatDateTime(request.created_at)} secondary={toIsoDate(request.created_at)} />
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState dbConfigured={data.dbConfigured} dbReachable={data.dbReachable} />
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 border-t border-white/10 bg-white/[0.02]" data-testid="admin-table-footer">
              <div className="text-sm text-white/55" data-testid="admin-footer-summary">
                {data.total > 0 ? (
                  <>Showing <span className="text-white font-semibold">{rangeStart}-{rangeEnd}</span> of <span className="text-white font-semibold">{data.total}</span> clients</>
                ) : (
                  <>Showing <span className="text-white font-semibold">0</span> of <span className="text-white font-semibold">0</span> clients</>
                )}
              </div>

              <Pagination filters={filters} page={data.page} totalPages={data.totalPages} />
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function AdminFilters({ filters }) {
  return (
    <form method="get" className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_220px_200px_200px_auto] gap-3" data-testid="admin-filters-bar">
      <label className="flex items-center gap-3 h-12 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid="admin-search-field">
        <Search className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.9} />
        <input
          type="text"
          name="q"
          defaultValue={filters.q}
          placeholder="Search client by name"
          className="w-full bg-transparent border-0 outline-none text-[14px] text-white placeholder:text-white/30"
          data-testid="admin-search-input"
        />
      </label>

      <label className="flex items-center gap-3 h-12 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid="admin-sort-field">
        <ListFilter className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.9} />
        <select
          name="sort"
          defaultValue={filters.sort}
          className="w-full bg-transparent border-0 outline-none text-[14px] text-white cursor-pointer"
          data-testid="admin-sort-select"
        >
          <option value="desc" className="bg-ink-900 text-white">Newest to oldest</option>
          <option value="asc" className="bg-ink-900 text-white">Oldest to newest</option>
        </select>
        {filters.sort === 'desc' ? (
          <ArrowDownAZ className="h-4 w-4 text-white/40 shrink-0" strokeWidth={1.8} />
        ) : (
          <ArrowUpAZ className="h-4 w-4 text-white/40 shrink-0" strokeWidth={1.8} />
        )}
      </label>

      <DateField label="Date from" name="from" value={filters.from} testid="admin-date-from" />
      <DateField label="Date to" name="to" value={filters.to} testid="admin-date-to" />

      <div className="flex gap-3">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-sm bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold transition-colors shadow-gold"
          data-testid="admin-apply-filters"
        >
          <Search className="h-4 w-4" strokeWidth={1.9} /> Apply
        </button>
        <a
          href="/admin"
          className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-sm border border-white/10 bg-ink-900 text-white/80 hover:text-white hover:border-white/20 hover:bg-ink-800 transition-colors"
          data-testid="admin-reset-filters"
        >
          <RotateCcw className="h-4 w-4 text-gold-300" strokeWidth={1.9} />
          Reset
        </a>
      </div>
    </form>
  );
}

function DateField({ label, name, value, testid }) {
  return (
    <label className="flex items-center gap-3 h-12 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid={testid}>
      <CalendarDays className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.9} />
      <div className="min-w-0 w-full">
        <div className="text-[10px] uppercase tracking-widest2 text-white/35">{label}</div>
        <input
          type="date"
          name={name}
          defaultValue={value}
          className="w-full bg-transparent border-0 outline-none text-[14px] text-white"
          data-testid={`${testid}-input`}
        />
      </div>
    </label>
  );
}

function Pagination({ filters, page, totalPages }) {
  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid="admin-pagination">
      <PageLink
        disabled={page === 1}
        href={buildAdminHref(filters, Math.max(1, page - 1))}
        testid="admin-pagination-prev"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.9} /> Prev
      </PageLink>

      <div className="inline-flex items-center gap-2 px-3 h-10 rounded-sm border border-white/10 bg-ink-900 text-sm text-white/70" data-testid="admin-pagination-state">
        Page <span className="text-white font-semibold">{page}</span> of <span className="text-white font-semibold">{totalPages}</span>
      </div>

      <PageLink
        disabled={page >= totalPages}
        href={buildAdminHref(filters, Math.min(totalPages, page + 1))}
        testid="admin-pagination-next"
      >
        Next <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
      </PageLink>
    </div>
  );
}

function PageLink({ href, disabled, children, testid }) {
  const className = 'inline-flex items-center gap-2 h-10 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/80 hover:text-white hover:border-white/20 hover:bg-ink-800 transition-colors';

  if (disabled) {
    return (
      <span className={`${className} opacity-40 cursor-not-allowed`} data-testid={testid}>
        {children}
      </span>
    );
  }

  return (
    <a href={href} className={className} data-testid={testid}>
      {children}
    </a>
  );
}

function StatusBadge({ dbConfigured, dbReachable }) {
  if (!dbConfigured) {
    return (
      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-sm border border-gold-400/20 bg-gold-400/10 text-gold-100" data-testid="admin-db-note">
        <Database className="h-4 w-4 text-gold-300" strokeWidth={1.8} />
        <span className="text-[13px] leading-relaxed">DATABASE_URL is not configured yet.</span>
      </div>
    );
  }

  if (!dbReachable) {
    return (
      <div className="inline-flex items-center gap-3 px-4 py-3 rounded-sm border border-amber-400/20 bg-amber-400/10 text-amber-100" data-testid="admin-db-note">
        <Database className="h-4 w-4 text-amber-300" strokeWidth={1.8} />
        <span className="text-[13px] leading-relaxed">Database is configured but not reachable right now.</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-sm border border-emerald-400/20 bg-emerald-400/10 text-emerald-100" data-testid="admin-db-note">
      <Database className="h-4 w-4 text-emerald-300" strokeWidth={1.8} />
      <span className="text-[13px] leading-relaxed">Live data connected from Neon/Postgres.</span>
    </div>
  );
}

function EmptyState({ dbConfigured, dbReachable }) {
  let title = 'No requests found';
  let text = 'Try clearing the search or widening the date range.';

  if (!dbConfigured) {
    title = 'Database not configured';
    text = 'Add DATABASE_URL in Vercel or .env.local, then reload this page.';
  } else if (!dbReachable) {
    title = 'Database not reachable';
    text = 'The connection string exists, but the admin query could not reach Neon right now.';
  }

  return (
    <div className="px-6 py-16 text-center" data-testid="admin-empty-state">
      <p className="font-display text-2xl font-semibold text-white">{title}</p>
      <p className="mt-3 text-white/55 max-w-xl mx-auto leading-relaxed">{text}</p>
    </div>
  );
}

function Cell({ label, primary, secondary }) {
  return (
    <div className="min-w-0">
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{label}</p>
      <p className="text-[14px] text-white/85 leading-relaxed break-words">{primary}</p>
      {secondary && <p className="mt-1 text-[12px] text-white/45 break-words">{secondary}</p>}
    </div>
  );
}

function StatusCell({ status }) {
  const normalized = String(status || 'new').toLowerCase();
  const tone = {
    new: 'bg-sky-500/10 border-sky-400/30 text-sky-200',
    contacted: 'bg-amber-500/10 border-amber-400/30 text-amber-200',
    confirmed: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200',
    completed: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200',
    cancelled: 'bg-rose-500/10 border-rose-400/30 text-rose-200',
  }[normalized] || 'bg-white/5 border-white/15 text-white/75';

  return (
    <div>
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">Status</p>
      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm border text-[12px] font-semibold tracking-wide capitalize ${tone}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
        {normalized}
      </span>
    </div>
  );
}

function buildAdminHref(filters, page) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.sort && filters.sort !== 'desc') params.set('sort', filters.sort);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/admin?${query}` : '/admin';
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function toIsoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

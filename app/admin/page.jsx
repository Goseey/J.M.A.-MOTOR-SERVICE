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
  Trash2,
} from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import AdminShell from '@/components/AdminShell';
import AdminQuickEntryForm from '@/components/AdminQuickEntryForm';
import AdminRequestMessage from '@/components/AdminRequestMessage';
import { getAdminServiceRequests, normalizeAdminQuery } from '@/lib/admin';
import { getAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { deleteServiceRequest, insertServiceRequest, isDbConfigured } from '@/lib/db';
import { makeT } from '@/lib/i18n';

export default async function AdminPage({ searchParams }) {
  const filters = normalizeAdminQuery(await searchParams);
  const cookieStore = await cookies();
  const admin = await getAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!admin) {
    const params = new URLSearchParams();
    if (filters.lang === 'so') params.set('lang', 'so');
    params.set('next', '/admin');
    redirect(`/admin/login?${params.toString()}`);
  }

  const data = await getAdminServiceRequests(filters);
  const t = makeT(filters.lang || 'en');

  const rangeStart = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const rangeEnd = data.total === 0 ? 0 : Math.min(data.page * data.pageSize, data.total);

  async function createAdminEntryAction(prevState, formData) {
    'use server';

    const cookieStore = await cookies();
    const currentAdmin = await getAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
    if (!currentAdmin) redirect('/admin/login?next=/admin');

    const values = {
      customer_name: String(formData.get('customer_name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      car_make_model: String(formData.get('car_make_model') || '').trim(),
      service_needed: String(formData.get('service_needed') || '').trim(),
      preferred_date: String(formData.get('preferred_date') || '').trim(),
      message: String(formData.get('message') || '').trim(),
    };

    if (!isDbConfigured()) {
      return { ok: false, error: t('admin.db.notConfigured'), values };
    }

    if (!values.customer_name || !values.phone || !values.car_make_model || !values.service_needed) {
      return { ok: false, error: t('admin.journal.errors.generic'), values };
    }

    try {
      await insertServiceRequest({
        ...values,
        email: values.email || null,
        preferred_date: values.preferred_date || null,
        message: values.message || null,
        selected_language: filters.lang || 'en',
        source: 'admin',
        created_by_admin_id: currentAdmin.id,
      });
    } catch (error) {
      console.error('[admin] Failed to create admin entry:', error?.message || error);
      return { ok: false, error: t('admin.journal.errors.generic'), values };
    }

    revalidatePath('/admin');
    return { ok: true, error: '', values: {} };
  }

  async function deleteRequestAction(formData) {
    'use server';

    const cookieStore = await cookies();
    const currentAdmin = await getAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
    if (!currentAdmin) redirect('/admin/login?next=/admin');

    const id = String(formData.get('id') || '').trim();
    if (!id || !isDbConfigured()) return;

    try {
      await deleteServiceRequest(id);
      revalidatePath('/admin');
    } catch (error) {
      console.error('[admin] Failed to delete service request:', error?.message || error);
    }
  }

  return (
    <AdminShell>
      <section id="overview" className="bg-ink-950 border-b border-white/10" data-testid="admin-page-shell">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-10 sm:py-12">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-8 bg-gold-400" />
                  <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="admin-overline">
                    {t('admin.overline')}
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="admin-headline">
                  {t('admin.headline')}
                </h1>
                <p className="mt-4 text-white/65 leading-relaxed max-w-2xl" data-testid="admin-subtext">
                  {t('admin.description')}
                </p>
              </div>

              <StatusBadge dbConfigured={data.dbConfigured} dbReachable={data.dbReachable} t={t} />
            </div>

            <AdminQuickEntryForm action={createAdminEntryAction} />
            <AdminFilters filters={filters} t={t} />
          </div>
        </div>
      </section>

      <section id="requests" className="bg-ink-900" data-testid="admin-table-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="text-sm text-white/55" data-testid="admin-results-count">
              {t('admin.stats.showingClients')}{' '}
              <span className="text-white font-semibold">{data.total}</span>{' '}
              {data.total === 1 ? t('admin.stats.clientSuffix') : t('admin.stats.clientsSuffix')}
            </div>
            <div className="text-sm text-white/45" data-testid="admin-default-sort-note">
              {t('admin.stats.defaultOrder')}
            </div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-hidden bg-ink-950 shadow-ring" data-testid="admin-table-wrap">
            <div className="hidden lg:grid grid-cols-[1fr_1.25fr_1.05fr_1.2fr_0.85fr_0.9fr_0.95fr_88px] gap-4 px-5 py-4 border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-widest2 text-white/40">
              <span>{t('admin.table.requestId')}</span>
              <span>{t('admin.table.client')}</span>
              <span>{t('admin.table.phone')}</span>
              <span>{t('admin.table.vehicleService')}</span>
              <span>{t('admin.table.status')}</span>
              <span>{t('admin.table.preferred')}</span>
              <span>{t('admin.table.submitted')}</span>
              <span className="text-right">{t('admin.actions.delete')}</span>
            </div>

            {data.items.length > 0 ? (
              <div className="divide-y divide-white/10">
                {data.items.map((request) => (
                  <article
                    key={request.id}
                    className="grid lg:grid-cols-[1fr_1.25fr_1.05fr_1.2fr_0.85fr_0.9fr_0.95fr_88px] gap-4 px-5 py-5 bg-ink-950/60 hover:bg-white/[0.02] transition-colors"
                    data-testid={`admin-row-${request.id}`}
                  >
                    <Cell
                      label={t('admin.table.requestId')}
                      primary={request.id}
                      secondary={request.selected_language === 'so' ? t('admin.table.somali') : t('admin.table.english')}
                    />
                    <ClientCell
                      label={t('admin.table.client')}
                      primary={request.customer_name}
                      secondary={request.email || null}
                      message={request.message}
                      source={request.source}
                      t={t}
                    />
                    <Cell label={t('admin.table.phone')} primary={request.phone} />
                    <Cell label={t('admin.table.vehicleService')} primary={request.car_make_model} secondary={request.service_needed} />
                    <StatusCell status={request.status} t={t} />
                    <Cell label={t('admin.table.preferred')} primary={request.preferred_date ? formatDate(request.preferred_date) : t('admin.table.notSpecified')} />
                    <Cell label={t('admin.table.submitted')} primary={formatDateTime(request.created_at)} secondary={toIsoDate(request.created_at)} />
                    <DeleteCell id={request.id} action={deleteRequestAction} t={t} />
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState dbConfigured={data.dbConfigured} dbReachable={data.dbReachable} t={t} />
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 border-t border-white/10 bg-white/[0.02]" data-testid="admin-table-footer">
              <div className="text-sm text-white/55" data-testid="admin-footer-summary">
                {data.total > 0 ? (
                  <>
                    {t('admin.stats.footerShowing')}{' '}
                    <span className="text-white font-semibold">{rangeStart}-{rangeEnd}</span>{' '}
                    {t('admin.stats.of')}{' '}
                    <span className="text-white font-semibold">{data.total}</span>{' '}
                    {data.total === 1 ? t('admin.stats.clientSuffix') : t('admin.stats.clientsSuffix')}
                  </>
                ) : (
                  <>
                    {t('admin.stats.footerShowing')}{' '}
                    <span className="text-white font-semibold">0</span>{' '}
                    {t('admin.stats.of')}{' '}
                    <span className="text-white font-semibold">0</span>{' '}
                    {t('admin.stats.clientsSuffix')}
                  </>
                )}
              </div>

              <Pagination filters={filters} page={data.page} totalPages={data.totalPages} t={t} />
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function AdminFilters({ filters, t }) {
  return (
    <form method="get" className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[minmax(280px,1.2fr)_minmax(320px,1fr)_minmax(220px,220px)_minmax(220px,220px)_auto]" data-testid="admin-filters-bar">
      <label className="flex h-14 items-center gap-3 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid="admin-search-field">
        <Search className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.9} />
        <input
          type="text"
          name="q"
          defaultValue={filters.q}
          placeholder={t('admin.filters.searchPlaceholder')}
          className="w-full bg-transparent border-0 outline-none text-[14px] text-white placeholder:text-white/30"
          data-testid="admin-search-input"
        />
      </label>

      <label className="flex h-14 items-center gap-3 px-4 py-2 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid="admin-sort-field">
        <ListFilter className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.9} />
        <select
          name="sort"
          defaultValue={filters.sort}
          className="w-full min-w-0 bg-transparent border-0 outline-none text-[14px] text-white cursor-pointer"
          data-testid="admin-sort-select"
        >
          <option value="desc" className="bg-ink-900 text-white">{t('admin.filters.newest')}</option>
          <option value="asc" className="bg-ink-900 text-white">{t('admin.filters.oldest')}</option>
        </select>
        {filters.sort === 'desc' ? (
          <ArrowDownAZ className="h-4 w-4 text-white/40 shrink-0" strokeWidth={1.8} />
        ) : (
          <ArrowUpAZ className="h-4 w-4 text-white/40 shrink-0" strokeWidth={1.8} />
        )}
      </label>

      <DateField label={t('admin.filters.dateFrom')} name="from" value={filters.from} testid="admin-date-from" />
      <DateField label={t('admin.filters.dateTo')} name="to" value={filters.to} testid="admin-date-to" />

      <div className="flex h-14 flex-wrap gap-3 xl:flex-nowrap">
        <button
          type="submit"
          className="inline-flex h-14 min-w-[132px] items-center justify-center gap-2 px-5 rounded-sm bg-gold-400 text-ink-950 font-semibold transition-colors shadow-gold hover:bg-gold-300"
          data-testid="admin-apply-filters"
        >
          <Search className="h-4 w-4" strokeWidth={1.9} /> {t('admin.filters.apply')}
        </button>
        <a
          href={`/admin${filters.lang === 'so' ? '?lang=so' : ''}`}
          className="inline-flex h-14 min-w-[132px] items-center justify-center gap-2 px-5 rounded-sm border border-white/10 bg-ink-900 text-white/80 transition-colors hover:border-white/20 hover:bg-ink-800 hover:text-white"
          data-testid="admin-reset-filters"
        >
          <RotateCcw className="h-4 w-4 text-gold-300" strokeWidth={1.9} />
          {t('admin.filters.reset')}
        </a>
      </div>
    </form>
  );
}

function DateField({ label, name, value, testid }) {
  return (
    <label className="flex h-14 items-center gap-3 px-4 py-2 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid={testid}>
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

function Pagination({ filters, page, totalPages, t }) {
  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid="admin-pagination">
      <PageLink disabled={page === 1} href={buildAdminHref(filters, Math.max(1, page - 1))} testid="admin-pagination-prev">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.9} /> {t('admin.pagination.prev')}
      </PageLink>

      <div className="inline-flex items-center gap-2 px-3 min-h-10 rounded-sm border border-white/10 bg-ink-900 text-sm text-white/70" data-testid="admin-pagination-state">
        {t('admin.pagination.page')} <span className="text-white font-semibold">{page}</span> {t('admin.pagination.of')} <span className="text-white font-semibold">{totalPages}</span>
      </div>

      <PageLink disabled={page >= totalPages} href={buildAdminHref(filters, Math.min(totalPages, page + 1))} testid="admin-pagination-next">
        {t('admin.pagination.next')} <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
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

function StatusBadge({ dbConfigured, dbReachable, t }) {
  if (!dbConfigured) {
    return (
      <div className="inline-flex max-w-full items-start gap-3 px-4 py-3 rounded-sm border border-gold-400/20 bg-gold-400/10 text-gold-100" data-testid="admin-db-note">
        <Database className="h-4 w-4 text-gold-300" strokeWidth={1.8} />
        <span className="text-[13px] leading-relaxed break-words">{t('admin.db.notConfigured')}</span>
      </div>
    );
  }

  if (!dbReachable) {
    return (
      <div className="inline-flex max-w-full items-start gap-3 px-4 py-3 rounded-sm border border-amber-400/20 bg-amber-400/10 text-amber-100" data-testid="admin-db-note">
        <Database className="h-4 w-4 text-amber-300" strokeWidth={1.8} />
        <span className="text-[13px] leading-relaxed break-words">{t('admin.db.notReachable')}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 px-4 py-3 rounded-sm border border-emerald-400/20 bg-emerald-400/10 text-emerald-100" data-testid="admin-db-note">
      <Database className="h-4 w-4 text-emerald-300" strokeWidth={1.8} />
      <span className="text-[13px] leading-relaxed break-words">{t('admin.db.connected')}</span>
    </div>
  );
}

function EmptyState({ dbConfigured, dbReachable, t }) {
  let title = t('admin.empty.noRequests');
  let text = t('admin.empty.clearFilters');

  if (!dbConfigured) {
    title = t('admin.empty.dbNotConfiguredTitle');
    text = t('admin.empty.dbNotConfiguredText');
  } else if (!dbReachable) {
    title = t('admin.empty.dbNotReachableTitle');
    text = t('admin.empty.dbNotReachableText');
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

function ClientCell({ label, primary, secondary, message, source, t }) {
  const hasMessage = typeof message === 'string' && message.trim().length > 0;
  const sourceLabel = source === 'admin' ? t('admin.table.adminEntry') : t('admin.table.websiteEntry');
  const sourceTone = source === 'admin'
    ? 'border-gold-400/25 bg-gold-400/10 text-gold-200'
    : 'border-sky-400/20 bg-sky-400/10 text-sky-100';

  return (
    <div className="min-w-0">
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{label}</p>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-white/85 leading-relaxed break-words">{primary}</p>
          {secondary && <p className="mt-1 text-[12px] text-white/45 break-words">{secondary}</p>}
          <div className="mt-2">
            <span className={`inline-flex items-center rounded-sm border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${sourceTone}`}>
              {sourceLabel}
            </span>
          </div>
        </div>

        {hasMessage && (
          <div className="hidden lg:block shrink-0">
            <AdminRequestMessage message={message} compact />
          </div>
        )}
      </div>

      {hasMessage && (
        <div className="mt-3 lg:hidden">
          <AdminRequestMessage message={message} />
        </div>
      )}
    </div>
  );
}

function DeleteCell({ id, action, t }) {
  return (
    <div className="lg:text-right">
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{t('admin.actions.delete')}</p>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-rose-400/20 bg-rose-500/10 text-rose-200 transition-colors hover:border-rose-400/40 hover:bg-rose-500/15"
          data-testid={`admin-delete-${id}`}
          title={t('admin.actions.delete')}
        >
          <Trash2 className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </form>
    </div>
  );
}

function StatusCell({ status, t }) {
  const normalized = String(status || 'new').toLowerCase();
  const tone = {
    new: 'bg-sky-500/10 border-sky-400/30 text-sky-200',
    stale: 'bg-zinc-500/10 border-zinc-400/30 text-zinc-200',
    contacted: 'bg-amber-500/10 border-amber-400/30 text-amber-200',
    confirmed: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200',
    completed: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200',
    cancelled: 'bg-rose-500/10 border-rose-400/30 text-rose-200',
  }[normalized] || 'bg-white/5 border-white/15 text-white/75';

  return (
    <div>
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{t('admin.table.status')}</p>
      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm border text-[12px] font-semibold tracking-wide capitalize ${tone}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
        {t(`admin.statusLabels.${normalized}`)}
      </span>
    </div>
  );
}

function buildAdminHref(filters, page) {
  const params = new URLSearchParams();
  if (filters.lang === 'so') params.set('lang', 'so');
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

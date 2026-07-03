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
import AdminAutoSubmitFilters from '@/components/AdminAutoSubmitFilters';
import AdminQuickEntryForm from '@/components/AdminQuickEntryForm';
import AdminRequestMessage from '@/components/AdminRequestMessage';
import AdminUpdateRequestButton from '@/components/AdminUpdateRequestButton';
import { getAdminServiceRequests, normalizeAdminQuery } from '@/lib/admin';
import { getAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/admin-auth';
import { deleteServiceRequest, insertServiceRequest, isDbConfigured, updateServiceRequest, updateServiceRequestAdminNote } from '@/lib/db';
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
  const lang = filters.lang || 'en';
  const t = makeT(lang);

  const rangeStart = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const rangeEnd = data.total === 0 ? 0 : Math.min(data.page * data.pageSize, data.total);

  async function createAdminEntryAction(prevState, formData) {
    'use server';

    // Server action: creates an internal admin-side request row that lives in the
    // same timeline as public website bookings.

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
      return { ok: false, errorKey: 'admin.db.notConfigured', values };
    }

    if (!values.customer_name || !values.phone || !values.car_make_model || !values.service_needed) {
      return { ok: false, errorKey: 'admin.journal.errors.generic', values };
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
      return { ok: false, errorKey: 'admin.journal.errors.generic', values };
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

  async function updateRequestAction(prevState, formData) {
    'use server';

    // Server action: updates an existing request and optionally triggers a
    // customer-facing date-change email when the preferred date changed.

    const cookieStore = await cookies();
    const currentAdmin = await getAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
    if (!currentAdmin) redirect('/admin/login?next=/admin');

    const id = String(formData.get('id') || '').trim();
    const previousPreferredDate = String(formData.get('previous_preferred_date') || '').trim();
    const values = {
      id,
      customer_name: String(formData.get('customer_name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      car_make_model: String(formData.get('car_make_model') || '').trim(),
      service_needed: String(formData.get('service_needed') || '').trim(),
      preferred_date: String(formData.get('preferred_date') || '').trim(),
      message: String(formData.get('message') || '').trim(),
      status: String(formData.get('status') || 'new').trim().toLowerCase(),
      selected_language: String(formData.get('selected_language') || 'en') === 'so' ? 'so' : 'en',
    };

    if (!id || !isDbConfigured()) {
      return { ok: false, errorKey: 'admin.journal.errors.generic', values };
    }

    if (!values.customer_name || !values.phone || !values.car_make_model || !values.service_needed) {
      return { ok: false, errorKey: 'admin.journal.errors.generic', values };
    }

    try {
      const updated = await updateServiceRequest(id, {
        customer_name: values.customer_name,
        phone: values.phone,
        email: values.email || null,
        car_make_model: values.car_make_model,
        service_needed: values.service_needed,
        preferred_date: values.preferred_date || null,
        message: values.message || null,
        admin_note: String(formData.get('admin_note') || '').trim() || null,
        status: values.status,
      });

      const dateChanged = (previousPreferredDate || '') !== (values.preferred_date || '');
      if (updated && dateChanged && updated.email && process.env.RESEND_API_KEY) {
        await sendBookingUpdateEmail({ ...updated, selected_language: values.selected_language });
      }
    } catch (error) {
      console.error('[admin] Failed to update service request:', error?.message || error);
      return { ok: false, errorKey: 'admin.journal.errors.generic', values };
    }

    revalidatePath('/admin');
    return { ok: true, error: '', values: {} };
  }

  async function updateAdminNoteAction(prevState, formData) {
    'use server';

    // Server action: stores internal notes separately from the customer message.

    const cookieStore = await cookies();
    const currentAdmin = await getAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
    if (!currentAdmin) redirect('/admin/login?next=/admin');

    const id = String(formData.get('id') || '').trim();
    const adminNote = String(formData.get('admin_note') || '').trim();

    if (!id || !isDbConfigured()) {
      return { ok: false, errorKey: 'admin.notes.errors.save', value: adminNote };
    }

    try {
      const result = await updateServiceRequestAdminNote(id, adminNote || null);
      if (!result.supported) {
        return { ok: false, errorKey: 'admin.notes.errors.schema', value: adminNote };
      }
    } catch (error) {
      console.error('[admin] Failed to update admin note:', error?.message || error);
      return { ok: false, errorKey: 'admin.notes.errors.save', value: adminNote };
    }

    revalidatePath('/admin');
    return { ok: true, error: '', value: adminNote };
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

            <AdminControls filters={filters} t={t} total={data.total} createAction={createAdminEntryAction} />
          </div>
        </div>
      </section>

      <section id="requests" className="bg-ink-900" data-testid="admin-table-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-8 sm:py-10">
          <div className="border border-white/10 rounded-sm overflow-hidden bg-ink-950 shadow-ring" data-testid="admin-table-wrap">
            <div className="hidden lg:grid grid-cols-[1.02fr_1.35fr_0.95fr_1.1fr_0.78fr_0.82fr_0.92fr_84px_64px_64px] gap-4 px-5 py-4 border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-widest2 text-white/40">
              <span>{t('admin.table.requestId')}</span>
              <span>{t('admin.table.client')}</span>
              <span>{t('admin.table.phone')}</span>
              <span>{t('admin.table.vehicleService')}</span>
              <span>{t('admin.table.status')}</span>
              <span>{t('admin.table.preferred')}</span>
              <span>{t('admin.table.submitted')}</span>
              <span className="text-right">{t('admin.table.notes')}</span>
              <span className="text-right">{t('admin.actions.update')}</span>
              <span className="text-right">{t('admin.actions.delete')}</span>
            </div>

            {data.items.length > 0 ? (
              <div className="divide-y divide-white/10">
                {data.items.map((request) => (
                  <article
                    key={request.id}
                    className="grid lg:grid-cols-[1.02fr_1.35fr_0.95fr_1.1fr_0.78fr_0.82fr_0.92fr_84px_64px_64px] gap-4 px-5 py-5 bg-ink-950/60 hover:bg-white/[0.02] transition-colors"
                    data-testid={`admin-row-${request.id}`}
                  >
                    <Cell
                      label={t('admin.table.requestId')}
                      primary={formatShortRequestId(request.id)}
                      primaryTitle={request.id}
                      secondary={request.selected_language === 'so' ? t('admin.table.somali') : t('admin.table.english')}
                    />
                    <ClientCell
                      label={t('admin.table.client')}
                      primary={request.customer_name}
                      secondary={request.email || null}
                      request={request}
                      action={updateAdminNoteAction}
                      source={request.source}
                      t={t}
                    />
                    <Cell label={t('admin.table.phone')} primary={request.phone} />
                    <Cell label={t('admin.table.vehicleService')} primary={request.car_make_model} secondary={request.service_needed} />
                    <StatusCell status={request.status} t={t} />
                    <Cell label={t('admin.table.preferred')} primary={request.preferred_date ? formatDate(request.preferred_date) : t('admin.table.notSpecified')} />
                    <Cell label={t('admin.table.submitted')} primary={formatDateTime(request.created_at)} />
                    <NotesCell request={request} action={updateAdminNoteAction} t={t} />
                    <UpdateCell request={request} action={updateRequestAction} t={t} />
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

function AdminControls({ filters, t, total, createAction }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.02] p-4 sm:p-5" data-testid="admin-controls-panel">
      <form method="get" className="grid grid-cols-1 items-stretch gap-3 xl:grid-cols-[minmax(240px,1.15fr)_minmax(240px,1fr)_minmax(190px,0.8fr)_minmax(190px,0.8fr)_minmax(132px,148px)]" data-testid="admin-filters-bar">
        <AdminAutoSubmitFilters />
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

        <a
          href={`/admin${filters.lang === 'so' ? '?lang=so' : ''}`}
          className="inline-flex h-14 w-full min-w-0 items-center justify-center gap-2 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/80 transition-colors hover:border-white/20 hover:bg-ink-800 hover:text-white"
          data-testid="admin-reset-filters"
        >
          <RotateCcw className="h-4 w-4 text-gold-300" strokeWidth={1.9} />
          {t('admin.filters.reset')}
        </a>
      </form>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4" data-testid="admin-results-toolbar">
        <div className="text-sm text-white/55" data-testid="admin-results-count">
          {t('admin.stats.showingClients')}{' '}
          <span className="text-white font-semibold">{total}</span>{' '}
          {total === 1 ? t('admin.stats.clientSuffix') : t('admin.stats.clientsSuffix')}
        </div>

        <div className="flex items-center gap-3">
          <AdminQuickEntryForm action={createAction} />
        </div>
      </div>
    </div>
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

  return null;
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

function Cell({ label, primary, secondary, primaryTitle }) {
  return (
    <div className="min-w-0 overflow-hidden">
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{label}</p>
      <p className="text-[14px] text-white/85 leading-relaxed break-words [overflow-wrap:anywhere]" title={primaryTitle || primary}>{primary}</p>
      {secondary && <p className="mt-1 text-[12px] text-white/45 break-words [overflow-wrap:anywhere]">{secondary}</p>}
    </div>
  );
}

function ClientCell({ label, primary, secondary, request, action, source, t }) {
  const hasMessage = typeof request?.message === 'string' && request.message.trim().length > 0;
  const hasNote = typeof request?.admin_note === 'string' && request.admin_note.trim().length > 0;
  const sourceLabel = source === 'admin' ? t('admin.table.adminEntry') : t('admin.table.websiteEntry');
  const sourceTone = source === 'admin'
    ? 'border-gold-400/25 bg-gold-400/10 text-gold-200'
    : 'border-sky-400/20 bg-sky-400/10 text-sky-100';

  return (
    <div className="min-w-0">
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{label}</p>

      <div className="min-w-0">
        <p className="text-[14px] text-white/85 leading-relaxed break-words [overflow-wrap:anywhere]">{primary}</p>
        {secondary ? <p className="mt-1 text-[12px] text-white/45 break-words [overflow-wrap:anywhere]">{secondary}</p> : null}
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-flex items-center rounded-sm border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${sourceTone}`}>
            {sourceLabel}
          </span>
        </div>
      </div>

      {(hasMessage || hasNote) && (
        <div className="mt-3 lg:hidden">
          <AdminRequestMessage request={request} action={action} />
        </div>
      )}
    </div>
  );
}

function NotesCell({ request, action, t }) {
  return (
    <div className="lg:text-right">
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{t('admin.table.notes')}</p>
      <AdminRequestMessage request={request} action={action} compact indicatorMode="split" />
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

function UpdateCell({ request, action, t }) {
  return (
    <div className="lg:text-right">
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{t('admin.actions.update')}</p>
      <AdminUpdateRequestButton request={request} action={action} />
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

function formatShortRequestId(value) {
  const raw = String(value || '').trim();
  if (!raw) return '—';
  const compact = raw.replace(/-/g, '');
  return `#${compact.slice(-6).toUpperCase()}`;
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

async function sendBookingUpdateEmail(doc) {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
    const businessInbox = process.env.BUSINESS_EMAIL || 'info@jmamotorservice.ie';
    const customerEmail = doc.email?.trim();
    if (!customerEmail) return false;

    const isSomali = doc.selected_language === 'so';
    const subject = isSomali
      ? 'J.M.A. Motor Service — taariikhda codsigaaga waa la cusboonaysiiyay'
      : 'J.M.A. Motor Service — your booking date was updated';
    const heading = isSomali
      ? 'Taariikhda codsigaaga adeegga waa la beddelay'
      : 'Your service request date has been updated';
    const intro = isSomali
      ? 'Kooxdayadu waxay cusboonaysiiyeen taariikhda codsigaaga. Fadlan hoos ka eeg faahfaahinta cusub.'
      : 'Our team has updated the preferred date for your service request. Please review the updated details below.';
    const dateLabel = isSomali ? 'Taariikhda cusub' : 'Updated date';
    const serviceLabel = isSomali ? 'Adeeg' : 'Service';
    const carLabel = isSomali ? 'Baabuur' : 'Vehicle';
    const footer = isSomali
      ? 'Haddii aad qabto wax su’aalo ah, fadlan si toos ah nala soo xiriir.'
      : 'If you have any questions, please contact us directly.';

    await resend.emails.send({
      from,
      to: [customerEmail],
      subject,
      reply_to: businessInbox,
      html: `<div style="background:#050505;padding:32px 0;font-family:Arial,sans-serif;">
        <table role="presentation" width="600" align="center" cellspacing="0" cellpadding="0" style="background:#121212;border:1px solid #2a2a2a;border-radius:4px;">
          <tr><td style="padding:24px 24px 0 24px;">
            <div style="color:#D4AF37;font-size:12px;letter-spacing:0.25em;text-transform:uppercase;">J.M.A. Motor Service</div>
            <h1 style="color:#ffffff;font-size:22px;margin:8px 0 6px 0;">${heading}</h1>
            <p style="color:#a3a3a3;font-size:14px;line-height:1.6;margin:0 0 18px 0;">${intro}</p>
          </td></tr>
          <tr><td style="padding:0 12px 0 12px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #2a2a2a;">
              <tr><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font:13px Arial,sans-serif;width:180px;vertical-align:top;">${dateLabel}</td><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ffffff;font:14px Arial,sans-serif;">${formatDate(doc.preferred_date)}</td></tr>
              <tr><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font:13px Arial,sans-serif;width:180px;vertical-align:top;">${carLabel}</td><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ffffff;font:14px Arial,sans-serif;">${escapeHtml(doc.car_make_model || '—')}</td></tr>
              <tr><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#a3a3a3;font:13px Arial,sans-serif;width:180px;vertical-align:top;">${serviceLabel}</td><td style="padding:8px 12px;border-bottom:1px solid #2a2a2a;color:#ffffff;font:14px Arial,sans-serif;">${escapeHtml(doc.service_needed || '—')}</td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:22px 24px 24px 24px;">
            <p style="color:#d1d5db;font-size:13px;line-height:1.6;margin:0;">${footer}</p>
          </td></tr>
        </table>
      </div>`,
    });

    return true;
  } catch (error) {
    console.warn('[admin] Failed to send booking update email:', error?.message || error);
    return false;
  }
}

'use client';

import { useEffect, useMemo, useState } from 'react';
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

const PAGE_SIZE = 10;

const REQUESTS = [
  {
    id: 'REQ-24061',
    customer: 'John O\'Connor',
    phone: '085 123 4567',
    car: 'VW Golf 1.6 TDI, 2016',
    service: 'Full car service',
    status: 'New',
    preferredDate: '2026-06-27',
    submittedAt: '2026-06-25T09:14:00Z',
  },
  {
    id: 'REQ-24062',
    customer: 'Emma Doyle',
    phone: '087 555 1144',
    car: 'Toyota Yaris Hybrid, 2020',
    service: 'Pre-NCT check',
    status: 'Contacted',
    preferredDate: '2026-06-28',
    submittedAt: '2026-06-25T10:42:00Z',
  },
  {
    id: 'REQ-24063',
    customer: 'Patrick Byrne',
    phone: '083 222 0909',
    car: 'BMW 320d, 2018',
    service: 'Brake inspection and repair',
    status: 'Awaiting customer',
    preferredDate: '',
    submittedAt: '2026-06-24T12:08:00Z',
  },
  {
    id: 'REQ-24064',
    customer: 'Sarah Murphy',
    phone: '086 909 2211',
    car: 'Ford Focus, 2015',
    service: 'Car diagnostics',
    status: 'Booked',
    preferredDate: '2026-06-29',
    submittedAt: '2026-06-23T14:31:00Z',
  },
  {
    id: 'REQ-24065',
    customer: 'Michael Kelly',
    phone: '089 700 8888',
    car: 'Audi A4, 2017',
    service: 'General car repairs',
    status: 'New',
    preferredDate: '',
    submittedAt: '2026-06-22T16:03:00Z',
  },
  {
    id: 'REQ-24066',
    customer: 'Laura Quinn',
    phone: '085 811 2277',
    car: 'Skoda Octavia, 2019',
    service: 'Oil and filter change',
    status: 'Booked',
    preferredDate: '2026-06-30',
    submittedAt: '2026-06-21T08:45:00Z',
  },
  {
    id: 'REQ-24067',
    customer: 'Daniel Walsh',
    phone: '086 200 9911',
    car: 'Mercedes A-Class, 2021',
    service: 'Battery check and replacement',
    status: 'New',
    preferredDate: '',
    submittedAt: '2026-06-20T09:20:00Z',
  },
  {
    id: 'REQ-24068',
    customer: 'Ciara Nolan',
    phone: '085 677 4100',
    car: 'Nissan Qashqai, 2018',
    service: 'Suspension and steering',
    status: 'Contacted',
    preferredDate: '2026-06-26',
    submittedAt: '2026-06-19T11:12:00Z',
  },
  {
    id: 'REQ-24069',
    customer: 'Brian Lynch',
    phone: '087 311 2200',
    car: 'Peugeot 3008, 2017',
    service: 'Engine maintenance',
    status: 'Booked',
    preferredDate: '',
    submittedAt: '2026-06-18T13:41:00Z',
  },
  {
    id: 'REQ-24070',
    customer: 'Aoife Brennan',
    phone: '083 411 5500',
    car: 'Hyundai i30, 2016',
    service: 'Oil and filter change',
    status: 'New',
    preferredDate: '2026-06-25',
    submittedAt: '2026-06-17T15:06:00Z',
  },
  {
    id: 'REQ-24071',
    customer: 'Kevin Reilly',
    phone: '089 600 7722',
    car: 'Seat Leon, 2019',
    service: 'Car diagnostics',
    status: 'Awaiting customer',
    preferredDate: '',
    submittedAt: '2026-06-16T10:18:00Z',
  },
  {
    id: 'REQ-24072',
    customer: 'Niamh Farrell',
    phone: '085 902 3001',
    car: 'Renault Clio, 2015',
    service: 'General car repairs',
    status: 'Contacted',
    preferredDate: '2026-06-24',
    submittedAt: '2026-06-15T09:55:00Z',
  },
  {
    id: 'REQ-24073',
    customer: 'Thomas Keane',
    phone: '087 744 9002',
    car: 'Mazda 3, 2020',
    service: 'Pre-NCT check',
    status: 'Booked',
    preferredDate: '',
    submittedAt: '2026-06-14T12:33:00Z',
  },
  {
    id: 'REQ-24074',
    customer: 'Rachel Duffy',
    phone: '086 150 4403',
    car: 'Kia Sportage, 2018',
    service: 'Brake inspection and repair',
    status: 'New',
    preferredDate: '2026-06-23',
    submittedAt: '2026-06-13T14:47:00Z',
  },
  {
    id: 'REQ-24075',
    customer: 'Sean Power',
    phone: '083 500 8114',
    car: 'Opel Astra, 2014',
    service: 'Full car service',
    status: 'Contacted',
    preferredDate: '',
    submittedAt: '2026-06-12T08:29:00Z',
  },
];

export default function AdminPage() {
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = REQUESTS.filter((request) => {
      const matchesName = !normalizedQuery || request.customer.toLowerCase().includes(normalizedQuery);
      const submittedDate = request.submittedAt.slice(0, 10);
      const matchesFrom = !dateFrom || submittedDate >= dateFrom;
      const matchesTo = !dateTo || submittedDate <= dateTo;

      return matchesName && matchesFrom && matchesTo;
    });

    result.sort((a, b) => {
      const aTime = new Date(a.submittedAt).getTime();
      const bTime = new Date(b.submittedAt).getTime();
      return sortOrder === 'desc' ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [query, sortOrder, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, sortOrder, dateFrom, dateTo]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedRequests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRequests.slice(start, start + PAGE_SIZE);
  }, [filteredRequests, page]);

  const rangeStart = filteredRequests.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = filteredRequests.length === 0 ? 0 : Math.min(page * PAGE_SIZE, filteredRequests.length);

  const resetFilters = () => {
    setQuery('');
    setSortOrder('desc');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

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
                    Admin requests preview
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="admin-headline">
                  Service requests
                </h1>
                <p className="mt-4 text-white/65 leading-relaxed max-w-2xl" data-testid="admin-subtext">
                  Structural placeholder only: search, sort, pagination and date filtering are ready,
                  while the real data source will be connected later during the Neon/Postgres phase.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-sm border border-gold-400/20 bg-gold-400/10 text-gold-100" data-testid="admin-db-note">
                <Database className="h-4 w-4 text-gold-300" strokeWidth={1.8} />
                <span className="text-[13px] leading-relaxed">No live DB connected yet — mock data only.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_220px_200px_200px_auto] gap-3" data-testid="admin-filters-bar">
              <SearchField value={query} onChange={setQuery} />
              <SortField value={sortOrder} onChange={setSortOrder} />
              <DateField
                label="Date from"
                value={dateFrom}
                onChange={setDateFrom}
                testid="admin-date-from"
              />
              <DateField
                label="Date to"
                value={dateTo}
                onChange={setDateTo}
                testid="admin-date-to"
              />
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-sm border border-white/10 bg-ink-900 text-white/80 hover:text-white hover:border-white/20 hover:bg-ink-800 transition-colors"
                data-testid="admin-reset-filters"
              >
                <RotateCcw className="h-4 w-4 text-gold-300" strokeWidth={1.9} />
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink-900" data-testid="admin-table-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 py-8 sm:py-10">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="text-sm text-white/55" data-testid="admin-results-count">
              Showing <span className="text-white font-semibold">{filteredRequests.length}</span> client{filteredRequests.length === 1 ? '' : 's'}
            </div>
            <div className="text-sm text-white/45" data-testid="admin-default-sort-note">
              Default order: newest to oldest
            </div>
          </div>

          <div className="border border-white/10 rounded-sm overflow-hidden bg-ink-950 shadow-ring" data-testid="admin-table-wrap">
            <div className="hidden lg:grid grid-cols-[0.95fr_1.1fr_1.1fr_1.2fr_0.8fr_0.9fr_0.9fr] gap-4 px-5 py-4 border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-widest2 text-white/40">
              <span>Request ID</span>
              <span>Client</span>
              <span>Phone</span>
              <span>Vehicle / Service</span>
              <span>Status</span>
              <span>Preferred</span>
              <span>Submitted</span>
            </div>

            {paginatedRequests.length > 0 ? (
              <div className="divide-y divide-white/10">
                {paginatedRequests.map((request) => (
                  <article
                    key={request.id}
                    className="grid lg:grid-cols-[0.95fr_1.1fr_1.1fr_1.2fr_0.8fr_0.9fr_0.9fr] gap-4 px-5 py-5 bg-ink-950/60 hover:bg-white/[0.02] transition-colors"
                    data-testid={`admin-row-${request.id.toLowerCase()}`}
                  >
                    <Cell label="Request ID" primary={request.id} secondary="Website form" />
                    <Cell label="Client" primary={request.customer} />
                    <Cell label="Phone" primary={request.phone} />
                    <Cell label="Vehicle / Service" primary={request.car} secondary={request.service} />
                    <StatusCell status={request.status} />
                    <Cell label="Preferred" primary={request.preferredDate || 'Not specified'} />
                    <Cell label="Submitted" primary={formatDateTime(request.submittedAt)} secondary={request.submittedAt.slice(0, 10)} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-6 py-16 text-center" data-testid="admin-empty-state">
                <p className="font-display text-2xl font-semibold text-white">No requests found</p>
                <p className="mt-3 text-white/55 max-w-xl mx-auto leading-relaxed">
                  Try clearing the search or widening the date range. Once the real database is connected,
                  this area will display live service requests.
                </p>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 border-t border-white/10 bg-white/[0.02]" data-testid="admin-table-footer">
              <div className="text-sm text-white/55" data-testid="admin-footer-summary">
                {filteredRequests.length > 0 ? (
                  <>Showing <span className="text-white font-semibold">{rangeStart}-{rangeEnd}</span> of <span className="text-white font-semibold">{filteredRequests.length}</span> clients</>
                ) : (
                  <>Showing <span className="text-white font-semibold">0</span> of <span className="text-white font-semibold">0</span> clients</>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap" data-testid="admin-pagination">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/80 hover:text-white hover:border-white/20 hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  data-testid="admin-pagination-prev"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.9} /> Prev
                </button>

                <div className="inline-flex items-center gap-2 px-3 h-10 rounded-sm border border-white/10 bg-ink-900 text-sm text-white/70" data-testid="admin-pagination-state">
                  Page <span className="text-white font-semibold">{page}</span> of <span className="text-white font-semibold">{totalPages}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages || filteredRequests.length === 0}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/80 hover:text-white hover:border-white/20 hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  data-testid="admin-pagination-next"
                >
                  Next <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function SearchField({ value, onChange }) {
  return (
    <label className="flex items-center gap-3 h-12 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid="admin-search-field">
      <Search className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.9} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search client by name"
        className="w-full bg-transparent border-0 outline-none text-[14px] text-white placeholder:text-white/30"
        data-testid="admin-search-input"
      />
    </label>
  );
}

function SortField({ value, onChange }) {
  return (
    <label className="flex items-center gap-3 h-12 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid="admin-sort-field">
      <ListFilter className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.9} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-0 outline-none text-[14px] text-white cursor-pointer"
        data-testid="admin-sort-select"
      >
        <option value="desc" className="bg-ink-900 text-white">Newest to oldest</option>
        <option value="asc" className="bg-ink-900 text-white">Oldest to newest</option>
      </select>
      {value === 'desc' ? (
        <ArrowDownAZ className="h-4 w-4 text-white/40 shrink-0" strokeWidth={1.8} />
      ) : (
        <ArrowUpAZ className="h-4 w-4 text-white/40 shrink-0" strokeWidth={1.8} />
      )}
    </label>
  );
}

function DateField({ label, value, onChange, testid }) {
  return (
    <label className="flex items-center gap-3 h-12 px-4 rounded-sm border border-white/10 bg-ink-900 text-white/75 focus-within:border-gold-400/60 focus-within:bg-ink-800 transition-colors" data-testid={testid}>
      <CalendarDays className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.9} />
      <div className="min-w-0 w-full">
        <div className="text-[10px] uppercase tracking-widest2 text-white/35">{label}</div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border-0 outline-none text-[14px] text-white"
          data-testid={`${testid}-input`}
        />
      </div>
    </label>
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
  const tone = {
    New: 'bg-sky-500/10 border-sky-400/30 text-sky-200',
    Contacted: 'bg-amber-500/10 border-amber-400/30 text-amber-200',
    Booked: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200',
    'Awaiting customer': 'bg-violet-500/10 border-violet-400/30 text-violet-200',
  }[status] || 'bg-white/5 border-white/15 text-white/75';

  return (
    <div>
      <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">Status</p>
      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm border text-[12px] font-semibold tracking-wide ${tone}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
        {status}
      </span>
    </div>
  );
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

import {
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Database,
  FileClock,
  Filter,
  HardDriveUpload,
  LayoutDashboard,
  MessageSquare,
  Phone,
  Search,
  Shield,
  Wrench,
} from 'lucide-react';
import AdminShell from '@/components/AdminShell';
import { BUSINESS } from '@/lib/business';

export const metadata = {
  title: `Admin Preview | ${BUSINESS.name}`,
  description: 'Internal admin preview page for J.M.A. Motor Service.',
  robots: {
    index: false,
    follow: false,
  },
};

const KPIS = [
  {
    label: 'New requests today',
    value: '12',
    note: 'Preview metric only',
    icon: Bell,
  },
  {
    label: 'Awaiting callback',
    value: '5',
    note: 'Needs workflow wiring later',
    icon: Phone,
  },
  {
    label: 'Booked in',
    value: '7',
    note: 'Placeholder pipeline state',
    icon: CalendarClock,
  },
  {
    label: 'Average response time',
    value: '18m',
    note: 'Static demo figure',
    icon: Clock3,
  },
];

const REQUESTS = [
  {
    id: 'REQ-24061',
    customer: 'John O\'Connor',
    phone: '085 123 4567',
    car: 'VW Golf 1.6 TDI, 2016',
    service: 'Full car service',
    status: 'New',
    preferredDate: '2026-06-27',
    createdAt: 'Today · 09:14',
  },
  {
    id: 'REQ-24062',
    customer: 'Emma Doyle',
    phone: '087 555 1144',
    car: 'Toyota Yaris Hybrid, 2020',
    service: 'Pre-NCT check',
    status: 'Contacted',
    preferredDate: '2026-06-28',
    createdAt: 'Today · 10:42',
  },
  {
    id: 'REQ-24063',
    customer: 'Patrick Byrne',
    phone: '083 222 0909',
    car: 'BMW 320d, 2018',
    service: 'Brake inspection and repair',
    status: 'Awaiting customer',
    preferredDate: 'Flexible',
    createdAt: 'Today · 12:08',
  },
  {
    id: 'REQ-24064',
    customer: 'Sarah Murphy',
    phone: '086 909 2211',
    car: 'Ford Focus, 2015',
    service: 'Car diagnostics',
    status: 'Booked',
    preferredDate: '2026-06-29',
    createdAt: 'Today · 14:31',
  },
  {
    id: 'REQ-24065',
    customer: 'Michael Kelly',
    phone: '089 700 8888',
    car: 'Audi A4, 2017',
    service: 'General car repairs',
    status: 'New',
    preferredDate: 'ASAP',
    createdAt: 'Today · 16:03',
  },
];

const PIPELINE = [
  { title: 'Inbox', count: 5, description: 'Fresh service requests from the website form.' },
  { title: 'Contacted', count: 3, description: 'Customers reached, waiting on confirmation.' },
  { title: 'Booked', count: 4, description: 'Confirmed for workshop intake or inspection.' },
  { title: 'Done', count: 9, description: 'Completed jobs to be sourced from Postgres later.' },
];

const FUTURE_STACK = [
  {
    title: 'Neon Postgres integration',
    body: 'This page is intentionally UI-first. Data wiring can later plug into Neon/Postgres without redesigning the screen architecture.',
    icon: Database,
  },
  {
    title: 'Server actions or route handlers',
    body: 'Filtering, pagination and lead updates can live behind a secure admin layer once persistence is ready.',
    icon: HardDriveUpload,
  },
  {
    title: 'Auth & audit trail',
    body: 'Next pass should add admin auth, role checks and action history before this becomes operational.',
    icon: Shield,
  },
];

export default function AdminPage() {
  return (
    <AdminShell>
      <section className="relative isolate overflow-hidden min-h-[72svh] flex items-center pt-16 pb-16 sm:pt-24 sm:pb-20">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 grain"
          style={{
            background:
              'radial-gradient(70% 60% at 50% 40%, #1a1a1d 0%, #0a0a0b 55%, #050505 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(212,175,55,0.4) 0 1px, transparent 1px 80px), linear-gradient(-45deg, rgba(212,175,55,0.25) 0 1px, transparent 1px 80px)',
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950 via-ink-950/90 to-ink-900" />
        <div className="absolute right-[8%] top-[18%] w-48 h-48 headlight animate-headlight" aria-hidden="true" />
        <div className="absolute left-[10%] bottom-[8%] w-36 h-36 headlight animate-headlight" style={{ animationDelay: '0.8s' }} aria-hidden="true" />
        <div className="light-sweep" aria-hidden="true" />
        <div className="smoke" aria-hidden="true" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7 max-w-4xl">
              <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
                <span className="h-px w-8 bg-gold-400" />
                <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="admin-hero-overline">
                  Internal dashboard preview
                </span>
              </div>

              <h1
                data-testid="admin-hero-headline"
                className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-extrabold leading-[1.02] tracking-tight animate-fade-up"
                style={{ animationDelay: '220ms' }}
              >
                Admin panel <span className="text-metal-gold">placeholder</span>
                <br className="hidden sm:block" /> for future workshop operations
              </h1>

              <p
                data-testid="admin-hero-subtext"
                className="mt-6 max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed animate-fade-up"
                style={{ animationDelay: '360ms' }}
              >
                Raw UI only for now — same premium visual language as the landing page,
                but intentionally detached from MongoDB while we prepare the move to Neon Postgres.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '480ms' }}>
                <a
                  href="#requests"
                  data-testid="admin-hero-open-requests"
                  className="inline-flex items-center gap-2 h-12 px-6 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold tracking-wide rounded-sm transition-colors shadow-gold"
                >
                  <LayoutDashboard className="h-4 w-4" strokeWidth={2.2} /> Open Preview
                </a>
                <a
                  href="#stack"
                  data-testid="admin-hero-future-stack"
                  className="inline-flex items-center gap-2 h-12 px-6 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold tracking-wide rounded-sm transition-colors"
                >
                  <Database className="h-4 w-4" strokeWidth={2} /> Future Stack
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 sm:p-7 rounded-sm animate-fade-up" style={{ animationDelay: '600ms' }} data-testid="admin-hero-note">
                <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-12 w-px bg-gradient-to-b from-gold-400/60 to-transparent" />
                <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 w-12 h-px bg-gradient-to-l from-gold-400/60 to-transparent" />
                <p className="text-[11px] uppercase tracking-widest2 text-white/45">Current scope</p>
                <h2 className="mt-3 font-display text-2xl font-semibold text-white">Styled shell, sample leads, future-ready layout.</h2>
                <p className="mt-4 text-[14px] text-white/65 leading-relaxed">
                  No live database reads, no write actions, no auth layer yet. This is a clean visual foundation
                  that can later be connected to secure Postgres-backed admin workflows.
                </p>
                <div className="mt-6 flex items-center gap-3 text-[13px] text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-gold-300" />
                  Matches the landing page design system.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="overview" className="relative py-24 sm:py-28 bg-ink-950" data-testid="admin-overview-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold-400" />
            <span className="text-[11px] uppercase tracking-widest2 text-gold-300">Overview</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-white/[0.05] rounded-sm overflow-hidden">
            {KPIS.map(({ icon: Icon, label, value, note }) => (
              <article key={label} className="group relative bg-ink-900 hover:bg-ink-800 p-6 sm:p-7 transition-colors duration-500 min-h-[180px]" data-testid={`admin-kpi-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="icon-plate inline-flex items-center justify-center h-11 w-11 rounded-sm text-gold-300">
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest2 text-white/30">Demo</span>
                </div>
                <div className="mt-8">
                  <p className="font-display text-4xl font-bold text-white">{value}</p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-white tracking-tight">{label}</h3>
                  <p className="mt-2 text-[13px] text-white/55 leading-relaxed">{note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="requests" className="relative py-24 sm:py-28 bg-ink-900" data-testid="admin-requests-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-gold-400" />
                <span className="text-[11px] uppercase tracking-widest2 text-gold-300">Requests</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                Lead inbox preview in the <span className="text-metal-gold">same visual language</span>.
              </h2>
              <p className="mt-5 text-white/65 max-w-2xl leading-relaxed">
                These are placeholder rows only. The goal here is to lock the screen structure now,
                so we can later swap in real Postgres data without redesigning the admin flow.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 lg:min-w-[360px]">
              <ControlPill icon={Search} label="Search by customer / car" />
              <ControlPill icon={Filter} label="Filter by status" />
            </div>
          </div>

          <div className="mt-12 border border-white/10 bg-ink-950/65 backdrop-blur-md rounded-sm overflow-hidden shadow-ring" data-testid="admin-requests-table-wrap">
            <div className="hidden xl:grid grid-cols-[1.1fr_1fr_1.1fr_1fr_0.8fr_0.9fr_0.9fr] gap-4 px-6 py-4 border-b border-white/10 text-[11px] uppercase tracking-widest2 text-white/40 bg-white/[0.02]">
              <span>Customer</span>
              <span>Phone</span>
              <span>Vehicle</span>
              <span>Service</span>
              <span>Status</span>
              <span>Preferred</span>
              <span>Received</span>
            </div>

            <div className="divide-y divide-white/10">
              {REQUESTS.map((request) => (
                <article
                  key={request.id}
                  className="grid xl:grid-cols-[1.1fr_1fr_1.1fr_1fr_0.8fr_0.9fr_0.9fr] gap-4 px-5 sm:px-6 py-5 bg-ink-950/40 hover:bg-white/[0.02] transition-colors"
                  data-testid={`admin-request-${request.id.toLowerCase()}`}
                >
                  <InfoBlock label="Customer" value={request.customer} subvalue={request.id} />
                  <InfoBlock label="Phone" value={request.phone} />
                  <InfoBlock label="Vehicle" value={request.car} />
                  <InfoBlock label="Service" value={request.service} />
                  <StatusBlock status={request.status} />
                  <InfoBlock label="Preferred" value={request.preferredDate} />
                  <InfoBlock label="Received" value={request.createdAt} />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pipeline" className="relative py-24 sm:py-28 bg-ink-950" data-testid="admin-pipeline-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                <span className="h-px w-8 bg-gold-400" />
                <span className="text-[11px] uppercase tracking-widest2 text-gold-300">Pipeline</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                From website lead to <span className="text-white/55">workshop intake</span>.
              </h2>
              <p className="mt-5 text-white/65 leading-relaxed max-w-md">
                This section sketches the operational rhythm for future admin tooling:
                incoming request, callback, booking, then completed job history.
              </p>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-white/[0.04] rounded-sm overflow-hidden">
              {PIPELINE.map((item, index) => (
                <article key={item.title} className="bg-ink-800/80 hover:bg-ink-700/80 p-6 sm:p-7 transition-colors duration-500" data-testid={`admin-pipeline-${item.title.toLowerCase()}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-widest2 text-white/35">0{index + 1}</span>
                    <span className="inline-flex items-center justify-center min-w-11 h-11 px-3 rounded-sm border border-gold-400/25 bg-gold-400/10 text-gold-200 font-display text-xl font-semibold">
                      {item.count}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-white">{item.title}</h3>
                  <p className="mt-3 text-[14px] text-white/60 leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="stack" className="relative py-24 sm:py-28 bg-ink-900" data-testid="admin-stack-section">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-gold-400" />
              <span className="text-[11px] uppercase tracking-widest2 text-gold-300">Future Stack</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Built now as a <span className="text-metal-gold">clean shell</span> for Neon/Postgres later.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/[0.05] rounded-sm overflow-hidden">
            {FUTURE_STACK.map(({ title, body, icon: Icon }) => (
              <article key={title} className="bg-ink-900 hover:bg-ink-800 p-7 sm:p-8 transition-colors duration-500 min-h-[240px]" data-testid={`admin-future-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                <div className="icon-plate inline-flex items-center justify-center h-12 w-12 rounded-sm text-gold-300">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-3 text-[14px] text-white/60 leading-relaxed">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 p-6 sm:p-7 border border-white/10 bg-white/[0.02] rounded-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5" data-testid="admin-next-step-note">
            <div>
              <p className="text-[11px] uppercase tracking-widest2 text-white/45">Next implementation phase</p>
              <p className="mt-2 text-white/75 leading-relaxed max-w-3xl">
                When you are ready for the Neon migration, we can wire this page to real tables,
                add secure auth, build request detail views and convert the static controls into working admin actions.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-gold-300 font-semibold whitespace-nowrap">
              <Wrench className="h-4 w-4" /> UI ready for backend phase
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

function ControlPill({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-3 h-12 px-4 border border-white/10 bg-white/[0.02] rounded-sm text-white/65" data-testid={`admin-control-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
      <Icon className="h-4 w-4 text-gold-300" strokeWidth={1.8} />
      <span className="text-[13px]">{label}</span>
    </div>
  );
}

function InfoBlock({ label, value, subvalue }) {
  return (
    <div className="min-w-0">
      <p className="xl:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">{label}</p>
      <p className="text-[14px] text-white/85 leading-relaxed break-words">{value}</p>
      {subvalue && <p className="mt-1 text-[12px] text-white/40">{subvalue}</p>}
    </div>
  );
}

function StatusBlock({ status }) {
  const tone = {
    New: 'bg-sky-500/10 border-sky-400/30 text-sky-200',
    Contacted: 'bg-amber-500/10 border-amber-400/30 text-amber-200',
    Booked: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200',
    'Awaiting customer': 'bg-violet-500/10 border-violet-400/30 text-violet-200',
  }[status] || 'bg-white/5 border-white/15 text-white/75';

  return (
    <div>
      <p className="xl:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">Status</p>
      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm border text-[12px] font-semibold tracking-wide ${tone}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-90" />
        {status}
      </span>
    </div>
  );
}

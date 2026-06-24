import React from 'react';
import {
  Activity,
  Wrench,
  Droplets,
  Disc3,
  Cog,
  BatteryCharging,
  CircleDot,
  ClipboardCheck,
  Hammer,
  ArrowUpRight,
} from 'lucide-react';
import { links } from '../lib/business';

const SERVICES = [
  {
    icon: Activity,
    title: 'Car Diagnostics',
    description: 'Computer-based fault diagnostics to identify warning lights, sensor faults and engine issues accurately before any repair work begins.',
  },
  {
    icon: Wrench,
    title: 'Full Car Service',
    description: 'Complete inspection and servicing covering engine, fluids, filters, belts, brakes and key wear items to keep your car running smoothly.',
  },
  {
    icon: Droplets,
    title: 'Oil & Filter Change',
    description: 'Quality oil and filter replacement using manufacturer-grade lubricants suited to your engine specification and driving conditions.',
  },
  {
    icon: Disc3,
    title: 'Brake Inspection & Repair',
    description: 'Brake pad, disc and fluid checks with honest advice on what genuinely needs replacing — and what can safely wait.',
  },
  {
    icon: Cog,
    title: 'Engine Maintenance',
    description: 'Routine engine care, belt and timing checks, fluid top-ups and minor repairs to extend the life of your engine.',
  },
  {
    icon: BatteryCharging,
    title: 'Battery Check & Replacement',
    description: 'Battery health testing, charging system checks and replacement with the correct battery for your vehicle.',
  },
  {
    icon: CircleDot,
    title: 'Suspension & Steering',
    description: 'Inspection and repair of shocks, springs, bushings and steering components to restore comfort, control and safety.',
  },
  {
    icon: ClipboardCheck,
    title: 'Pre-NCT Check',
    description: 'A practical pre-NCT inspection so you know what to fix before your test — and avoid a fail.',
  },
  {
    icon: Hammer,
    title: 'General Car Repairs',
    description: 'Day-to-day mechanical repairs handled clearly and professionally, with straightforward communication from start to finish.',
  },
];

export default function Services() {
  return (
    <section
      id="services"
      data-testid="services-section"
      className="relative py-24 sm:py-32 bg-ink-950 overflow-hidden"
    >
      {/* faint diagonal accent */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)',
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        {/* Section heading */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold-400" />
            <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="services-overline">
              Our Services
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="services-headline">
            What we do, <br className="hidden sm:block" />
            <span className="text-white/55">day in, day out.</span>
          </h2>
          <p className="mt-5 text-white/65 max-w-2xl leading-relaxed">
            Practical, honest maintenance and repair work for cars driven on Dublin roads — handled by people you can actually talk to.
          </p>
        </div>

        {/* Service grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] rounded-sm overflow-hidden">
          {SERVICES.map(({ icon: Icon, title, description }, i) => (
            <article
              key={title}
              data-testid={`service-card-${i}`}
              className="group relative bg-ink-900 hover:bg-ink-800 p-7 sm:p-8 transition-colors duration-500 flex flex-col gap-5 min-h-[230px]"
            >
              <div className="flex items-start justify-between">
                <div className="icon-plate inline-flex items-center justify-center h-12 w-12 rounded-sm text-gold-300 group-hover:text-gold-200 transition-colors">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <span className="text-[10px] uppercase tracking-widest2 text-white/30 font-medium">
                  0{i + 1}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-white">
                  {title}
                </h3>
                <p className="mt-2 text-[14px] text-white/60 leading-relaxed">
                  {description}
                </p>
              </div>
              <div className="mt-auto pt-3">
                <a
                  href={links.call}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/55 group-hover:text-gold-300 transition-colors"
                  data-testid={`service-card-cta-${i}`}
                >
                  Ask about this service
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>

              {/* corner gold accent */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 h-12 w-px bg-gradient-to-b from-gold-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-0 right-0 w-12 h-px bg-gradient-to-l from-gold-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </article>
          ))}
        </div>

        <p className="mt-8 text-sm text-white/55">
          Don't see exactly what you need? <a href={links.call} className="text-gold-300 hover:text-gold-200 underline-offset-4 hover:underline" data-testid="services-call-link">Give us a call</a> — chances are we handle it.
        </p>
      </div>
    </section>
  );
}

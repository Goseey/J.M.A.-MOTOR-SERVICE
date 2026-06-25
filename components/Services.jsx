'use client';

import React from 'react';
import {
  Activity, Wrench, Droplets, Disc3, Cog, BatteryCharging,
  CircleDot, ClipboardCheck, Hammer, ArrowUpRight,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const ICONS = [Activity, Wrench, Droplets, Disc3, Cog, BatteryCharging, CircleDot, ClipboardCheck, Hammer];

export default function Services() {
  const { t, setPreselectedService } = useApp();
  const items = t('services.items') || [];

  const onPick = (title) => {
    setPreselectedService(title);
    // Allow the form section to scroll into view smoothly
    const el = typeof document !== 'undefined' ? document.getElementById('service-request') : null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="services"
      data-testid="services-section"
      className="relative py-24 sm:py-32 bg-ink-950 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold-400" />
            <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="services-overline">
              {t('services.overline')}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="services-headline">
            {t('services.headlinePart1')} <br className="hidden sm:block" />
            <span className="text-white/55">{t('services.headlinePart2')}</span>
          </h2>
          <p className="mt-5 text-white/65 max-w-2xl leading-relaxed">
            {t('services.description')}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.05] rounded-sm overflow-hidden">
          {items.map((item, i) => {
            const Icon = ICONS[i] || Wrench;
            return (
              <article
                key={item.title}
                data-testid={`service-card-${i}`}
                className="group relative bg-ink-900 hover:bg-ink-800 p-7 sm:p-8 transition-colors duration-500 flex flex-col gap-5 min-h-[230px]"
              >
                <div className="flex items-start justify-between">
                  <div className="icon-plate inline-flex items-center justify-center h-12 w-12 rounded-sm text-gold-300 group-hover:text-gold-200 transition-colors">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <span className="text-[10px] uppercase tracking-widest2 text-white/30 font-medium">0{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-white">{item.title}</h3>
                  <p className="mt-2 text-[14px] text-white/60 leading-relaxed">{item.description}</p>
                </div>
                <div className="mt-auto pt-3">
                  <button
                    type="button"
                    onClick={() => onPick(item.title)}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/55 group-hover:text-gold-300 transition-colors text-left"
                    data-testid={`service-card-cta-${i}`}
                  >
                    {t('common.askAboutService')}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>

                <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 h-12 w-px bg-gradient-to-b from-gold-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 w-12 h-px bg-gradient-to-l from-gold-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-white/55">
          {t('services.footer')}{' '}
          <a
            href="#service-request"
            className="text-gold-300 hover:text-gold-200 underline-offset-4 hover:underline"
            data-testid="services-call-link"
          >
            {t('services.footerCta')}
          </a>{' '}
          {t('services.footerAfter')}
        </p>
      </div>
    </section>
  );
}

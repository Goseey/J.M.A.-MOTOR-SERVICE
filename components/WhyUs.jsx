'use client';

import React from 'react';
import { MapPin, MessageSquare, Wrench, PhoneCall, Navigation, Users } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const ICONS = [MapPin, MessageSquare, Wrench, PhoneCall, Navigation, Users];

export default function WhyUs() {
  const { t } = useApp();
  const points = t('whyUs.points') || [];

  return (
    <section
      id="why-us"
      data-testid="why-us-section"
      className="relative py-24 sm:py-32 bg-ink-900 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'url("https://images.pexels.com/photos/4489735/pexels-photo-4489735.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) contrast(0.85)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-900/95 to-ink-950" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-gold-400" />
              <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="why-us-overline">
                {t('whyUs.overline')}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight leading-[1.05]" data-testid="why-us-headline">
              {t('whyUs.headlinePart1')} <span className="text-metal-gold">{t('whyUs.headlineHighlight')}</span>{t('whyUs.headlinePart2')}
            </h2>
            <p className="mt-5 text-white/65 leading-relaxed">
              {t('whyUs.description')}
            </p>
            <div className="mt-8 hidden lg:block">
              <div className="gold-divider" />
              <p className="mt-6 text-[12px] uppercase tracking-widest2 text-white/45">
                {t('whyUs.locationLabel')}
              </p>
            </div>
          </div>

          <ol className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-white/[0.04] rounded-sm overflow-hidden">
            {points.map((point, i) => {
              const Icon = ICONS[i] || MapPin;
              return (
                <li
                  key={point.title}
                  data-testid={`why-us-point-${i}`}
                  className="group bg-ink-800/80 hover:bg-ink-700/80 p-6 sm:p-7 transition-colors duration-500 flex gap-4"
                >
                  <div className="shrink-0 icon-plate inline-flex items-center justify-center h-11 w-11 rounded-sm text-gold-300">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest2 text-white/35">0{i + 1}</span>
                      <h3 className="font-display text-base font-semibold tracking-tight text-white">{point.title}</h3>
                    </div>
                    <p className="mt-2 text-[13.5px] text-white/60 leading-relaxed">{point.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

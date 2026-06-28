'use client';

import React from 'react';
import { Phone, MapPin, Send, Wrench, ShieldCheck, ChevronDown } from 'lucide-react';
import { BUSINESS, links } from '@/lib/business';
import { useApp } from '@/contexts/AppContext';
import HeroSlideshow from './HeroSlideshow';

const BADGE_KEYS = [
  { icon: ShieldCheck, tKey: 'hero.badges.rating', testid: 'badge-rating' },
  { icon: Wrench, tKey: 'hero.badges.reviews', testid: 'badge-reviews' },
  { icon: MapPin, tKey: 'hero.badges.location', testid: 'badge-location' },
  { icon: Phone, tKey: 'hero.badges.phone', testid: 'badge-phone' },
];

export default function Hero() {
  const { t } = useApp();

  return (
    <section
      id="home"
      data-testid="hero-section"
      className="relative isolate overflow-hidden min-h-[100svh] flex items-center pt-24 pb-16 sm:pt-28 sm:pb-20"
    >
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

      {/* Slideshow (replaces the static car photo) */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <HeroSlideshow />

        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-ink-950 via-ink-950/65 to-transparent" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
        <div
          className="absolute inset-0 z-[2]"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 60%, transparent 35%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        <div className="absolute right-[8%] bottom-[34%] w-40 h-40 headlight animate-headlight md:w-56 md:h-56 z-[2]" />
        <div className="absolute right-[26%] bottom-[36%] w-32 h-32 headlight animate-headlight md:w-48 md:h-48 z-[2]" style={{ animationDelay: '0.6s' }} />

        <div className="light-sweep z-[2]" />
        <div className="smoke z-[2]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-500 live-dot" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] uppercase tracking-widest2 text-white/70" data-testid="hero-overline">
              {t('hero.overline')}
            </span>
          </div>

          <h1
            data-testid="hero-headline"
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold leading-[1.02] tracking-tight animate-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            {t('hero.headlinePart1')} <span className="text-metal-gold">{t('hero.headlinePart2')}</span>{' '}
            <br className="hidden sm:block" />
            {t('hero.headlinePart3')}
          </h1>

          <p
            data-testid="hero-subtext"
            className="mt-6 max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed animate-fade-up"
            style={{ animationDelay: '360ms' }}
          >
            {t('hero.subtext')}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up" style={{ animationDelay: '480ms' }}>
            <a
              href={links.call}
              data-testid="hero-call-now"
              className="inline-flex items-center gap-2 h-12 px-6 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold tracking-wide rounded-sm transition-colors shadow-gold"
            >
              <Phone className="h-4 w-4" strokeWidth={2.4} /> {t('common.callNow')}
            </a>
            <a
              href={links.directions}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-directions"
              className="inline-flex items-center gap-2 h-12 px-6 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold tracking-wide rounded-sm transition-colors"
            >
              <MapPin className="h-4 w-4" strokeWidth={2} /> {t('common.getDirections')}
            </a>
            <a
              href="#service-request"
              data-testid="hero-request-service"
              className="inline-flex items-center gap-2 h-12 px-6 border border-white/20 hover:border-gold-400/50 hover:bg-white/5 text-white font-semibold tracking-wide rounded-sm transition-colors group"
            >
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              {t('common.requestService')}
            </a>
          </div>

          <div
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl animate-fade-up"
            style={{ animationDelay: '600ms' }}
            data-testid="hero-badges"
          >
            {BADGE_KEYS.map(({ icon: Icon, tKey, testid }) => (
              <div
                key={tKey}
                data-testid={testid}
                className="group relative flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-gold-400/40 rounded-sm transition-colors"
              >
                <div className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-sm bg-gold-400/10 border border-gold-400/30 text-gold-300">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <span className="text-[12px] sm:text-[13px] font-medium leading-tight text-white/85">{t(tKey)}</span>
              </div>
            ))}
          </div>

          <a
            href={links.call}
            data-testid="hero-phone-display"
            className="group inline-flex items-baseline gap-3 mt-10 animate-fade-up"
            style={{ animationDelay: '720ms' }}
          >
            <span className="text-[11px] uppercase tracking-widest2 text-white/55">{t('hero.directLine')}</span>
            <span className="font-display text-2xl sm:text-3xl font-semibold text-white group-hover:text-gold-300 transition-colors">
              {BUSINESS.phoneDisplay}
            </span>
          </a>
        </div>
      </div>

      <a
        href="#services"
        data-testid="hero-scroll-hint"
        className="hidden md:flex absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex-col items-center text-[10px] uppercase tracking-widest2 text-white/55 hover:text-white transition-colors"
        aria-label={t('common.scroll')}
      >
        {t('common.scroll')}
        <ChevronDown className="h-4 w-4 mt-1 animate-float" />
      </a>
    </section>
  );
}

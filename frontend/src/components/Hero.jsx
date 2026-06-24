import React, { useEffect, useRef, useState } from 'react';
import { Phone, MapPin, Send, Star, ShieldCheck, ChevronDown } from 'lucide-react';
import { BUSINESS, links } from '../lib/business';

/**
 * Cinematic premium car hero.
 *
 * Composition layers (back -> front):
 *   1. Deep gradient + radial spotlights (studio backdrop)
 *   2. Realistic car photograph (Pexels licensed, blended)
 *   3. Animated headlight glow blobs
 *   4. Slow diagonal light sweep across car body
 *   5. Drifting smoke / atmosphere
 *   6. Subtle film grain (from index.css .grain)
 *   7. Hero copy + CTAs + badges
 *
 * Respects prefers-reduced-motion (animations disabled via global rule).
 */
const HERO_IMG =
  'https://images.pexels.com/photos/17245109/pexels-photo-17245109.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920';

const HERO_IMG_FALLBACK =
  'https://images.pexels.com/photos/17245109/pexels-photo-17245109.jpeg?auto=compress&cs=tinysrgb&w=1280';

const BADGES = [
  { icon: Star, label: '5.0 Google Rating', testid: 'badge-rating' },
  { icon: ShieldCheck, label: '8 Verified Reviews', testid: 'badge-reviews' },
  { icon: MapPin, label: 'Dublin City Centre', testid: 'badge-location' },
  { icon: Phone, label: 'Direct Phone Contact', testid: 'badge-phone' },
];

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  // Parallax effect (very subtle, perf-friendly with rAF)
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const handle = () => {
      const y = window.scrollY;
      // limit parallax effect to first viewport only
      if (y < window.innerHeight) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => setOffset(y * 0.25));
      }
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => {
      window.removeEventListener('scroll', handle);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="home"
      ref={ref}
      data-testid="hero-section"
      className="relative isolate overflow-hidden min-h-[100svh] flex items-center pt-24 pb-16 sm:pt-28 sm:pb-20"
    >
      {/* 1. Studio backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 grain"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 40%, #1a1a1d 0%, #0a0a0b 55%, #050505 100%)',
        }}
      />

      {/* Diagonal accent lines (architecture / blueprint feel) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(45deg, rgba(212,175,55,0.4) 0 1px, transparent 1px 80px), linear-gradient(-45deg, rgba(212,175,55,0.25) 0 1px, transparent 1px 80px)',
        }}
      />

      {/* 2. Realistic car image with parallax + blend */}
      <div
        className="absolute inset-0 -z-10"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
        aria-hidden="true"
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={HERO_IMG} />
          <img
            src={HERO_IMG_FALLBACK}
            alt=""
            loading="eager"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover object-center md:object-[center_55%] transition-all duration-[1400ms] ease-out ${
              loaded ? 'opacity-[0.55] scale-100' : 'opacity-0 scale-[1.08]'
            }`}
            style={{ filter: 'contrast(1.05) saturate(0.85) brightness(0.7)' }}
          />
        </picture>

        {/* dark gradient overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />

        {/* vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 60%, transparent 35%, rgba(0,0,0,0.55) 100%)',
          }}
        />

        {/* 3. Headlight glow blobs (positioned over car headlights area) */}
        <div className="absolute right-[8%] bottom-[34%] w-40 h-40 headlight animate-headlight md:w-56 md:h-56" />
        <div className="absolute right-[26%] bottom-[36%] w-32 h-32 headlight animate-headlight md:w-48 md:h-48" style={{ animationDelay: '0.6s' }} />

        {/* 4. Diagonal light sweep across body */}
        <div className="light-sweep" />

        {/* 5. Smoke / atmosphere */}
        <div className="smoke" />
      </div>

      {/* Copy + CTAs */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-500 live-dot" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] uppercase tracking-widest2 text-white/70" data-testid="hero-overline">
              Local Garage · Dublin City Centre
            </span>
          </div>

          <h1
            data-testid="hero-headline"
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold leading-[1.02] tracking-tight animate-fade-up"
            style={{ animationDelay: '220ms' }}
          >
            Reliable Car Repair &{' '}
            <span className="text-metal-gold">Maintenance</span>{' '}
            <br className="hidden sm:block" />
            in Dublin City Centre
          </h1>

          <p
            data-testid="hero-subtext"
            className="mt-6 max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed animate-fade-up"
            style={{ animationDelay: '360ms' }}
          >
            Professional diagnostics, servicing, repairs and general vehicle maintenance for local
            drivers in Dublin. Honest pricing, direct communication, and a workshop you can actually
            walk into.
          </p>

          {/* CTAs */}
          <div
            className="mt-9 flex flex-wrap items-center gap-3 animate-fade-up"
            style={{ animationDelay: '480ms' }}
          >
            <a
              href={links.call}
              data-testid="hero-call-now"
              className="inline-flex items-center gap-2 h-12 px-6 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold tracking-wide rounded-sm transition-colors shadow-gold"
            >
              <Phone className="h-4 w-4" strokeWidth={2.4} /> Call Now
            </a>
            <a
              href={links.directions}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-directions"
              className="inline-flex items-center gap-2 h-12 px-6 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold tracking-wide rounded-sm transition-colors"
            >
              <MapPin className="h-4 w-4" strokeWidth={2} /> Get Directions
            </a>
            <a
              href="#service-request"
              data-testid="hero-request-service"
              className="inline-flex items-center gap-2 h-12 px-6 text-white/85 hover:text-white font-medium tracking-wide group"
            >
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              Request Service
            </a>
          </div>

          {/* Badges */}
          <div
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl animate-fade-up"
            style={{ animationDelay: '600ms' }}
            data-testid="hero-badges"
          >
            {BADGES.map(({ icon: Icon, label, testid }) => (
              <div
                key={label}
                data-testid={testid}
                className="group relative flex items-center gap-3 px-3 py-3 sm:px-4 sm:py-3.5 bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-gold-400/40 rounded-sm transition-colors"
              >
                <div className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-sm bg-gold-400/10 border border-gold-400/30 text-gold-300">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <span className="text-[12px] sm:text-[13px] font-medium leading-tight text-white/85">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Phone display */}
          <a
            href={links.call}
            data-testid="hero-phone-display"
            className="group inline-flex items-baseline gap-3 mt-10 animate-fade-up"
            style={{ animationDelay: '720ms' }}
          >
            <span className="text-[11px] uppercase tracking-widest2 text-white/55">Direct line</span>
            <span className="font-display text-2xl sm:text-3xl font-semibold text-white group-hover:text-gold-300 transition-colors">
              {BUSINESS.phoneDisplay}
            </span>
          </a>
        </div>
      </div>

      {/* Scroll hint */}
      <a
        href="#services"
        data-testid="hero-scroll-hint"
        className="hidden md:flex absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex-col items-center text-[10px] uppercase tracking-widest2 text-white/55 hover:text-white transition-colors"
        aria-label="Scroll to services"
      >
        Scroll
        <ChevronDown className="h-4 w-4 mt-1 animate-float" />
      </a>
    </section>
  );
}

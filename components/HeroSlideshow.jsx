'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

/**
 * Hero slideshow — premium, subtle, mobile-responsive.
 *
 * Images live in `/public/images/hero-slideshow/slide-{1..4}.jpg`.
 * To replace them, simply overwrite the JPEGs and redeploy — no code changes
 * needed. See `/public/images/hero-slideshow/README.md`.
 *
 * Features:
 *   - Auto-advance every 6s, pauses on hover / focus
 *   - Manual prev / next + click indicators
 *   - Crossfade + tiny zoom (Ken Burns) for premium feel
 *   - Honours prefers-reduced-motion: no animation, manual only
 *   - Lazy decode + eager load for the first slide for fast LCP
 */

const IMAGES = [
  { src: '/images/hero-slideshow/slide-1.jpg', alt: 'Mechanic working under a car' },
  { src: '/images/hero-slideshow/slide-2.jpg', alt: 'Inside a clean professional garage' },
  { src: '/images/hero-slideshow/slide-3.jpg', alt: 'Close-up of an engine being serviced' },
  { src: '/images/hero-slideshow/slide-4.jpg', alt: 'Tools laid out on a workbench' },
];

const AUTO_ADVANCE_MS = 6000;

export default function HeroSlideshow({ className = '' }) {
  const { lang, t } = useApp();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timerRef = useRef(null);

  // Detect reduced motion once on mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const advance = useCallback((delta) => {
    setIndex((i) => (i + delta + IMAGES.length) % IMAGES.length);
  }, []);

  // Auto-advance.
  useEffect(() => {
    if (reduced || paused || IMAGES.length <= 1) return undefined;
    timerRef.current = window.setTimeout(() => advance(1), AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, paused, reduced, advance]);

  // Keyboard support (arrow keys when the carousel is focused).
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); advance(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); advance(1); }
  };

  const labels = useMemo(() => ({
    previous: lang === 'so' ? 'Hore' : 'Previous',
    next: lang === 'so' ? 'Xiga' : 'Next',
    slide: lang === 'so' ? 'Sawir' : 'Slide',
    of: lang === 'so' ? 'oo ka mid ah' : 'of',
  }), [lang]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="J.M.A. Motor Service workshop photos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className={`group absolute inset-0 outline-none ${className}`}
      data-testid="hero-slideshow"
    >
      {IMAGES.map((img, i) => {
        const isActive = i === index;
        return (
          <div
            key={img.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${labels.slide} ${i + 1} ${labels.of} ${IMAGES.length}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
              isActive ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
            data-testid={`hero-slide-${i}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'auto'}
              className={`h-full w-full object-cover object-center md:object-[center_55%] transition-transform duration-[6000ms] ease-out ${
                isActive && !reduced ? 'scale-[1.06]' : 'scale-100'
              }`}
              style={{ filter: 'contrast(1.05) saturate(0.85) brightness(0.62)' }}
            />
          </div>
        );
      })}

      {/* Indicators (bottom-left, subtle) */}
      <div
        className="absolute bottom-5 sm:bottom-6 left-5 sm:left-8 z-[3] flex items-center gap-1.5"
        data-testid="hero-slideshow-indicators"
      >
        {IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${labels.slide} ${i + 1}`}
            aria-current={i === index ? 'true' : 'false'}
            data-testid={`hero-slideshow-dot-${i}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-gold-400' : 'w-4 bg-white/35 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Prev / Next arrows — desktop only, appear on hover */}
      <div className="absolute inset-y-0 right-5 sm:right-8 z-[3] hidden md:flex flex-col justify-center gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300">
        <button
          type="button"
          onClick={() => advance(-1)}
          aria-label={labels.previous}
          data-testid="hero-slideshow-prev"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-ink-950/70 backdrop-blur-md border border-white/15 text-white hover:bg-ink-950/90 hover:border-gold-400/60 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
        </button>
        <button
          type="button"
          onClick={() => advance(1)}
          aria-label={labels.next}
          data-testid="hero-slideshow-next"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-ink-950/70 backdrop-blur-md border border-white/15 text-white hover:bg-ink-950/90 hover:border-gold-400/60 transition-colors"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>

      {/* Slide counter — bottom-right, tiny */}
      <div className="absolute bottom-5 sm:bottom-6 right-5 sm:right-8 z-[3] hidden sm:block">
        <span className="text-[10px] uppercase tracking-widest2 text-white/55 font-medium">
          <span className="text-gold-300">{String(index + 1).padStart(2, '0')}</span>
          <span className="mx-1.5 text-white/30">/</span>
          {String(IMAGES.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

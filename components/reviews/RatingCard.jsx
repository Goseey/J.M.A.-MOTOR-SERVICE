'use client';

import React from 'react';
import { Star, ExternalLink, MapPin } from 'lucide-react';
import { BUSINESS, links } from '@/lib/business';
import { useApp } from '@/contexts/AppContext';

const STAR_KEYS = ['s1', 's2', 's3', 's4', 's5'];

export default function RatingCard() {
  const { t } = useApp();

  return (
    <div
      className="relative p-8 sm:p-10 lg:p-12 bg-gradient-to-br from-ink-900 to-ink-800 border border-white/10 rounded-sm overflow-hidden"
      data-testid="google-rating-card"
    >
      <span className="absolute top-0 left-0 h-10 w-px bg-gold-400/70" aria-hidden="true" />
      <span className="absolute top-0 left-0 w-10 h-px bg-gold-400/70" aria-hidden="true" />
      <span className="absolute bottom-0 right-0 h-10 w-px bg-gold-400/70" aria-hidden="true" />
      <span className="absolute bottom-0 right-0 w-10 h-px bg-gold-400/70" aria-hidden="true" />

      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center h-12 w-12 bg-white rounded-sm">
            <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.6 7 29.6 5 24 5 16.3 5 9.6 9.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.4C29.7 34.7 27 35.5 24 35.5c-5.3 0-9.7-3.4-11.3-8L6.1 32C9.4 38 16.1 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.2-2.2 4-4 5.3l6.6 5.4C40.6 35.5 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest2 text-white/55">{t('reviews.googleLabel')}</p>
            <p className="font-display text-base font-semibold text-white">{BUSINESS.name}</p>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold tracking-wide rounded-sm"
          data-testid="verified-badge"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t('reviews.verified')}
        </span>
      </header>

      <div className="mt-10">
        <div className="flex gap-1.5" aria-hidden="true">
          {STAR_KEYS.map((k) => (
            <Star key={k} className="h-7 w-7 fill-gold-400 text-gold-400" strokeWidth={1.5} />
          ))}
        </div>
        <p className="mt-5 font-display text-xl sm:text-2xl font-semibold text-white leading-snug">
          {t('reviews.invite')}
        </p>
        <p className="mt-3 text-[14px] text-white/65 leading-relaxed max-w-md">
          {t('reviews.inviteSub')}
        </p>
      </div>

      <div className="mt-8 hairline" />

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href={links.mapsSearch}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="view-on-google-maps"
          className="inline-flex items-center gap-2 h-11 px-5 bg-white text-ink-950 font-semibold text-[13px] tracking-wide rounded-sm hover:bg-white/90 transition-colors"
        >
          {t('reviews.viewOnGoogle')}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href={links.directions}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="reviews-directions"
          className="inline-flex items-center gap-2 h-11 px-5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-[13px] tracking-wide rounded-sm transition-colors"
        >
          <MapPin className="h-4 w-4" />
          {t('common.getDirections')}
        </a>
      </div>
    </div>
  );
}

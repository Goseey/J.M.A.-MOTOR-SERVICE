'use client';

import React from 'react';
import RatingCard from './reviews/RatingCard';
import { useApp } from '@/contexts/AppContext';

export default function Reviews() {
  const { t } = useApp();

  return (
    <section
      id="reviews"
      data-testid="reviews-section"
      className="relative py-24 sm:py-32 bg-ink-950 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-gold-400" />
              <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="reviews-overline">
                {t('reviews.overline')}
              </span>
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]"
              data-testid="reviews-headline"
            >
              {t('reviews.headlinePart1')} <span className="text-metal-gold">{t('reviews.headlineHighlight')}</span> {t('reviews.headlinePart2')}
              <br className="hidden sm:block" /> {t('reviews.headlinePart3')}
            </h2>
            <p className="mt-5 text-white/65 leading-relaxed max-w-md">
              {t('reviews.description')}
            </p>
          </div>

          <div className="lg:col-span-7">
            <RatingCard />
          </div>
        </div>
      </div>
    </section>
  );
}

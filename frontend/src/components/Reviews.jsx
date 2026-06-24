import React from 'react';
import RatingCard from './reviews/RatingCard';

/**
 * Reviews / trust section.
 * Strict rule from the brief: NO fake testimonials with names.
 * Shows only the real Google aggregate rating, via the extracted <RatingCard />.
 */
export default function Reviews() {
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
                Trust
              </span>
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]"
              data-testid="reviews-headline"
            >
              Rated <span className="text-metal-gold">5.0</span> on Google,
              <br className="hidden sm:block" /> by real drivers in Dublin.
            </h2>
            <p className="mt-5 text-white/65 leading-relaxed max-w-md">
              We don't write our own reviews. The rating below is pulled straight from
              Google — verified customer feedback, no edits, no filters.
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

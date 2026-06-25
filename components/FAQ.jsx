'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export default function FAQ() {
  const { t } = useApp();
  const [open, setOpen] = useState(0);
  const items = t('faq.items') || [];

  return (
    <section
      id="faq"
      data-testid="faq-section"
      className="relative py-24 sm:py-32 bg-ink-900"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-gold-400" />
            <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="faq-overline">
              {t('faq.overline')}
            </span>
            <span className="h-px w-8 bg-gold-400" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="faq-headline">
            {t('faq.headline')}
          </h2>
          <p className="mt-5 text-white/65 leading-relaxed">
            {t('faq.description')}
          </p>
        </div>

        <div className="mt-14 divide-y divide-white/10 border-y border-white/10" data-testid="faq-list">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} data-testid={`faq-item-${i}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  data-testid={`faq-toggle-${i}`}
                  className="w-full flex items-center justify-between gap-6 py-6 sm:py-7 text-left group"
                >
                  <span className="font-display text-base sm:text-lg font-semibold text-white group-hover:text-gold-300 transition-colors">
                    {item.q}
                  </span>
                  <span className={`shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-sm border transition-colors ${
                    isOpen ? 'bg-gold-400 border-gold-400 text-ink-950' : 'border-white/15 text-white/70 group-hover:border-white/30'
                  }`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  className={`grid transition-all duration-500 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 pb-7' : 'grid-rows-[0fr] opacity-0 pb-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[14.5px] text-white/65 leading-relaxed max-w-2xl" data-testid={`faq-answer-${i}`}>
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

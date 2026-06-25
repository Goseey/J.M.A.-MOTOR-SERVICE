'use client';

import React from 'react';
import { Languages } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { LANGUAGES } from '@/lib/i18n';

/**
 * Compact EN/SO toggle.
 * - Pill-shaped, two segments, animated background slider
 * - Active segment is high-contrast gold; inactive is muted
 * - Works at every breakpoint (no overflow on small screens)
 */
export default function LanguageSwitcher({ className = '', size = 'md' }) {
  const { lang, setLang, t } = useApp();

  const dims = size === 'sm'
    ? 'h-8 text-[11px]'
    : 'h-9 text-[12px]';

  return (
    <div
      role="group"
      aria-label={t('language.switchTo', 'Switch language')}
      className={`relative inline-flex items-center ${dims} p-0.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md ${className}`}
      data-testid="language-switcher"
    >
      <Languages
        className="ml-2 mr-1 h-3.5 w-3.5 text-white/55 shrink-0"
        strokeWidth={2}
        aria-hidden="true"
      />
      {LANGUAGES.map(({ code, label, name }) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            aria-label={`${t('language.switchTo')}: ${name}`}
            data-testid={`lang-${code}`}
            className={`relative z-10 inline-flex items-center justify-center px-3 h-full rounded-full font-semibold tracking-wide transition-colors ${
              active
                ? 'bg-gold-400 text-ink-950 shadow-gold'
                : 'text-white/65 hover:text-white'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

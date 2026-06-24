'use client';

import React, { useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import Logo from './Logo';
import useScrollY from '@/hooks/useScrollY';
import { BUSINESS, links } from '@/lib/business';

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'why-us', label: 'Why Us' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrollY() > 16;
  const close = () => setOpen(false);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ink-950/85 backdrop-blur-xl border-b border-white/10'
          : 'bg-gradient-to-b from-ink-950/70 to-transparent backdrop-blur-md'
      }`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10 h-[70px] flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-9" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              data-testid={`nav-link-${item.id}`}
              className="text-[13px] font-medium tracking-wide text-white/75 hover:text-white transition-colors relative group"
            >
              {item.label}
              <span className="pointer-events-none absolute -bottom-1.5 left-0 h-px w-0 bg-gold-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={links.call}
            data-testid="header-call-now"
            className="hidden sm:inline-flex items-center gap-2 px-4 lg:px-5 h-10 bg-gold-400 hover:bg-gold-300 text-ink-950 text-[13px] font-semibold tracking-wide rounded-sm transition-colors shadow-gold"
          >
            <Phone className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden md:inline">Call Now</span>
            <span className="md:hidden">Call</span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            data-testid="mobile-menu-toggle"
            className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-sm border border-white/10 text-white/85 hover:bg-white/5"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-[max-height,opacity] duration-500 ${
          open ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
        }`}
        data-testid="mobile-menu"
      >
        <div className="bg-ink-900/95 backdrop-blur-xl border-t border-white/10 px-5 py-6 space-y-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={close}
              data-testid={`mobile-nav-link-${item.id}`}
              className="block px-3 py-3 text-base text-white/85 hover:text-white hover:bg-white/5 rounded-sm border-b border-white/5 last:border-0"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <a
              href={links.call}
              onClick={close}
              data-testid="mobile-call-now"
              className="inline-flex items-center justify-center gap-2 h-12 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold tracking-wide rounded-sm"
            >
              <Phone className="h-4 w-4" /> Call {BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

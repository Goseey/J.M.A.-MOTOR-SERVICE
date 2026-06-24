import React from 'react';
import Logo from './Logo';
import { BUSINESS, links } from '../lib/business';
import { Phone, MapPin, Navigation } from 'lucide-react';

const QUICK_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'why-us', label: 'Why Us' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
  { id: 'service-request', label: 'Request Service' },
  { id: 'faq', label: 'FAQ' },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      data-testid="site-footer"
      className="relative bg-ink-950 border-t border-white/10 pt-16 sm:pt-20 pb-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }}
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid md:grid-cols-12 gap-10 md:gap-8">
          {/* Brand block */}
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-5 text-[14px] text-white/60 leading-relaxed max-w-md">
              Reliable car repair, diagnostics and maintenance in Dublin city centre.
              A local workshop built on honest work and direct communication.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={links.call}
                data-testid="footer-call-button"
                className="inline-flex items-center gap-2 h-10 px-4 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold text-[12.5px] tracking-wide rounded-sm transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> Call Now
              </a>
              <a
                href={links.directions}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="footer-directions-button"
                className="inline-flex items-center gap-2 h-10 px-4 border border-white/15 hover:border-white/30 hover:bg-white/5 text-white font-semibold text-[12.5px] tracking-wide rounded-sm transition-colors"
              >
                <Navigation className="h-3.5 w-3.5" /> Directions
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-4">
            <p className="text-[10px] uppercase tracking-widest2 text-white/45 font-semibold">Contact</p>
            <ul className="mt-5 space-y-4 text-[14px] text-white/75">
              <li className="flex items-start gap-3" data-testid="footer-address">
                <MapPin className="h-4 w-4 mt-0.5 text-gold-300 shrink-0" strokeWidth={1.8} />
                <span>{BUSINESS.address}</span>
              </li>
              <li className="flex items-center gap-3" data-testid="footer-phone">
                <Phone className="h-4 w-4 text-gold-300 shrink-0" strokeWidth={1.8} />
                <a href={links.call} className="hover:text-gold-300 transition-colors">{BUSINESS.phoneDisplay}</a>
              </li>
              <li className="flex items-center gap-3 text-[12px] text-white/50">
                <span className="inline-block h-1.5 w-1.5 bg-gold-400/70 rounded-full" />
                Plus code: {BUSINESS.plusCode}
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3">
            <p className="text-[10px] uppercase tracking-widest2 text-white/45 font-semibold">Quick links</p>
            <ul className="mt-5 grid grid-cols-2 gap-y-3 gap-x-4 text-[14px]">
              {QUICK_LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    data-testid={`footer-link-${l.id}`}
                    className="text-white/70 hover:text-gold-300 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 hairline" />
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] text-white/45">
          <p data-testid="footer-copyright">© {year} {BUSINESS.name}. All rights reserved.</p>
          <p>Dublin · Ireland</p>
        </div>
      </div>
    </footer>
  );
}

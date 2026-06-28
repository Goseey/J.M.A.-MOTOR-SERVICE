'use client';

import React from 'react';
import { Phone, MessageCircle, Navigation } from 'lucide-react';
import { links } from '@/lib/business';
import useScrollY from '@/hooks/useScrollY';

export default function FloatingActions() {
  const visible = useScrollY() > 700;

  return (
    <div
      aria-hidden={!visible}
      data-testid="floating-actions"
      className={`fixed bottom-5 right-4 z-40 flex flex-col gap-3 transition-all duration-500 lg:bottom-6 lg:right-6 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {links.whatsapp && (
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          data-testid="floating-whatsapp"
          className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white ring-2 ring-white/20 shadow-[0_10px_28px_-8px_rgba(37,211,102,0.7)] transition-colors"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
        </a>
      )}
      <a
        href={links.directions}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get directions"
        data-testid="floating-directions"
        className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-ink-700 hover:bg-ink-600 text-white ring-2 ring-gold-400/40 shadow-[0_10px_28px_-8px_rgba(0,0,0,0.9)] transition-colors"
      >
        <Navigation className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
      </a>
      <a
        href={links.call}
        aria-label="Call J.M.A. Motor Service"
        data-testid="floating-call"
        className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 ring-2 ring-gold-200/40 shadow-[0_10px_28px_-8px_rgba(212,175,55,0.8)] transition-colors animate-pulse-slow"
      >
        <Phone className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.4} />
      </a>
    </div>
  );
}

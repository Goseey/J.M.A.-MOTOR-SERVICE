import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, Navigation } from 'lucide-react';
import { links } from '../lib/business';

/**
 * Floating CTA cluster (mobile-priority).
 * Appears after the user has scrolled past the hero on mobile/tablet.
 */
export default function FloatingActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      data-testid="floating-actions"
      className={`fixed bottom-4 right-4 z-40 flex flex-col gap-2.5 transition-all duration-500 lg:bottom-6 lg:right-6 ${
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
          className="inline-flex items-center justify-center h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white shadow-[0_10px_30px_-10px_rgba(37,211,102,0.6)] transition-colors"
        >
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
        </a>
      )}
      <a
        href={links.directions}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Get directions"
        data-testid="floating-directions"
        className="inline-flex items-center justify-center h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-ink-800 hover:bg-ink-700 text-white border border-white/15 shadow-lg transition-colors"
      >
        <Navigation className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
      </a>
      <a
        href={links.call}
        aria-label="Call J.M.A. Motor Service"
        data-testid="floating-call"
        className="inline-flex items-center justify-center h-13 w-13 sm:h-14 sm:w-14 rounded-full bg-gold-400 hover:bg-gold-300 text-ink-950 shadow-gold transition-colors"
      >
        <Phone className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
      </a>
    </div>
  );
}

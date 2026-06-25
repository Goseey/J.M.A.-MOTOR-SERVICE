'use client';

import React from 'react';
import { Phone, MapPin, Navigation, Send, MessageCircle } from 'lucide-react';
import { BUSINESS, links } from '@/lib/business';
import { useApp } from '@/contexts/AppContext';
import TikTokIcon from './icons/TikTokIcon';

export default function Contact() {
  const { t } = useApp();

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="relative py-24 sm:py-32 bg-ink-900"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-gold-400" />
              <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="contact-overline">
                {t('contact.overline')}
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="contact-headline">
              {t('contact.headlinePart1')} <span className="text-metal-gold">{t('contact.headlineHighlight')}</span>.
            </h2>
            <p className="mt-5 text-white/65 leading-relaxed max-w-md">
              {t('contact.description')}
            </p>

            <div className="mt-10 space-y-6">
              <div data-testid="contact-business-name">
                <p className="text-[10px] uppercase tracking-widest2 text-white/45">{t('contact.labels.business')}</p>
                <p className="mt-1.5 font-display text-lg font-semibold text-white">{BUSINESS.name}</p>
              </div>
              <div data-testid="contact-address">
                <p className="text-[10px] uppercase tracking-widest2 text-white/45">{t('contact.labels.address')}</p>
                <p className="mt-1.5 text-[15px] text-white/85 leading-relaxed">{BUSINESS.address}</p>
                <p className="text-[12px] text-white/45 mt-1">
                  {t('contact.labels.plusCode')}: <span data-testid="contact-plus-code">{BUSINESS.plusCode}</span>
                </p>
              </div>
              <div data-testid="contact-phone">
                <p className="text-[10px] uppercase tracking-widest2 text-white/45">{t('contact.labels.phone')}</p>
                <a href={links.call} className="mt-1.5 inline-block font-display text-2xl font-semibold text-white hover:text-gold-300 transition-colors" data-testid="contact-phone-display">
                  {BUSINESS.phoneDisplay}
                </a>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3" data-testid="contact-actions">
              <a
                href={links.call}
                className="inline-flex items-center gap-2 h-12 px-5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold text-[13px] tracking-wide rounded-sm transition-colors shadow-gold"
                data-testid="contact-call-button"
              >
                <Phone className="h-4 w-4" /> {t('common.call')} {BUSINESS.phoneDisplay}
              </a>
              <a
                href={links.directions}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-12 px-5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-[13px] tracking-wide rounded-sm transition-colors"
                data-testid="contact-directions-button"
              >
                <Navigation className="h-4 w-4" /> {t('common.getDirections')}
              </a>
              <a
                href="#service-request"
                className="inline-flex items-center gap-2 h-12 px-5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-[13px] tracking-wide rounded-sm transition-colors"
                data-testid="contact-request-button"
              >
                <Send className="h-4 w-4" /> {t('common.sendServiceRequest')}
              </a>
              {links.whatsapp && (
                <a
                  href={links.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 h-12 px-5 bg-[#25D366] hover:bg-[#1ebd5a] text-ink-950 font-semibold text-[13px] tracking-wide rounded-sm transition-colors"
                  data-testid="contact-whatsapp-button"
                >
                  <MessageCircle className="h-4 w-4" /> {t('common.whatsapp')}
                </a>
              )}
            </div>

            {/* Social / Follow us */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <p className="text-[10px] uppercase tracking-widest2 text-white/45 font-semibold mb-4">
                {t('contact.followUs')}
              </p>
              <div className="flex items-center gap-3" data-testid="contact-social">
                <a
                  href={links.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('common.visitTikTok')}
                  data-testid="contact-tiktok-button"
                  className="group inline-flex items-center gap-3 h-11 px-4 border border-white/15 hover:border-gold-400/60 hover:bg-white/5 text-white text-[13px] font-medium tracking-wide rounded-sm transition-colors"
                >
                  <TikTokIcon className="h-4 w-4 text-white group-hover:text-gold-300 transition-colors" />
                  <span className="text-white/90">@j.m.a.motor.servi7</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              className="relative h-[460px] sm:h-[520px] w-full border border-white/10 rounded-sm overflow-hidden"
              data-testid="map-block"
            >
              <iframe
                title="J.M.A. Motor Service location on Google Maps"
                src={links.mapsEmbed}
                className="absolute inset-0 h-full w-full"
                style={{ filter: 'grayscale(40%) contrast(1.05) brightness(0.85)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(120% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 100%)',
                }}
              />

              <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-ink-950/90 backdrop-blur-md border border-white/10 p-4 rounded-sm flex items-start gap-3 max-w-md">
                <MapPin className="h-5 w-5 text-gold-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] uppercase tracking-widest2 text-white/55">{t('contact.findUs')}</p>
                  <p className="mt-1 text-[14px] font-medium text-white leading-snug">{BUSINESS.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

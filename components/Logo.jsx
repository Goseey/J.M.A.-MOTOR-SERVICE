import React from 'react';

/**
 * JMA Logo wordmark — pure text-based mark.
 * "J.M.A." in metallic silver with gold-dot accents; "MOTOR SERVICE" small label.
 */
export default function Logo({ className = '', compact = false }) {
  return (
    <a
      href="#home"
      className={`group inline-flex items-center gap-3 ${className}`}
      data-testid="jma-logo"
      aria-label="J.M.A. Motor Service — home"
    >
      <span className="relative inline-flex items-center">
        <span className="font-display font-extrabold tracking-tight text-metal-silver text-2xl md:text-[28px] leading-none">
          J<span className="text-gold-400">.</span>M<span className="text-gold-400">.</span>A<span className="text-gold-400">.</span>
        </span>
      </span>
      {!compact && (
        <span className="hidden sm:flex flex-col leading-tight">
          <span className="text-[10px] font-semibold tracking-widest2 uppercase text-white/70">Motor</span>
          <span className="text-[10px] font-semibold tracking-widest2 uppercase text-gold-400">Service</span>
        </span>
      )}
    </a>
  );
}

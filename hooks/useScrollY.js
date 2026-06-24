'use client';

import { useEffect, useState } from 'react';

/**
 * Lightweight throttled scroll-position hook.
 * Single source of truth for scroll-based UI (header shadow, parallax, floating CTAs).
 */
export default function useScrollY({ disabled = false } = {}) {
  const [y, setY] = useState(0);

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return undefined;
    let frame = 0;
    const tick = () => {
      frame = 0;
      setY(window.scrollY);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    tick();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [disabled]);

  return y;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

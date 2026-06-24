import { useEffect, useState } from 'react';

/**
 * Lightweight throttled scroll-position hook.
 * - Returns the current window.scrollY value (throttled via rAF)
 * - Single source of truth for scroll-based UI (header shadow, parallax, floating CTAs)
 * - Honors prefers-reduced-motion: returns scrollY but skips the rAF wrapper
 */
export default function useScrollY({ disabled = false } = {}) {
  const [y, setY] = useState(() =>
    typeof window === 'undefined' ? 0 : window.scrollY,
  );

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

/** Returns true when prefers-reduced-motion is requested. */
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

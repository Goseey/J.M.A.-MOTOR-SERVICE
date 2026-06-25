'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANG, LANGUAGES, makeT } from '@/lib/i18n';

const STORAGE_KEY = 'jma.lang';
const VALID_LANGS = new Set(LANGUAGES.map((l) => l.code));

const AppContext = createContext(null);

/**
 * Single global UI state:
 *  - language (with localStorage persistence + <html lang> sync)
 *  - preselectedService (used to deep-link from service cards into the booking form)
 */
export function AppProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [preselectedService, setPreselectedServiceState] = useState('');
  const [hydrated, setHydrated] = useState(false);

  // Restore from localStorage on first client render.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_LANGS.has(saved)) setLangState(saved);
    } catch {
      /* localStorage unavailable */
    }
    setHydrated(true);
  }, []);

  // Keep <html lang="…"> in sync for accessibility + SEO.
  useEffect(() => {
    if (!hydrated || typeof document === 'undefined') return;
    document.documentElement.setAttribute('lang', lang);
  }, [lang, hydrated]);

  const setLang = useCallback((next) => {
    if (!VALID_LANGS.has(next)) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const setPreselectedService = useCallback((service) => {
    setPreselectedServiceState(service || '');
  }, []);

  const t = useMemo(() => makeT(lang), [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t, preselectedService, setPreselectedService, hydrated }),
    [lang, setLang, t, preselectedService, setPreselectedService, hydrated],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

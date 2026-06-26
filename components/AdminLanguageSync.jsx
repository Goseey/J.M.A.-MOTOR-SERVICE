'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

export default function AdminLanguageSync() {
  const { lang } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== '/admin') return;
    const current = searchParams.get('lang') || 'en';
    if (current === lang) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', lang);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [lang, pathname, router, searchParams]);

  return null;
}

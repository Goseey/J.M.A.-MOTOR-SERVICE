'use client';

import { useEffect, useRef } from 'react';

const SEARCH_DEBOUNCE_MS = 400;

export default function AdminAutoSubmitFilters() {
  const formRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const form = document.querySelector('[data-testid="admin-filters-bar"]');
    if (!(form instanceof HTMLFormElement)) return undefined;

    formRef.current = form;

    const submitForm = () => {
      if (!formRef.current) return;
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      formRef.current.requestSubmit();
    };

    const handleInput = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.name !== 'q') return;

      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        formRef.current?.requestSubmit();
        timerRef.current = null;
      }, SEARCH_DEBOUNCE_MS);
    };

    const handleChange = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
      if (target.name === 'q') return;
      submitForm();
    };

    form.addEventListener('input', handleInput);
    form.addEventListener('change', handleChange);

    return () => {
      form.removeEventListener('input', handleInput);
      form.removeEventListener('change', handleChange);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}

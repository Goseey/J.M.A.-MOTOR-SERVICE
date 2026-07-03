'use client';

import { useEffect, useRef } from 'react';

export default function AdminAutoSubmitFilters() {
  const formRef = useRef(null);

  useEffect(() => {
    const form = document.querySelector('[data-testid="admin-filters-bar"]');
    if (!(form instanceof HTMLFormElement)) return undefined;

    formRef.current = form;

    const submitForm = () => {
      if (!formRef.current) return;
      formRef.current.requestSubmit();
    };

    const handleChange = (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
      if (target.name === 'q') return;
      submitForm();
    };

    form.addEventListener('change', handleChange);

    return () => {
      form.removeEventListener('change', handleChange);
    };
  }, []);

  return null;
}

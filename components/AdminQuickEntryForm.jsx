'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { Plus, FilePlus2, Loader2, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const INITIAL_STATE = {
  ok: false,
  error: '',
  errorKey: '',
  values: {},
};

function Field({ label, name, type = 'text', placeholder, defaultValue = '', required = false }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest2 text-white/55">
          {label} {required ? <span className="text-gold-300">*</span> : null}
        </span>
      </div>
      {name === 'message' ? (
        <textarea
          name={name}
          rows={4}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="min-h-[120px] w-full resize-y rounded-sm border border-white/10 bg-ink-800 px-4 py-3 text-[14px] text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus-gold"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-12 w-full rounded-sm border border-white/10 bg-ink-800 px-4 text-[14px] text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus-gold"
          required={required}
        />
      )}
    </label>
  );
}

export default function AdminQuickEntryForm({ action }) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const values = state?.values || {};
  const errorText = state?.errorKey ? t(state.errorKey) : state?.error;

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state?.ok]);

  return (
    <>
      <div className="flex items-center justify-between gap-4" data-testid="admin-quick-entry-trigger-wrap">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-gold-400/30 bg-gold-400/10 text-gold-200 transition-colors hover:border-gold-400/50 hover:bg-gold-400/15 hover:text-gold-100"
          data-testid="admin-open-quick-entry"
          title={t('admin.journal.submit')}
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-5" data-testid="admin-quick-entry-modal">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-sm border border-white/10 bg-ink-950 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold-400/25 bg-gold-400/10 text-gold-300">
                    <FilePlus2 className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest2 text-gold-300">{t('admin.journal.overline')}</p>
                    <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">{t('admin.journal.headline')}</h2>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">{t('admin.journal.hint')}</p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/10 text-white/70 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                data-testid="admin-close-quick-entry"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-92px)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <form action={formAction} className="grid grid-cols-1 gap-5 md:grid-cols-2" data-testid="admin-quick-entry-form">
                <Field label={t('admin.journal.fields.name')} name="customer_name" placeholder={t('admin.journal.placeholders.name')} defaultValue={values.customer_name} required />
                <Field label={t('admin.journal.fields.phone')} name="phone" placeholder={t('admin.journal.placeholders.phone')} defaultValue={values.phone} required />
                <Field label={t('admin.journal.fields.email')} name="email" type="email" placeholder={t('admin.journal.placeholders.email')} defaultValue={values.email} />
                <Field label={t('admin.journal.fields.car')} name="car_make_model" placeholder={t('admin.journal.placeholders.car')} defaultValue={values.car_make_model} required />
                <Field label={t('admin.journal.fields.service')} name="service_needed" placeholder={t('admin.journal.placeholders.service')} defaultValue={values.service_needed} required />
                <Field label={t('admin.journal.fields.date')} name="preferred_date" type="date" defaultValue={values.preferred_date} />
                <div className="md:col-span-2">
                  <Field label={t('admin.journal.fields.message')} name="message" placeholder={t('admin.journal.placeholders.message')} defaultValue={values.message} />
                </div>

                {errorText ? (
                  <div className="md:col-span-2 flex items-start gap-3 rounded-sm border border-red-500/35 bg-red-500/10 px-4 py-3 text-red-200" data-testid="admin-quick-entry-error">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
                    <p className="text-[13px] leading-relaxed">{errorText}</p>
                  </div>
                ) : null}

                {state?.ok ? (
                  <div className="md:col-span-2 flex items-start gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100" data-testid="admin-quick-entry-success">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.8} />
                    <p className="text-[13px] leading-relaxed">{t('admin.journal.success')}</p>
                  </div>
                ) : null}

                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-12 items-center justify-center rounded-sm border border-white/10 px-5 text-[13px] font-semibold tracking-wide text-white/75 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                  >
                    {t('admin.journal.close')}
                  </button>

                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-gold-400 px-5 text-[13px] font-semibold tracking-wide text-ink-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
                    data-testid="admin-quick-entry-submit"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Plus className="h-4 w-4" strokeWidth={2} />}
                    {t('admin.journal.submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

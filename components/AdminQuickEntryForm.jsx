'use client';

import React, { useActionState } from 'react';
import { Plus, FilePlus2, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';

const INITIAL_STATE = {
  ok: false,
  error: '',
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

export default function AdminQuickEntryForm({ action, t }) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const values = state?.values || {};

  return (
    <section className="border border-white/10 bg-ink-900/90 p-6 sm:p-8 rounded-sm shadow-ring" data-testid="admin-quick-entry">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-gold-400/25 bg-gold-400/10 text-gold-300">
              <FilePlus2 className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <div>
              <div className="text-[11px] uppercase tracking-widest2 text-gold-300">{t('admin.journal.overline')}</div>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">{t('admin.journal.headline')}</h2>
            </div>
          </div>
          <p className="text-white/60 leading-relaxed">{t('admin.journal.description')}</p>
        </div>

        <div className="rounded-sm border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] text-white/55 lg:max-w-sm">
          {t('admin.journal.hint')}
        </div>
      </div>

      <form action={formAction} className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2" data-testid="admin-quick-entry-form">
        <Field label={t('admin.journal.fields.name')} name="customer_name" placeholder={t('admin.journal.placeholders.name')} defaultValue={values.customer_name} required />
        <Field label={t('admin.journal.fields.phone')} name="phone" placeholder={t('admin.journal.placeholders.phone')} defaultValue={values.phone} required />
        <Field label={t('admin.journal.fields.email')} name="email" type="email" placeholder={t('admin.journal.placeholders.email')} defaultValue={values.email} />
        <Field label={t('admin.journal.fields.car')} name="car_make_model" placeholder={t('admin.journal.placeholders.car')} defaultValue={values.car_make_model} required />
        <Field label={t('admin.journal.fields.service')} name="service_needed" placeholder={t('admin.journal.placeholders.service')} defaultValue={values.service_needed} required />
        <Field label={t('admin.journal.fields.date')} name="preferred_date" type="date" defaultValue={values.preferred_date} />
        <div className="md:col-span-2">
          <Field label={t('admin.journal.fields.message')} name="message" placeholder={t('admin.journal.placeholders.message')} defaultValue={values.message} />
        </div>

        {state?.error ? (
          <div className="md:col-span-2 flex items-start gap-3 rounded-sm border border-red-500/35 bg-red-500/10 px-4 py-3 text-red-200" data-testid="admin-quick-entry-error">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
            <p className="text-[13px] leading-relaxed">{state.error}</p>
          </div>
        ) : null}

        {state?.ok ? (
          <div className="md:col-span-2 flex items-start gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100" data-testid="admin-quick-entry-success">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.8} />
            <p className="text-[13px] leading-relaxed">{t('admin.journal.success')}</p>
          </div>
        ) : null}

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-1">
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
    </section>
  );
}

'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Pencil, ShieldAlert, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

const INITIAL_STATE = {
  ok: false,
  error: '',
  errorKey: '',
  values: {},
};

const STATUS_OPTIONS = ['new', 'stale', 'contacted', 'confirmed', 'completed', 'cancelled'];

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

export default function AdminUpdateRequestButton({ request, action }) {
  const { t } = useApp();
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const [open, setOpen] = useState(false);
  const values = state?.values && state.values.id === request.id ? state.values : request;
  const errorText = state?.errorKey ? t(state.errorKey) : state?.error;

  useBodyScrollLock(open);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state?.ok]);

  return (
    <>
      <div className="lg:text-right">
        <p className="lg:hidden text-[10px] uppercase tracking-widest2 text-white/35 mb-2">Update</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-sky-400/20 bg-sky-500/10 text-sky-200 transition-colors hover:border-sky-400/40 hover:bg-sky-500/15"
          data-testid={`admin-update-${request.id}`}
          title="Update request"
        >
          <Pencil className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-sm border border-white/10 bg-ink-950 shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6 sm:py-6">
              <div className="min-w-0 flex-1 pr-2 text-left">
                <p className="text-[11px] uppercase tracking-widest2 text-gold-300">Admin update</p>
                <h2 className="mt-1 font-display text-xl font-bold text-white sm:text-2xl">Update service request</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/55">
                  Edit client details, service information, status, and preferred date. If the date changes and the customer has an email, they will receive an update email automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/10 text-white/70 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="max-h-[calc(92vh-92px)] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <form action={formAction} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <input type="hidden" name="id" value={request.id} />
                <input type="hidden" name="selected_language" value={request.selected_language || 'en'} />
                <input type="hidden" name="previous_preferred_date" value={request.preferred_date ? String(request.preferred_date).slice(0, 10) : ''} />

                <Field label={t('admin.journal.fields.name')} name="customer_name" placeholder={t('admin.journal.placeholders.name')} defaultValue={values.customer_name || ''} required />
                <Field label={t('admin.journal.fields.phone')} name="phone" placeholder={t('admin.journal.placeholders.phone')} defaultValue={values.phone || ''} required />
                <Field label={t('admin.journal.fields.email')} name="email" type="email" placeholder={t('admin.journal.placeholders.email')} defaultValue={values.email || ''} />
                <Field label={t('admin.journal.fields.car')} name="car_make_model" placeholder={t('admin.journal.placeholders.car')} defaultValue={values.car_make_model || ''} required />
                <Field label={t('admin.journal.fields.service')} name="service_needed" placeholder={t('admin.journal.placeholders.service')} defaultValue={values.service_needed || ''} required />
                <Field label={t('admin.journal.fields.date')} name="preferred_date" type="date" defaultValue={values.preferred_date ? String(values.preferred_date).slice(0, 10) : ''} />

                <label className="block md:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-widest2 text-white/55">{t('admin.table.status')}</span>
                  </div>
                  <select
                    name="status"
                    defaultValue={values.status || 'new'}
                    className="h-12 w-full rounded-sm border border-white/10 bg-ink-800 px-4 text-[14px] text-white transition-colors hover:border-white/20 focus-gold"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status} className="bg-ink-900 text-white">
                        {t(`admin.statusLabels.${status}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="md:col-span-2">
                  <Field label={t('admin.journal.fields.message')} name="message" placeholder={t('admin.journal.placeholders.message')} defaultValue={values.message || ''} />
                </div>

                {errorText ? (
                  <div className="md:col-span-2 flex items-start gap-3 rounded-sm border border-red-500/35 bg-red-500/10 px-4 py-3 text-red-200">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
                    <p className="text-[13px] leading-relaxed">{errorText}</p>
                  </div>
                ) : null}

                {state?.ok ? (
                  <div className="md:col-span-2 flex items-start gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.8} />
                    <p className="text-[13px] leading-relaxed">Request updated successfully.</p>
                  </div>
                ) : null}

                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex h-12 items-center justify-center rounded-sm border border-white/10 px-5 text-[13px] font-semibold tracking-wide text-white/75 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-gold-400 px-5 text-[13px] font-semibold tracking-wide text-ink-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <Pencil className="h-4 w-4" strokeWidth={2} />}
                    Save changes
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

'use client';

import React, { useEffect, useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { submitServiceRequest } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { FormField, inputCls } from './form/FormField';

const INITIAL_FORM = {
  name: '', phone: '', email: '', car_make_model: '',
  service_needed: '', preferred_date: '', message: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function makeValidator(t) {
  return (form) => {
    const errors = {};
    if (form.name.trim().length < 2) errors.name = t('form.validation.name');
    if (form.phone.trim().length < 5) errors.phone = t('form.validation.phone');
    if (form.email && !EMAIL_RE.test(form.email.trim())) errors.email = t('form.validation.email');
    if (form.car_make_model.trim().length < 1) errors.car_make_model = t('form.validation.car');
    if (form.service_needed.trim().length < 1) errors.service_needed = t('form.validation.service');
    return errors;
  };
}

export default function ServiceRequestForm() {
  const { t, lang, preselectedService, setPreselectedService } = useApp();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [showPreselectNote, setShowPreselectNote] = useState(false);

  // Wire up service preselection from the service cards.
  useEffect(() => {
    if (preselectedService) {
      setForm((f) => ({ ...f, service_needed: preselectedService }));
      setErrors((er) => ({ ...er, service_needed: undefined }));
      setShowPreselectNote(true);
      // Auto-hide the helper note after a few seconds
      const tid = window.setTimeout(() => setShowPreselectNote(false), 4500);
      return () => window.clearTimeout(tid);
    }
  }, [preselectedService]);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const validate = makeValidator(t);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('submitting');
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        car_make_model: form.car_make_model.trim(),
        service_needed: form.service_needed.trim(),
        preferred_date: form.preferred_date || undefined,
        message: form.message.trim() || undefined,
        selected_language: lang,
      };
      await submitServiceRequest(payload);
      setSubmittedName(form.name.trim());
      setStatus('success');
      setForm(INITIAL_FORM);
      setPreselectedService('');
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        t('form.validation.generic');
      setServerError(typeof detail === 'string' ? detail : t('form.validation.generic'));
      setStatus('error');
    }
  };

  const serviceOptions = t('services_list_short') || [];

  return (
    <section
      id="service-request"
      data-testid="service-request-section"
      className="relative py-24 sm:py-32 bg-ink-950 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-gold-400/20" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-gold-400/20" aria-hidden="true" />

      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
        <FormHeader t={t} />

        {status === 'success' ? (
          <SuccessCard
            t={t}
            submittedName={submittedName}
            onReset={() => setStatus('idle')}
          />
        ) : (
          <form
            onSubmit={onSubmit}
            data-testid="service-request-form"
            className="mt-14 bg-ink-900 border border-white/10 p-6 sm:p-10 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-5"
            noValidate
          >
            {showPreselectNote && (
              <div
                className="md:col-span-2 flex items-start gap-3 p-3 bg-gold-400/10 border border-gold-400/30 text-gold-200 rounded-sm animate-fade-up"
                data-testid="form-preselect-note"
              >
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="text-[12.5px] leading-relaxed">{t('form.preselectedNote')}</p>
              </div>
            )}

            <FormField label={t('form.fields.name')} required error={errors.name} testid="form-field-name">
              <input
                type="text" autoComplete="name" value={form.name} onChange={update('name')}
                className={inputCls(errors.name)} placeholder={t('form.placeholders.name')}
                data-testid="form-input-name"
              />
            </FormField>

            <FormField label={t('form.fields.phone')} required error={errors.phone} testid="form-field-phone">
              <input
                type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')}
                className={inputCls(errors.phone)} placeholder={t('form.placeholders.phone')}
                data-testid="form-input-phone"
              />
            </FormField>

            <FormField label={t('form.fields.email')} hint={t('form.hints.optional')} error={errors.email} testid="form-field-email">
              <input
                type="email" autoComplete="email" value={form.email} onChange={update('email')}
                className={inputCls(errors.email)} placeholder={t('form.placeholders.email')}
                data-testid="form-input-email"
              />
            </FormField>

            <FormField label={t('form.fields.car')} required error={errors.car_make_model} testid="form-field-car">
              <input
                type="text" value={form.car_make_model} onChange={update('car_make_model')}
                className={inputCls(errors.car_make_model)} placeholder={t('form.placeholders.car')}
                data-testid="form-input-car"
              />
            </FormField>

            <FormField label={t('form.fields.service')} required error={errors.service_needed} testid="form-field-service">
              <ServiceSelect
                value={form.service_needed}
                onChange={update('service_needed')}
                error={errors.service_needed}
                placeholder={t('form.placeholders.servicePick')}
                options={serviceOptions}
              />
            </FormField>

            <FormField label={t('form.fields.date')} hint={t('form.hints.optional')} testid="form-field-date">
              <input
                type="date" value={form.preferred_date} onChange={update('preferred_date')}
                className={`${inputCls()} text-white/85`}
                data-testid="form-input-date"
              />
            </FormField>

            <FormField label={t('form.fields.message')} hint={t('form.hints.messageHint')} testid="form-field-message" className="md:col-span-2">
              <textarea
                rows={4} value={form.message} onChange={update('message')}
                className={inputCls() + ' resize-y min-h-[110px]'}
                placeholder={t('form.placeholders.message')}
                data-testid="form-input-message"
              />
            </FormField>

            <div className="md:col-span-2 text-[12px] text-white/55 leading-relaxed border-l-2 border-gold-400/50 pl-4" data-testid="form-disclaimer">
              {t('form.disclaimer1')}{' '}
              <strong className="text-white">{t('form.disclaimer2')}</strong>{' '}
              {t('form.disclaimer3')}
            </div>

            {status === 'error' && serverError && (
              <div className="md:col-span-2 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/40 text-red-200 rounded-sm" data-testid="form-server-error">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <p className="text-[13px] leading-relaxed">{serverError}</p>
              </div>
            )}

            <div className="md:col-span-2">
              <button
                type="submit" disabled={status === 'submitting'} data-testid="form-submit-button"
                className="inline-flex items-center justify-center gap-2 h-13 sm:h-14 px-8 w-full sm:w-auto bg-gold-400 hover:bg-gold-300 disabled:opacity-60 disabled:cursor-not-allowed text-ink-950 font-semibold tracking-wide rounded-sm transition-colors shadow-gold"
              >
                {status === 'submitting' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {t('form.sending')}</>
                ) : (
                  <><Send className="h-4 w-4" /> {t('form.submit')}</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function FormHeader({ t }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-5">
        <span className="h-px w-8 bg-gold-400" />
        <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="form-overline">
          {t('form.overline')}
        </span>
        <span className="h-px w-8 bg-gold-400" />
      </div>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="form-headline">
        {t('form.headline')}
      </h2>
      <p className="mt-5 text-white/65 leading-relaxed">
        {t('form.description')}
      </p>
    </div>
  );
}

function ServiceSelect({ value, onChange, error, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange}
        className={`${inputCls(error)} appearance-none pr-10 cursor-pointer`}
        data-testid="form-input-service"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

function SuccessCard({ t, submittedName, onReset }) {
  return (
    <div
      data-testid="form-success"
      className="mt-14 max-w-2xl mx-auto bg-ink-900 border border-emerald-500/30 p-8 sm:p-10 rounded-sm text-center animate-fade-up"
    >
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-400 mb-5">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="font-display text-2xl font-bold text-white">
        {t('form.success.thanks')}{submittedName ? `, ${submittedName}` : ''} {t('form.success.received')}
      </h3>
      <p className="mt-3 text-white/65 leading-relaxed">
        <strong className="text-white">{t('form.success.confirmation')}</strong>
        <br className="hidden sm:block" /> {t('form.success.notAutomatic')}
      </p>
      <button
        type="button" onClick={onReset} data-testid="form-send-another"
        className="mt-7 inline-flex items-center h-11 px-5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-[13px] tracking-wide rounded-sm transition-colors"
      >
        {t('form.success.sendAnother')}
      </button>
    </div>
  );
}

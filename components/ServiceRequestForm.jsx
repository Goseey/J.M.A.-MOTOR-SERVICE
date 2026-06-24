'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitServiceRequest } from '@/lib/api';
import { validateServiceRequest, isValid } from '@/lib/validation';
import { FormField, inputCls } from './form/FormField';

const SERVICE_OPTIONS = [
  'Car diagnostics', 'Full car service', 'Oil and filter change',
  'Brake inspection and repair', 'Engine maintenance', 'Battery check and replacement',
  'Suspension and steering', 'Pre-NCT check', 'General car repairs', 'Other / not sure',
];

const INITIAL_FORM = {
  name: '', phone: '', email: '', car_make_model: '',
  service_needed: '', preferred_date: '', message: '',
};

export default function ServiceRequestForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [serverError, setServerError] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const nextErrors = validateServiceRequest(form);
    setErrors(nextErrors);
    if (!isValid(nextErrors)) return;

    setStatus('submitting');
    try {
      const payload = {
        ...form,
        email: form.email.trim() || undefined,
        preferred_date: form.preferred_date || undefined,
        message: form.message.trim() || undefined,
      };
      await submitServiceRequest(payload);
      setSubmittedName(form.name.trim());
      setStatus('success');
      setForm(INITIAL_FORM);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        'Something went wrong. Please call us directly.';
      setServerError(typeof detail === 'string' ? detail : 'Submission failed. Please try again.');
      setStatus('error');
    }
  };

  return (
    <section
      id="service-request"
      data-testid="service-request-section"
      className="relative py-24 sm:py-32 bg-ink-950 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-gold-400/20" aria-hidden="true" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-gold-400/20" aria-hidden="true" />

      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-10">
        <FormHeader />

        {status === 'success' ? (
          <SuccessCard submittedName={submittedName} onReset={() => setStatus('idle')} />
        ) : (
          <form
            onSubmit={onSubmit}
            data-testid="service-request-form"
            className="mt-14 bg-ink-900 border border-white/10 p-6 sm:p-10 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-5"
            noValidate
          >
            <FormFields form={form} errors={errors} update={update} />
            <FormDisclaimer />
            {status === 'error' && serverError && <ServerErrorBanner message={serverError} />}
            <FormSubmitButton submitting={status === 'submitting'} />
          </form>
        )}
      </div>
    </section>
  );
}

function FormHeader() {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-5">
        <span className="h-px w-8 bg-gold-400" />
        <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="form-overline">
          Service request
        </span>
        <span className="h-px w-8 bg-gold-400" />
      </div>
      <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]" data-testid="form-headline">
        Tell us about your car.
      </h2>
      <p className="mt-5 text-white/65 leading-relaxed">
        Send a quick request and we&apos;ll get back to confirm availability.
        For urgent issues, call us directly — it&apos;s faster.
      </p>
    </div>
  );
}

function FormFields({ form, errors, update }) {
  return (
    <>
      <FormField label="Your name" required error={errors.name} testid="form-field-name">
        <input
          type="text" autoComplete="name" value={form.name} onChange={update('name')}
          className={inputCls(errors.name)} placeholder="John O'Connor"
          data-testid="form-input-name"
        />
      </FormField>

      <FormField label="Phone" required error={errors.phone} testid="form-field-phone">
        <input
          type="tel" autoComplete="tel" value={form.phone} onChange={update('phone')}
          className={inputCls(errors.phone)} placeholder="085 123 4567"
          data-testid="form-input-phone"
        />
      </FormField>

      <FormField label="Email" hint="optional" error={errors.email} testid="form-field-email">
        <input
          type="email" autoComplete="email" value={form.email} onChange={update('email')}
          className={inputCls(errors.email)} placeholder="you@example.com"
          data-testid="form-input-email"
        />
      </FormField>

      <FormField label="Car make & model" required error={errors.car_make_model} testid="form-field-car">
        <input
          type="text" value={form.car_make_model} onChange={update('car_make_model')}
          className={inputCls(errors.car_make_model)} placeholder="VW Golf 1.6 TDI, 2016"
          data-testid="form-input-car"
        />
      </FormField>

      <FormField label="Service needed" required error={errors.service_needed} testid="form-field-service">
        <ServiceSelect value={form.service_needed} onChange={update('service_needed')} error={errors.service_needed} />
      </FormField>

      <FormField label="Preferred date" hint="optional" testid="form-field-date">
        <input
          type="date" value={form.preferred_date} onChange={update('preferred_date')}
          className={`${inputCls()} text-white/85`}
          data-testid="form-input-date"
        />
      </FormField>

      <FormField label="Message" hint="optional — describe the issue" testid="form-field-message" className="md:col-span-2">
        <textarea
          rows={4} value={form.message} onChange={update('message')}
          className={inputCls() + ' resize-y min-h-[110px]'}
          placeholder="Anything we should know? Noises, warning lights, recent work, etc."
          data-testid="form-input-message"
        />
      </FormField>
    </>
  );
}

function ServiceSelect({ value, onChange, error }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange}
        className={`${inputCls(error)} appearance-none pr-10 cursor-pointer`}
        data-testid="form-input-service"
      >
        <option value="" disabled>Select a service…</option>
        {SERVICE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/55" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

function FormDisclaimer() {
  return (
    <div className="md:col-span-2 text-[12px] text-white/55 leading-relaxed border-l-2 border-gold-400/50 pl-4" data-testid="form-disclaimer">
      By sending this request you agree we may contact you on the details above.
      <strong className="text-white"> We will contact you to confirm availability</strong> —
      your booking is not confirmed automatically.
    </div>
  );
}

function ServerErrorBanner({ message }) {
  return (
    <div className="md:col-span-2 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/40 text-red-200 rounded-sm" data-testid="form-server-error">
      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
      <p className="text-[13px] leading-relaxed">{message}</p>
    </div>
  );
}

function FormSubmitButton({ submitting }) {
  return (
    <div className="md:col-span-2">
      <button
        type="submit" disabled={submitting} data-testid="form-submit-button"
        className="inline-flex items-center justify-center gap-2 h-13 sm:h-14 px-8 w-full sm:w-auto bg-gold-400 hover:bg-gold-300 disabled:opacity-60 disabled:cursor-not-allowed text-ink-950 font-semibold tracking-wide rounded-sm transition-colors shadow-gold"
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
        ) : (
          <><Send className="h-4 w-4" /> Send Request</>
        )}
      </button>
    </div>
  );
}

function SuccessCard({ submittedName, onReset }) {
  return (
    <div
      data-testid="form-success"
      className="mt-14 max-w-2xl mx-auto bg-ink-900 border border-emerald-500/30 p-8 sm:p-10 rounded-sm text-center"
    >
      <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/15 text-emerald-400 mb-5">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="font-display text-2xl font-bold text-white">
        Thanks{submittedName ? `, ${submittedName}` : ''} — request received.
      </h3>
      <p className="mt-3 text-white/65 leading-relaxed">
        <strong className="text-white">We will contact you to confirm availability.</strong>
        <br className="hidden sm:block" /> Your booking is not confirmed automatically.
      </p>
      <button
        type="button" onClick={onReset} data-testid="form-send-another"
        className="mt-7 inline-flex items-center h-11 px-5 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-semibold text-[13px] tracking-wide rounded-sm transition-colors"
      >
        Send another request
      </button>
    </div>
  );
}

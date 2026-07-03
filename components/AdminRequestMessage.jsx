'use client';

import React, { useActionState, useEffect, useId, useRef, useState } from 'react';
import { MessageSquareText, ChevronDown, Loader2, NotebookPen, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const INITIAL_STATE = {
  ok: false,
  error: '',
  errorKey: '',
  value: '',
};

export default function AdminRequestMessage({ request, action, compact = false, indicatorMode = 'single' }) {
  const { t } = useApp();
  const cleanMessage = typeof request?.message === 'string' ? request.message.trim() : '';
  const initialNote = typeof request?.admin_note === 'string' ? request.admin_note : '';
  const [open, setOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(initialNote);
  const rootRef = useRef(null);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const panelId = useId();
  const errorText = state?.errorKey ? t(state.errorKey) : state?.error;
  const hasCustomerMessage = cleanMessage.length > 0;
  const hasAdminNote = initialNote.trim().length > 0;

  useEffect(() => {
    setNoteValue(initialNote);
  }, [initialNote, request?.id]);

  useEffect(() => {
    if (state?.ok) setNoteValue(state.value ?? '');
  }, [state?.ok, state?.value]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [open]);

  if (!hasCustomerMessage && !compact) return null;
  if (!hasCustomerMessage && compact && !hasAdminNote) return null;

  return (
    <div ref={rootRef} className="min-w-0" data-testid="admin-request-message">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="admin-request-message-toggle"
        className={compact
          ? 'inline-flex items-center gap-1.5 rounded-sm transition-colors'
          : 'inline-flex w-full items-center justify-between gap-3 rounded-sm border border-white/10 bg-ink-900/80 px-4 py-3 text-left text-white/80 transition-colors hover:border-gold-400/40 hover:bg-white/[0.03]'
        }
        title={t('admin.notes.viewTitle')}
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          {compact && indicatorMode === 'split' ? (
            <>
              {hasCustomerMessage ? (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-sky-400/25 bg-sky-400/10 text-sky-200 transition-colors hover:border-sky-300/45 hover:bg-sky-400/15" title={t('admin.notes.customerMessage')}>
                  <MessageSquareText className="h-4 w-4" strokeWidth={1.8} />
                </span>
              ) : null}
              {hasAdminNote ? (
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-amber-400/25 bg-amber-400/10 text-amber-200 transition-colors hover:border-amber-300/45 hover:bg-amber-400/15" title={t('admin.notes.internalNote')}>
                  <NotebookPen className="h-4 w-4" strokeWidth={1.8} />
                </span>
              ) : null}
            </>
          ) : (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-gold-400/20 bg-gold-400/10 text-gold-300">
              <MessageSquareText className="h-4 w-4" strokeWidth={1.8} />
            </span>
          )}
          {!compact && (
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-widest2 text-white/40">{t('admin.notes.customerMessage')}</span>
              <span className="block truncate text-[13px] text-white/72">
                {cleanMessage || t('admin.notes.openNotes')}
              </span>
            </span>
          )}
        </span>

        {!compact && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-white/45 transition-transform ${open ? 'rotate-180 text-gold-300' : ''}`}
            strokeWidth={1.8}
          />
        )}
      </button>

      <div
        id={panelId}
        className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
        data-testid="admin-request-message-panel"
      >
        <div className="overflow-hidden">
          <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            {cleanMessage ? (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-px w-6 bg-gold-400" />
                  <span className="text-[10px] uppercase tracking-widest2 text-gold-300">{t('admin.notes.customerMessage')}</span>
                </div>
                <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-white/78">
                  {cleanMessage}
                </p>
              </>
            ) : null}

            <div className={`${cleanMessage ? 'mt-5 border-t border-white/10 pt-5' : ''}`}>
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-sm border border-sky-400/20 bg-sky-400/10 text-sky-200">
                  <NotebookPen className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
                <span className="text-[10px] uppercase tracking-widest2 text-sky-200">{t('admin.notes.internalNote')}</span>
              </div>

              <form action={formAction} className="space-y-3">
                <input type="hidden" name="id" value={request.id} />
                <textarea
                  name="admin_note"
                  rows={4}
                  value={noteValue}
                  onChange={(event) => setNoteValue(event.target.value)}
                  className="min-h-[120px] w-full resize-y rounded-sm border border-white/10 bg-ink-900 px-4 py-3 text-[14px] text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus-gold"
                  placeholder={t('admin.notes.placeholder')}
                  data-testid="admin-request-note-input"
                />

                {errorText ? (
                  <div className="flex items-start gap-3 rounded-sm border border-red-500/35 bg-red-500/10 px-4 py-3 text-red-200">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
                    <p className="text-[13px] leading-relaxed">{errorText}</p>
                  </div>
                ) : null}

                {state?.ok ? (
                  <div className="flex items-start gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.8} />
                    <p className="text-[13px] leading-relaxed">{t('admin.notes.saved')}</p>
                  </div>
                ) : null}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-gold-400 px-4 text-[13px] font-semibold tracking-wide text-ink-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
                    data-testid="admin-request-note-save"
                  >
                    {pending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> : <NotebookPen className="h-4 w-4" strokeWidth={2} />}
                    {t('admin.notes.save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

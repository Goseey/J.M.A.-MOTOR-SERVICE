'use client';

import React, { useActionState, useEffect, useId, useState } from 'react';
import { MessageSquareText, ChevronDown, Loader2, NotebookPen, CheckCircle2, ShieldAlert } from 'lucide-react';

const INITIAL_STATE = {
  ok: false,
  error: '',
  value: '',
};

export default function AdminRequestMessage({ request, action, compact = false }) {
  const cleanMessage = typeof request?.message === 'string' ? request.message.trim() : '';
  const initialNote = typeof request?.admin_note === 'string' ? request.admin_note : '';
  const [open, setOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(initialNote);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  const panelId = useId();

  useEffect(() => {
    setNoteValue(initialNote);
  }, [initialNote, request?.id]);

  useEffect(() => {
    if (state?.ok) setNoteValue(state.value ?? '');
  }, [state?.ok, state?.value]);

  if (!cleanMessage && !compact) return null;
  if (!cleanMessage && compact && !initialNote) return null;

  return (
    <div className="min-w-0" data-testid="admin-request-message">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="admin-request-message-toggle"
        className={compact
          ? 'inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/10 bg-ink-900 text-white/70 transition-colors hover:border-gold-400/50 hover:bg-white/5 hover:text-gold-300'
          : 'inline-flex w-full items-center justify-between gap-3 rounded-sm border border-white/10 bg-ink-900/80 px-4 py-3 text-left text-white/80 transition-colors hover:border-gold-400/40 hover:bg-white/[0.03]'
        }
        title="View customer message"
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-gold-400/20 bg-gold-400/10 text-gold-300">
            <MessageSquareText className="h-4 w-4" strokeWidth={1.8} />
          </span>
          {!compact && (
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-widest2 text-white/40">Customer message</span>
              <span className="block truncate text-[13px] text-white/72">
                {cleanMessage || 'Open notes'}
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
                  <span className="text-[10px] uppercase tracking-widest2 text-gold-300">Customer message</span>
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
                <span className="text-[10px] uppercase tracking-widest2 text-sky-200">Internal note</span>
              </div>

              <form action={formAction} className="space-y-3">
                <input type="hidden" name="id" value={request.id} />
                <textarea
                  name="admin_note"
                  rows={4}
                  value={noteValue}
                  onChange={(event) => setNoteValue(event.target.value)}
                  className="min-h-[120px] w-full resize-y rounded-sm border border-white/10 bg-ink-900 px-4 py-3 text-[14px] text-white placeholder:text-white/30 transition-colors hover:border-white/20 focus-gold"
                  placeholder="Add an internal note for this customer…"
                  data-testid="admin-request-note-input"
                />

                {state?.error ? (
                  <div className="flex items-start gap-3 rounded-sm border border-red-500/35 bg-red-500/10 px-4 py-3 text-red-200">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.8} />
                    <p className="text-[13px] leading-relaxed">{state.error}</p>
                  </div>
                ) : null}

                {state?.ok ? (
                  <div className="flex items-start gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-100">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" strokeWidth={1.8} />
                    <p className="text-[13px] leading-relaxed">Note saved.</p>
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
                    Save note
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

'use client';

import React, { useId, useState } from 'react';
import { MessageSquareText, ChevronDown } from 'lucide-react';

export default function AdminRequestMessage({ message, compact = false }) {
  const cleanMessage = typeof message === 'string' ? message.trim() : '';
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (!cleanMessage) return null;

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
                {cleanMessage}
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
            <div className="mb-3 flex items-center gap-2">
              <span className="h-px w-6 bg-gold-400" />
              <span className="text-[10px] uppercase tracking-widest2 text-gold-300">Customer message</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-white/78">
              {cleanMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

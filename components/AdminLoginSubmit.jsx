'use client';

import React, { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { LockKeyhole, Loader2 } from 'lucide-react';

/**
 * Submit button for the admin login form.
 *
 * When the server has locked this IP (error=2 with a `wait` value), the button
 * is disabled and shows a live countdown, re-enabling itself when the block
 * expires. This makes the server-side brute-force block visible: during the
 * window the form is genuinely inert, not just showing a message.
 */
export default function AdminLoginSubmit({ initialWait = 0, submitLabel, lockedTemplate }) {
  const { pending } = useFormStatus();
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor(initialWait)));

  useEffect(() => {
    setRemaining(Math.max(0, Math.floor(initialWait)));
  }, [initialWait]);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const id = setInterval(() => {
      setRemaining((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const locked = remaining > 0;
  const disabled = locked || pending;
  const lockedLabel = (lockedTemplate || 'Locked — try again in {seconds}s').replace('{seconds}', String(remaining));

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-disabled={disabled}
      className="inline-flex items-center justify-center gap-2 h-12 px-5 w-full rounded-sm bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold tracking-wide transition-colors shadow-gold disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-gold-400"
      data-testid="admin-login-submit"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
      ) : (
        <LockKeyhole className="h-4 w-4" strokeWidth={2} />
      )}
      {locked ? lockedLabel : submitLabel}
    </button>
  );
}

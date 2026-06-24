import React from 'react';

/**
 * Reusable labeled form field wrapper. Pure presentational, no state.
 */
export function FormField({ label, hint, required, error, children, testid, className = '' }) {
  return (
    <label className={`block ${className}`} data-testid={testid}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-widest2 text-white/55 font-medium">
          {label} {required && <span className="text-gold-300">*</span>}
        </span>
        {hint && <span className="text-[10px] uppercase tracking-widest2 text-white/35">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="mt-2 text-[12px] text-red-300" data-testid={`${testid}-error`}>
          {error}
        </p>
      )}
    </label>
  );
}

export function inputCls(error) {
  return [
    'w-full bg-ink-800 text-white placeholder-white/30',
    'border rounded-sm h-12 px-4 text-[14.5px]',
    'transition-colors focus-gold',
    error ? 'border-red-500/60' : 'border-white/10 hover:border-white/20',
  ].join(' ');
}

'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

interface ShuttleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const ShuttleInput = forwardRef<HTMLInputElement, ShuttleInputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-semibold"
            style={{ color: 'var(--sl-foreground)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`shuttle-input ${error ? 'border-sl-error' : ''} ${className}`}
          style={error ? { borderColor: 'var(--sl-error)' } : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-xs font-medium"
            style={{ color: 'var(--sl-error)' }}
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span
            className="text-xs"
            style={{ color: 'var(--sl-muted)' }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

ShuttleInput.displayName = 'ShuttleInput';

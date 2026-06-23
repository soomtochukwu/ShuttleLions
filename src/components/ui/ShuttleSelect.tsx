'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';

interface ShuttleSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const ShuttleSelect = forwardRef<HTMLSelectElement, ShuttleSelectProps>(
  ({ label, error, helperText, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-semibold"
            style={{ color: 'var(--sl-foreground)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`shuttle-input ${error ? 'border-sl-error' : ''} ${className}`}
          style={{
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7B6B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            paddingRight: '40px',
            ...(error ? { borderColor: 'var(--sl-error)' } : {}),
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span
            id={`${selectId}-error`}
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

ShuttleSelect.displayName = 'ShuttleSelect';

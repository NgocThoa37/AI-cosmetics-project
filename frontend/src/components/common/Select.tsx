'use client';

import React from 'react';
import clsx from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className, ...props }) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-bold text-brand-dark/70 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={clsx(
          'w-full text-xs px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:border-brand-accent transition-colors',
          error ? 'border-red-500' : 'border-brand-warm',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
};
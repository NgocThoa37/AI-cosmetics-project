import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-xs font-bold text-brand-dark/70 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full text-xs px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:border-[#DE6B6B] transition-colors',
              icon && 'pl-10',
              error ? 'border-red-500' : 'border-brand-warm',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[10px] text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
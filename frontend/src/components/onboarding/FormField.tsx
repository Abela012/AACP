import React, { type ReactNode } from 'react';
import { cn } from '@/src/shared/utils/cn';

type FormFieldProps = {
  label: string;
  helper?: string;
  example?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export default function FormField({
  label,
  helper,
  example,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {helper && <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{helper}</p>}
      {example && (
        <p className="text-[11px] text-primary-blue/90 dark:text-neutral-border/90 font-medium">Example: {example}</p>
      )}
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{ className?: string }>,
            {
              className: cn(
                (children as React.ReactElement<{ className?: string }>).props
                  .className,
                error &&
                  'border-red-500 focus:ring-red-500/30 dark:border-red-500',
              ),
            },
          )
        : children}
      {error && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export const inputClass =
  'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue/30';

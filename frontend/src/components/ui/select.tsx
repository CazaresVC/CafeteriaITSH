import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full min-h-11 rounded-md border border-outline bg-surface-container-lowest px-3 py-2 text-base text-on-surface shadow-sm',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary',
          'disabled:cursor-not-allowed disabled:bg-surface-container disabled:opacity-70',
          className,
        )}
        {...props}
      />
    );
  },
);

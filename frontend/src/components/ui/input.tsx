import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-md border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface shadow-sm',
          'placeholder:text-outline',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
          'disabled:cursor-not-allowed disabled:bg-surface-container disabled:opacity-70',
          className,
        )}
        {...props}
      />
    );
  },
);

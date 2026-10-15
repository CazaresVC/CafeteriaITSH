import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Variante = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTES: Record<Variante, string> = {
  primary:
    'bg-primary text-on-primary shadow-sm hover:bg-primary/90 active:bg-primary/95',
  secondary:
    'border border-primary/30 bg-white text-primary hover:border-primary/50 hover:bg-primary-container/50',
  ghost: 'bg-transparent text-on-surface-variant hover:bg-surface-container',
  danger: 'bg-error text-on-error shadow-sm hover:bg-error/90',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variante = 'primary', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none',
        VARIANTES[variante],
        className,
      )}
      {...props}
    />
  );
});

import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type Tono = 'neutral' | 'primary' | 'especial' | 'error' | 'success' | 'info' | 'contador';

const TONOS: Record<Tono, string> = {
  neutral: 'bg-surface-container text-on-surface-variant',
  primary: 'bg-primary-container text-on-primary-container',
  especial: 'bg-tertiary-container text-on-tertiary-container',
  error: 'bg-error-container text-on-error-container',
  success: 'bg-status-delivered/12 text-status-delivered',
  info: 'bg-status-ready/12 text-status-ready',
  contador: 'bg-error text-on-error',
};

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tono?: Tono;
}

export function Badge({ tono = 'neutral', className, ...props }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONOS[tono],
        className,
      )}
      {...props}
    />
  );
}

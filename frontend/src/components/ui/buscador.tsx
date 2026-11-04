import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { IconoBuscar } from '../iconos';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  etiqueta?: string;
}

export function Buscador({ etiqueta = 'Buscar producto', className, ...props }: Props) {
  return (
    <div className={cn('relative', className)}>
      <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
      <input
        type="search"
        aria-label={etiqueta}
        placeholder={`${etiqueta}…`}
        className="min-h-11 w-full rounded-lg border border-outline bg-surface-container-lowest py-2 pl-9 pr-3 text-base text-on-surface shadow-sm placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
        {...props}
      />
    </div>
  );
}

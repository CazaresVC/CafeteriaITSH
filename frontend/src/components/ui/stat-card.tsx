import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  valor: ReactNode;
  etiqueta: string;
  icono?: ReactNode;
  className?: string;
}

export function StatCard({ valor, etiqueta, icono, className }: Props) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border border-outline-variant/70 bg-white p-5 shadow-sm',
        className,
      )}
    >
      {icono && (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
          {icono}
        </span>
      )}
      <div className="min-w-0">
        <p className="font-heading text-3xl font-extrabold leading-9 tracking-tight text-on-surface">
          {valor}
        </p>
        <p className="truncate text-sm font-medium text-on-surface-variant">{etiqueta}</p>
      </div>
    </div>
  );
}

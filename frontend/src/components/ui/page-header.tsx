import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  titulo: string;
  descripcion?: string;
  icono?: ReactNode;
  acciones?: ReactNode;
  className?: string;
}

export function PageHeader({ titulo, descripcion, icono, acciones, className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {icono && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
            {icono}
          </span>
        )}
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-on-surface">
            {titulo}
          </h1>
          {descripcion && (
            <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">{descripcion}</p>
          )}
        </div>
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}

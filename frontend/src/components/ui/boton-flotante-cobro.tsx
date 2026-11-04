import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface Props {
  cantidad: number;
  total: number;
  etiqueta: string;
  to?: string;
  onClick?: () => void;
  icono?: ReactNode;
}

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export function BotonFlotanteCobro({ cantidad, total, etiqueta, to, onClick, icono }: Props) {
  if (cantidad === 0) {
    return null;
  }

  const contenido = (
    <>
      <span className="flex flex-col items-start leading-tight">
        <span className="text-xs font-medium text-on-primary/80">
          {cantidad} producto{cantidad === 1 ? '' : 's'}
        </span>
        <span className="font-heading text-lg font-extrabold tracking-tight">
          {formatearPrecio(total)}
        </span>
      </span>
      <span className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-on-primary px-4 text-sm font-bold text-primary">
        {icono}
        {etiqueta}
      </span>
    </>
  );

  const clases = cn(
    'fixed inset-x-3 bottom-20 z-20 flex items-center justify-between gap-3 rounded-xl bg-primary px-4 py-3 text-on-primary shadow-lg',
    'lg:bottom-6 lg:left-[17rem] lg:right-6 lg:mx-auto lg:max-w-4xl',
  );

  if (to) {
    return (
      <Link to={to} className={clases}>
        {contenido}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={clases}>
      {contenido}
    </button>
  );
}

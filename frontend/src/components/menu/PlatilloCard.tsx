import type { MenuItem } from '../../lib/menu';
import { cn } from '../../lib/utils';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export function PlatilloCard({ item }: { item: MenuItem }) {
  return (
    <li
      aria-disabled={!item.disponible}
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
        !item.disponible && 'opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{item.nombre}</h3>
        <span className="shrink-0 font-medium text-slate-900">{formatearPrecio(item.precio)}</span>
      </div>
      {item.categoria && (
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{item.categoria}</p>
      )}
      {item.descripcion && <p className="mt-1 text-sm text-slate-600">{item.descripcion}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {item.especial && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Especial
          </span>
        )}
        {!item.disponible && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            No disponible
          </span>
        )}
      </div>
    </li>
  );
}

import type { MenuItem } from '../../lib/menu';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export function PlatilloCard({ item }: { item: MenuItem }) {
  return (
    <li
      aria-disabled={!item.disponible}
      className={cn(
        'flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition-all',
        item.disponible
          ? 'border-outline-variant/70 hover:-translate-y-0.5 hover:border-primary/40'
          : 'border-outline-variant/50 opacity-60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-heading text-base font-bold text-on-surface">{item.nombre}</h3>
        <span className="shrink-0 font-heading text-lg font-extrabold tracking-tight text-primary">
          {formatearPrecio(item.precio)}
        </span>
      </div>

      {item.descripcion && (
        <p className="mt-1.5 text-sm text-on-surface-variant">{item.descripcion}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {item.categoria && <Badge tono="neutral">{item.categoria}</Badge>}
        {item.especial && <Badge tono="especial">Especial</Badge>}
        {!item.disponible && <Badge tono="error">No disponible</Badge>}
      </div>
    </li>
  );
}

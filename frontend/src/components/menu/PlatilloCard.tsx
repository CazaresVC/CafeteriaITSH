import type { MenuItem } from '../../lib/menu';
import { Badge } from '../ui/badge';
import { Stepper } from '../ui/stepper';
import { cn } from '../../lib/utils';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

interface Props {
  item: MenuItem;
  cantidad?: number;
  onCambiar?: (delta: number) => void;
}

export function PlatilloCard({ item, cantidad = 0, onCambiar }: Props) {
  return (
    <li
      aria-disabled={!item.disponible}
      className={cn(
        'flex flex-col rounded-xl border bg-surface-container-lowest p-4 shadow-sm',
        item.disponible ? 'border-outline-variant/70' : 'border-outline-variant/50 opacity-60',
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

      {item.disponible && onCambiar && (
        <div className="mt-4 flex items-center justify-between border-t border-surface-container-high pt-3">
          <span className="text-sm font-medium text-on-surface-variant">Cantidad</span>
          <Stepper
            cantidad={cantidad}
            onCambiar={onCambiar}
            nombre={item.nombre}
            testid={`cantidad-menu-${item.platilloId}`}
          />
        </div>
      )}
    </li>
  );
}

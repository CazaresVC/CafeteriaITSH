import { useEffect } from 'react';
import type { MenuItem } from '../../lib/menu';
import type { LineaPedidoInput } from '../../lib/pedidos';
import { useCarrito } from '../../lib/carrito';
import { Button } from '../ui/button';
import { Stepper } from '../ui/stepper';
import { Badge } from '../ui/badge';
import { EmptyState } from '../ui/empty-state';
import { IconoCheck, IconoQuitar } from '../iconos';

interface Props {
  items: MenuItem[];
  onConfirmar: (lineas: LineaPedidoInput[]) => void;
  enviando?: boolean;
  error?: string | null;
}

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export function Carrito({ items, onConfirmar, enviando = false, error = null }: Props) {
  const { cantidades, cambiar, limpiar, sincronizar } = useCarrito();

  useEffect(() => {
    sincronizar(items);
  }, [items, sincronizar]);

  const disponibles = items.filter((item) => item.disponible);

  const lineas: LineaPedidoInput[] = disponibles
    .filter((item) => (cantidades[item.platilloId] ?? 0) > 0)
    .map((item) => ({ platilloId: item.platilloId, cantidad: cantidades[item.platilloId] ?? 0 }));

  const total = disponibles.reduce(
    (suma, item) => suma + item.precio * (cantidades[item.platilloId] ?? 0),
    0,
  );

  if (disponibles.length === 0) {
    return (
      <EmptyState
        titulo="No hay platillos disponibles"
        descripcion="El menú de hoy todavía no tiene platillos activos para armar un pedido."
      />
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-surface-container-high overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
        {disponibles.map((item) => {
          const cantidad = cantidades[item.platilloId] ?? 0;
          return (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-on-surface">{item.nombre}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-primary">
                    {formatearPrecio(item.precio)}
                  </span>
                  {item.especial && <Badge tono="especial">Especial</Badge>}
                </div>
              </div>
              <Stepper
                cantidad={cantidad}
                onCambiar={(delta) => cambiar(item.platilloId, delta)}
                nombre={item.nombre}
                testid={`cantidad-${item.platilloId}`}
              />
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-on-surface-variant">Total del pedido</p>
            <p className="text-xs text-outline">{lineas.length} platillo(s) seleccionado(s)</p>
          </div>
          <span
            data-testid="total"
            className="font-heading text-3xl font-extrabold tracking-tight text-primary"
          >
            {formatearPrecio(total)}
          </span>
        </div>
        {lineas.length > 0 && (
          <button
            type="button"
            onClick={limpiar}
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <IconoQuitar className="h-4 w-4" />
            Vaciar carrito
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button
        onClick={() => onConfirmar(lineas)}
        disabled={lineas.length === 0 || enviando}
        className="w-full min-h-12 text-base"
      >
        <IconoCheck className="h-5 w-5" />
        {enviando ? 'Confirmando…' : 'Confirmar pedido'}
      </Button>
    </div>
  );
}

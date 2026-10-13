import { useState } from 'react';
import type { MenuItem } from '../../lib/menu';
import type { LineaPedidoInput } from '../../lib/pedidos';
import { Button } from '../ui/button';

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
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

  const disponibles = items.filter((item) => item.disponible);

  function cambiar(platilloId: number, delta: number) {
    setCantidades((actual) => {
      const siguiente = Math.max(0, (actual[platilloId] ?? 0) + delta);
      return { ...actual, [platilloId]: siguiente };
    });
  }

  const lineas: LineaPedidoInput[] = disponibles
    .filter((item) => (cantidades[item.platilloId] ?? 0) > 0)
    .map((item) => ({ platilloId: item.platilloId, cantidad: cantidades[item.platilloId] ?? 0 }));

  const total = disponibles.reduce(
    (suma, item) => suma + item.precio * (cantidades[item.platilloId] ?? 0),
    0,
  );

  if (disponibles.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        No hay platillos disponibles para armar un pedido.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {disponibles.map((item) => {
          const cantidad = cantidades[item.platilloId] ?? 0;
          return (
            <li key={item.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{item.nombre}</p>
                <p className="text-sm text-slate-500">{formatearPrecio(item.precio)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={`Quitar ${item.nombre}`}
                  onClick={() => cambiar(item.platilloId, -1)}
                  disabled={cantidad === 0}
                  className="h-8 w-8 rounded-md border border-slate-300 text-slate-700 disabled:opacity-40"
                >
                  −
                </button>
                <span
                  aria-label={`Cantidad de ${item.nombre}`}
                  data-testid={`cantidad-${item.platilloId}`}
                  className="w-8 text-center font-medium text-slate-900"
                >
                  {cantidad}
                </span>
                <button
                  type="button"
                  aria-label={`Agregar ${item.nombre}`}
                  onClick={() => cambiar(item.platilloId, 1)}
                  className="h-8 w-8 rounded-md border border-slate-300 text-slate-700"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
        <span className="text-sm font-medium text-slate-600">Total</span>
        <span data-testid="total" className="text-lg font-semibold text-slate-900">
          {formatearPrecio(total)}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button
        onClick={() => onConfirmar(lineas)}
        disabled={lineas.length === 0 || enviando}
        className="w-full"
      >
        {enviando ? 'Confirmando…' : 'Confirmar pedido'}
      </Button>
    </div>
  );
}

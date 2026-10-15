import { useState, type FormEvent } from 'react';
import type { MenuItem } from '../../lib/menu';
import type { ItemMostradorInput } from '../../lib/pedidos';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Stepper } from '../ui/stepper';
import { Badge } from '../ui/badge';
import { EmptyState } from '../ui/empty-state';
import { IconoAgregar } from '../iconos';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

interface Props {
  items: MenuItem[];
  onRegistrar: (datos: { items: ItemMostradorInput[]; cliente_nombre?: string }) => void;
  enviando?: boolean;
  error?: string | null;
}

export function PedidoMostrador({ items, onRegistrar, enviando = false, error = null }: Props) {
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [clienteNombre, setClienteNombre] = useState('');

  const disponibles = items.filter((item) => item.disponible);

  function cambiar(id: number, delta: number) {
    setCantidades((actual) => {
      const siguiente = Math.max(0, (actual[id] ?? 0) + delta);
      return { ...actual, [id]: siguiente };
    });
  }

  const seleccion: ItemMostradorInput[] = disponibles
    .filter((item) => (cantidades[item.id] ?? 0) > 0)
    .map((item) => ({ menu_dia_id: item.id, cantidad: cantidades[item.id] ?? 0 }));

  const total = disponibles.reduce(
    (suma, item) => suma + item.precio * (cantidades[item.id] ?? 0),
    0,
  );

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    onRegistrar({
      items: seleccion,
      cliente_nombre: clienteNombre.trim() ? clienteNombre.trim() : undefined,
    });
  }

  if (disponibles.length === 0) {
    return (
      <EmptyState
        titulo="No hay platillos disponibles"
        descripcion="El menú de hoy no tiene platillos disponibles para capturar un pedido."
      />
    );
  }

  return (
    <form className="space-y-4" onSubmit={enviar} noValidate>
      <div className="space-y-1 sm:max-w-xs">
        <Label htmlFor="mostrador-cliente">Cliente (opcional)</Label>
        <Input
          id="mostrador-cliente"
          value={clienteNombre}
          onChange={(evento) => setClienteNombre(evento.target.value)}
          placeholder="Nombre del cliente"
        />
      </div>

      <ul className="divide-y divide-surface-container-high overflow-hidden rounded-xl border border-outline-variant/70 bg-white shadow-sm">
        {disponibles.map((item) => {
          const cantidad = cantidades[item.id] ?? 0;
          return (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-on-surface">{item.nombre}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-heading text-sm font-bold text-primary">
                    {formatearPrecio(item.precio)}
                  </span>
                  {item.especial && <Badge tono="especial">Especial</Badge>}
                </div>
              </div>
              <Stepper
                cantidad={cantidad}
                onCambiar={(delta) => cambiar(item.id, delta)}
                nombre={item.nombre}
                testid={`cantidad-mostrador-${item.id}`}
              />
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between rounded-xl border border-outline-variant/70 bg-surface-container-low p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface-variant">Total</span>
          <Badge tono="neutral">{seleccion.length} platillo(s)</Badge>
        </div>
        <span
          data-testid="total-mostrador"
          className="font-heading text-3xl font-extrabold tracking-tight text-primary"
        >
          {formatearPrecio(total)}
        </span>
      </div>

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={seleccion.length === 0 || enviando} className="w-full min-h-12 text-base">
        <IconoAgregar className="h-5 w-5" />
        {enviando ? 'Registrando…' : 'Registrar pedido'}
      </Button>
    </form>
  );
}

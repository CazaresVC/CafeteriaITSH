import { useMemo, useState, type FormEvent } from 'react';
import type { MenuItem } from '../../lib/menu';
import type { CrearMostradorInput, ItemMostradorInput } from '../../lib/pedidos';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Stepper } from '../ui/stepper';
import { Badge } from '../ui/badge';
import { EmptyState } from '../ui/empty-state';
import { Buscador } from '../ui/buscador';
import { ChipsCategoria } from '../ui/chips-categoria';
import { IconoAgregar } from '../iconos';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export interface LineaResumenMostrador {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface ResumenMostrador {
  datos: CrearMostradorInput;
  lineas: LineaResumenMostrador[];
  total: number;
}

interface Props {
  items: MenuItem[];
  onContinuar: (resumen: ResumenMostrador) => void;
  seleccionInicial?: Record<number, number>;
  clienteInicial?: string;
}

export function PedidoMostrador({
  items,
  onContinuar,
  seleccionInicial = {},
  clienteInicial = '',
}: Props) {
  const [cantidades, setCantidades] = useState<Record<number, number>>(seleccionInicial);
  const [clienteNombre, setClienteNombre] = useState(clienteInicial);
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState<string | null>(null);

  const disponibles = useMemo(() => items.filter((item) => item.disponible), [items]);

  const categorias = useMemo(() => {
    const unicas = new Set<string>();
    for (const item of disponibles) {
      if (item.categoria) {
        unicas.add(item.categoria);
      }
    }
    return [...unicas].sort((a, b) => a.localeCompare(b, 'es'));
  }, [disponibles]);

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    return disponibles.filter((item) => {
      const coincideCategoria = categoria === null || item.categoria === categoria;
      if (!coincideCategoria) {
        return false;
      }
      if (!termino) {
        return true;
      }
      return (
        normalizar(item.nombre).includes(termino) ||
        normalizar(item.descripcion ?? '').includes(termino)
      );
    });
  }, [busqueda, categoria, disponibles]);

  const lineas: LineaResumenMostrador[] = disponibles
    .filter((item) => (cantidades[item.id] ?? 0) > 0)
    .map((item) => ({
      id: item.id,
      nombre: item.nombre,
      cantidad: cantidades[item.id] ?? 0,
      precio: item.precio,
      subtotal: item.precio * (cantidades[item.id] ?? 0),
    }));

  const total = lineas.reduce((suma, linea) => suma + linea.subtotal, 0);

  function cambiar(id: number, delta: number) {
    setCantidades((actual) => {
      const siguiente = Math.min(99, Math.max(0, (actual[id] ?? 0) + delta));
      return { ...actual, [id]: siguiente };
    });
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (lineas.length === 0) {
      return;
    }
    const datos: CrearMostradorInput = {
      items: lineas.map<ItemMostradorInput>((linea) => ({
        menu_dia_id: linea.id,
        cantidad: linea.cantidad,
      })),
      cliente_nombre: clienteNombre.trim() ? clienteNombre.trim() : undefined,
    };
    onContinuar({ datos, lineas, total });
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
      <div className="space-y-1 sm:max-w-sm">
        <Label htmlFor="mostrador-cliente">Cliente (opcional)</Label>
        <Input
          id="mostrador-cliente"
          value={clienteNombre}
          onChange={(evento) => setClienteNombre(evento.target.value)}
          placeholder="Nombre del cliente"
        />
      </div>

      <div className="space-y-3">
        <Buscador
          etiqueta="Buscar producto"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />
        <ChipsCategoria
          categorias={categorias}
          seleccionada={categoria}
          onSeleccionar={setCategoria}
        />
      </div>

      {filtrados.length === 0 ? (
        <EmptyState
          titulo="Sin resultados"
          descripcion={`No hay productos que coincidan con “${busqueda || categoria}”.`}
        />
      ) : (
        <ul className="divide-y divide-surface-container-high overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
          {filtrados.map((item) => {
            const cantidad = cantidades[item.id] ?? 0;
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-on-surface">{item.nombre}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-heading text-sm font-bold text-primary">
                      {formatearPrecio(item.precio)}
                    </span>
                    {item.categoria && <Badge tono="neutral">{item.categoria}</Badge>}
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
      )}

      <div className="sticky bottom-20 z-10 rounded-xl border border-outline-variant/70 bg-surface-container-lowest/95 p-4 shadow-lg backdrop-blur lg:bottom-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-on-surface-variant">
              {lineas.length} platillo{lineas.length === 1 ? '' : 's'}
            </p>
            <p
              data-testid="total-mostrador"
              className="font-heading text-3xl font-extrabold tracking-tight text-primary"
            >
              {formatearPrecio(total)}
            </p>
          </div>
          <Button
            type="submit"
            disabled={lineas.length === 0}
            className="min-h-12 min-w-40 text-base"
          >
            <IconoAgregar className="h-5 w-5" />
            Ver cobro
          </Button>
        </div>
      </div>
    </form>
  );
}

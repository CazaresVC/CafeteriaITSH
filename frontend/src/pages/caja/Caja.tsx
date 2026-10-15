import { useState } from 'react';
import { useMenu } from '../../lib/menu';
import { useCobrarPedido, useCrearMostrador, type ItemMostradorInput, type Pedido } from '../../lib/pedidos';
import { mensajeDeError } from '../../lib/api';
import { PedidoMostrador } from '../../components/caja/PedidoMostrador';
import { Button } from '../../components/ui/button';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { EstadoBadge } from '../../components/EstadoBadge';
import { IconoAgregar, IconoCaja, IconoPago } from '../../components/iconos';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export function Caja() {
  const { data: items, isLoading, isError } = useMenu();
  const crearMostrador = useCrearMostrador();
  const cobrar = useCobrarPedido();
  const [pedido, setPedido] = useState<Pedido | null>(null);

  const pedidoActual = cobrar.data && pedido && cobrar.data.id === pedido.id ? cobrar.data : pedido;

  function registrar(datos: { items: ItemMostradorInput[]; cliente_nombre?: string }) {
    crearMostrador.mutate(datos, {
      onSuccess: (nuevo) => setPedido(nuevo),
    });
  }

  function reiniciar() {
    setPedido(null);
    crearMostrador.reset();
    cobrar.reset();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icono={<IconoCaja className="h-5 w-5" />}
        titulo="Caja · Mostrador"
        descripcion="Registra el pedido del cliente y cobra en efectivo para enviarlo a cocina."
      />

      {isLoading && <p className="text-sm text-on-surface-variant">Cargando menú…</p>}

      {isError && (
        <p className="text-sm text-error" role="alert">
          No se pudo cargar el menú de hoy.
        </p>
      )}

      {items && !pedidoActual && items.filter((i) => i.disponible).length === 0 && (
        <EmptyState
          titulo="Sin platillos disponibles"
          descripcion="No hay platillos disponibles en el menú de hoy para capturar un pedido."
        />
      )}

      {items && !pedidoActual && items.filter((i) => i.disponible).length > 0 && (
        <PedidoMostrador
          items={items}
          onRegistrar={registrar}
          enviando={crearMostrador.isPending}
          error={crearMostrador.isError ? mensajeDeError(crearMostrador.error) : null}
        />
      )}

      {pedidoActual && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-outline-variant/70 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-on-surface-variant">Folio</p>
                <p className="font-heading text-2xl font-extrabold tracking-tight text-on-surface">
                  {pedidoActual.numero}
                </p>
              </div>
              <EstadoBadge estado={pedidoActual.estado} />
            </div>

            <ul className="mt-4 divide-y divide-surface-container-high">
              {pedidoActual.lineas.map((linea) => (
                <li key={linea.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-on-surface-variant">
                    {linea.cantidad} × {linea.nombre}
                  </span>
                  <span className="font-medium text-on-surface">{formatearPrecio(linea.subtotal)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-surface-container-high pt-3">
              <span className="text-sm font-medium text-on-surface-variant">Total</span>
              <span className="font-heading text-3xl font-extrabold tracking-tight text-primary">
                {formatearPrecio(pedidoActual.total)}
              </span>
            </div>
          </div>

          {cobrar.isError && (
            <p className="text-sm text-error" role="alert">
              {mensajeDeError(cobrar.error)}
            </p>
          )}

          {pedidoActual.estado === 'Pagado' ? (
            <div
              className="rounded-xl border border-primary/30 bg-primary-container/60 p-4 text-sm text-on-primary-container"
              role="status"
            >
              Pedido cobrado en efectivo. Ya está en la fila de cocina.
            </div>
          ) : (
            <Button
              onClick={() => cobrar.mutate(pedidoActual.id)}
              disabled={cobrar.isPending}
              className="w-full min-h-11"
            >
              <IconoPago className="h-5 w-5" />
              {cobrar.isPending ? 'Registrando cobro…' : 'Cobrar en efectivo'}
            </Button>
          )}

          <Button variante="secondary" onClick={reiniciar} className="w-full min-h-11">
            <IconoAgregar className="h-4 w-4" />
            Nuevo pedido
          </Button>
        </div>
      )}
    </div>
  );
}

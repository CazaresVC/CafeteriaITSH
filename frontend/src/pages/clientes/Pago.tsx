import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePedido, usePagarPedido } from '../../lib/pedidos';
import { useCarrito } from '../../lib/carrito';
import { mensajeDeError } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { PageHeader } from '../../components/ui/page-header';
import { EstadoBadge } from '../../components/EstadoBadge';
import { IconoInfo, IconoPago, IconoReloj } from '../../components/iconos';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

function formatearFechaHora(fecha: string): string {
  const [soloFecha, hora] = fecha.split(' ');
  const [anio, mes, dia] = (soloFecha ?? '').split('-');
  if (!anio || !mes || !dia) {
    return fecha;
  }
  return `${dia}/${mes}/${anio}${hora ? ` · ${hora.slice(0, 5)}` : ''}`;
}

interface EstadoNavegacion {
  pedidoId?: number;
}

export function Pago() {
  const ubicacion = useLocation();
  const estado = ubicacion.state as EstadoNavegacion | null;
  const pedidoId = estado?.pedidoId;

  const { data: pedido, isLoading, isError } = usePedido(pedidoId);
  const pagar = usePagarPedido();
  const { limpiar } = useCarrito();

  const pedidoActual = pagar.data ?? pedido;

  useEffect(() => {
    if (pagar.isSuccess) {
      limpiar();
    }
  }, [pagar.isSuccess, limpiar]);

  if (pedidoId === undefined) {
    return (
      <div className="space-y-4">
        <PageHeader titulo="Pago" />
        <p className="text-sm text-on-surface-variant">No hay un pedido para pagar.</p>
        <Link
          to="/pedido"
          className="inline-flex min-h-11 items-center rounded-md text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          Armar un pedido
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        titulo="Pago del pedido"
        descripcion="Confirma el pago en línea para enviar tu pedido a cocina."
      />

      {isLoading && (
        <p className="text-sm text-on-surface-variant" role="status">
          Cargando pedido…
        </p>
      )}

      {isError && (
        <p className="text-sm text-error" role="alert">
          No se pudo cargar el pedido.
        </p>
      )}

      {pedidoActual && (
        <>
          <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4 shadow-sm">
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

            {pedidoActual.fechaRecoleccion && (
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-surface-container p-3 text-sm text-on-surface-variant">
                <IconoReloj className="h-4 w-4 shrink-0" />
                Recoger: {formatearFechaHora(pedidoActual.fechaRecoleccion)}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-surface-container-high pt-3">
              <span className="text-sm font-medium text-on-surface-variant">Total</span>
              <span className="font-heading text-3xl font-extrabold tracking-tight text-primary">
                {formatearPrecio(pedidoActual.total)}
              </span>
            </div>
          </div>

          {pedidoActual.estado === 'Pagado' ? (
            <div
              className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary-container/60 p-4 text-sm text-on-primary-container"
              role="status"
            >
              <span>Pago aprobado. Tu pedido está en preparación en la fila de cocina.</span>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-outline-variant/70 bg-surface-container-low p-3 text-sm text-on-surface-variant">
                <IconoInfo className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Este proceso es simulado y no captura datos de tarjeta.</span>
              </div>
              {pagar.isError && (
                <p className="text-sm text-error" role="alert">
                  {mensajeDeError(pagar.error)}
                </p>
              )}
              <Button
                onClick={() => pagar.mutate({ id: pedidoId })}
                disabled={pagar.isPending}
                className="w-full min-h-12 text-base"
              >
                <IconoPago className="h-5 w-5" />
                {pagar.isPending ? 'Procesando…' : 'Pagar en línea'}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

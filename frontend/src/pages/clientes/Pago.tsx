import { Link, useLocation } from 'react-router-dom';
import { usePedido, usePagarPedido } from '../../lib/pedidos';
import { mensajeDeError } from '../../lib/api';
import { Button } from '../../components/ui/button';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
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

  const pedidoActual = pagar.data ?? pedido;

  if (pedidoId === undefined) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-slate-900">Pago</h1>
        <p className="text-sm text-slate-600">No hay un pedido para pagar.</p>
        <Link to="/pedido" className="text-sm font-medium text-slate-900 underline">
          Armar un pedido
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Pago del pedido</h1>
        <p className="text-sm text-slate-500">Confirma el pago en línea para enviar tu pedido a cocina.</p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando pedido…</p>}

      {isError && (
        <p className="text-sm text-red-600" role="alert">
          No se pudo cargar el pedido.
        </p>
      )}

      {pedidoActual && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Folio</p>
            <p className="font-semibold text-slate-900">{pedidoActual.numero}</p>
            <p className="mt-2 text-sm text-slate-500">Estado</p>
            <p className="font-medium text-slate-900" aria-live="polite">
              {pedidoActual.estado}
            </p>

            <ul className="mt-4 divide-y divide-slate-100">
              {pedidoActual.lineas.map((linea) => (
                <li key={linea.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">
                    {linea.cantidad} × {linea.nombre}
                  </span>
                  <span className="font-medium text-slate-900">{formatearPrecio(linea.subtotal)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-sm font-medium text-slate-600">Total</span>
              <span className="text-lg font-semibold text-slate-900">
                {formatearPrecio(pedidoActual.total)}
              </span>
            </div>
          </div>

          {pedidoActual.estado === 'Pagado' ? (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status">
              Pago aprobado. Tu pedido está en preparación en la fila de cocina.
            </div>
          ) : (
            <>
              {pagar.isError && (
                <p className="text-sm text-red-600" role="alert">
                  {mensajeDeError(pagar.error)}
                </p>
              )}
              <Button
                onClick={() => pagar.mutate({ id: pedidoId })}
                disabled={pagar.isPending}
                className="w-full"
              >
                {pagar.isPending ? 'Procesando pago…' : 'Pagar en línea'}
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

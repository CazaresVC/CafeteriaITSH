import { Link, useParams } from 'react-router-dom';
import { usePedido } from '../../lib/pedidos';
import { EstadoBadge } from '../../components/EstadoBadge';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export function PedidoDetalle() {
  const { id } = useParams();
  const pedidoId = id ? Number(id) : undefined;
  const { data: pedido, isLoading, isError } = usePedido(pedidoId);

  return (
    <div className="space-y-4">
      <Link
        to="/mis-pedidos"
        className="text-sm font-medium text-on-surface-variant hover:text-primary"
      >
        ← Volver a mis pedidos
      </Link>

      {isLoading && <p className="text-sm text-on-surface-variant">Cargando el pedido…</p>}

      {isError && (
        <p className="text-sm text-error" role="alert">
          No se pudo cargar el pedido.
        </p>
      )}

      {pedido && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-heading text-2xl font-extrabold tracking-tight text-on-surface">
                {pedido.numero}
              </h1>
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">
                {pedido.tipo}
              </p>
            </div>
            <EstadoBadge estado={pedido.estado} />
          </div>

          {pedido.estado === 'Listo' && (
            <div
              className="rounded-xl border border-status-ready/40 bg-status-ready/10 p-4 text-sm font-semibold text-status-ready"
              role="status"
            >
              ¡Listo para recoger! Acércate al mostrador con tu folio.
            </div>
          )}

          <ul className="divide-y divide-surface-container-high rounded-2xl border border-outline-variant/70 bg-white p-4 shadow-sm">
            {pedido.lineas.map((linea) => (
              <li key={linea.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-on-surface">
                    {linea.cantidad} × {linea.nombre}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {formatearPrecio(linea.precioUnitario)} c/u
                  </p>
                </div>
                <span className="font-medium text-on-surface">{formatearPrecio(linea.subtotal)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between rounded-xl border border-outline-variant/70 bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-on-surface-variant">Total</span>
            <span className="font-heading text-2xl font-extrabold tracking-tight text-primary">
              {formatearPrecio(pedido.total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

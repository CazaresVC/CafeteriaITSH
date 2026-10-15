import { Link } from 'react-router-dom';
import { useMisPedidos } from '../../lib/pedidos';
import { EstadoBadge } from '../../components/EstadoBadge';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { IconoEntregas, IconoMenu } from '../../components/iconos';
import { cn } from '../../lib/utils';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export function MisPedidos() {
  const { data: pedidos, isLoading, isError } = useMisPedidos();
  const activos = (pedidos ?? []).filter((p) => p.estado !== 'Entregado' && p.estado !== 'Cancelado');

  return (
    <div className="space-y-5">
      <PageHeader
        icono={<IconoEntregas className="h-5 w-5" />}
        titulo="Mis pedidos"
        descripcion="Sigue el estado de tus pedidos. Se actualiza automáticamente."
        acciones={
          !isLoading && activos.length > 0 ? (
            <Badge tono="primary">{activos.length} activo(s)</Badge>
          ) : undefined
        }
      />

      {isLoading && <p className="text-sm text-on-surface-variant">Cargando tus pedidos…</p>}

      {isError && (
        <p className="text-sm text-error" role="alert">
          No se pudieron cargar tus pedidos. Inténtalo de nuevo.
        </p>
      )}

      {pedidos && pedidos.length === 0 && (
        <EmptyState
          titulo="Aún no tienes pedidos"
          descripcion="Consulta el menú del día para hacer tu primer pedido anticipado."
        >
          <Link
            to="/menu"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm hover:bg-primary/90"
          >
            <IconoMenu className="h-4 w-4" />
            Ver el menú
          </Link>
        </EmptyState>
      )}

      {pedidos && pedidos.length > 0 && (
        <ul className="space-y-3">
          {pedidos.map((pedido) => {
            const listo = pedido.estado === 'Listo';
            return (
              <li key={pedido.id}>
                <Link
                  to={`/mis-pedidos/${pedido.id}`}
                  className={cn(
                    'flex items-center justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5',
                    listo ? 'border-status-ready/50' : 'border-outline-variant/70 hover:border-primary/40',
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-heading text-base font-bold text-on-surface">
                      {pedido.numero}
                    </p>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                      {pedido.tipo}
                    </p>
                    <p className="text-xs text-outline">{pedido.creadoEn}</p>
                    {listo && (
                      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-status-ready/12 px-2.5 py-0.5 text-xs font-semibold text-status-ready">
                        ¡Listo para recoger!
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <EstadoBadge estado={pedido.estado} />
                    <span className="font-heading text-base font-bold text-on-surface">
                      {formatearPrecio(pedido.total)}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useMisPedidos } from '../../lib/pedidos';
import { EstadoBadge } from '../../components/EstadoBadge';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { IconoEntregas, IconoMenu, IconoReloj } from '../../components/iconos';
import { cn } from '../../lib/utils';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

function formatearFecha(fecha: string): string {
  const [soloFecha, hora] = fecha.split(' ');
  const [anio, mes, dia] = (soloFecha ?? '').split('-');
  if (!anio || !mes || !dia) {
    return fecha;
  }
  return `${dia}/${mes}/${anio}${hora ? ` · ${hora.slice(0, 5)}` : ''}`;
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

      {isLoading && (
        <p className="text-sm text-on-surface-variant" role="status">
          Cargando tus pedidos…
        </p>
      )}

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
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
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
                    'flex flex-col items-start justify-between gap-3 rounded-xl border bg-surface-container-lowest p-4 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:flex-row sm:items-center',
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
                    <p className="text-xs text-outline">{formatearFecha(pedido.creadoEn)}</p>
                    {pedido.fechaRecoleccion && (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-on-surface-variant">
                        <IconoReloj className="h-3.5 w-3.5" />
                        Recoger: {formatearFecha(pedido.fechaRecoleccion)}
                      </p>
                    )}
                    {listo && (
                      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-status-ready/12 px-2.5 py-0.5 text-xs font-semibold text-status-ready">
                        ¡Listo para recoger!
                      </span>
                    )}
                  </div>
                  <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-end">
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

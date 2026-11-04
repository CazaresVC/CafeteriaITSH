import { useState } from 'react';
import { ESTADOS_ACTIVOS, useCambiarEstado, usePedidos } from '../../lib/pedidos';
import { mensajeDeError } from '../../lib/api';
import { PedidoCard } from '../../components/cocina/PedidoCard';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { IconoCocina, IconoReloj } from '../../components/iconos';

const GRUPOS = [
  { estado: 'Pendiente', titulo: 'Pendientes de pago' },
  { estado: 'Pagado', titulo: 'Por preparar' },
  { estado: 'En preparación', titulo: 'En preparación' },
  { estado: 'Listo', titulo: 'Listos para entregar' },
];

export function Cocina() {
  const { data: pedidos, isLoading, isError, isFetching, dataUpdatedAt, refetch } = usePedidos({
    estados: ESTADOS_ACTIVOS,
    refetchInterval: 5000,
  });
  const cambiarEstado = useCambiarEstado();
  const [error, setError] = useState<string | null>(null);

  const lista = pedidos ?? [];
  const listos = lista.filter((pedido) => pedido.estado === 'Listo').length;
  const actualizado = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  function cambiar(id: number, estado: string) {
    setError(null);
    cambiarEstado.mutate({ id, estado }, { onError: (e) => setError(mensajeDeError(e)) });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icono={<IconoCocina className="h-5 w-5" />}
        titulo="Cocina · Tablero de pedidos"
        descripcion="Los pedidos se actualizan automáticamente cada 5 segundos. Avanza cada pedido conforme lo prepares."
        acciones={
          <>
            <Badge tono="neutral">{lista.length} activo(s)</Badge>
            {listos > 0 && <Badge tono="info">{listos} listo(s)</Badge>}
          </>
        }
      />

      <div
        className="flex flex-wrap items-center gap-2 rounded-xl border border-outline-variant/60 bg-surface-container px-4 py-3 text-sm text-on-surface-variant"
        role="status"
        aria-live="polite"
      >
        <IconoReloj className="h-4 w-4" />
        {isFetching ? (
          <span>Actualizando tablero…</span>
        ) : actualizado ? (
          <span>Actualizado a las {actualizado}</span>
        ) : (
          <span>Actualización automática activa</span>
        )}
      </div>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error-container/40 p-4">
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
          <Button variante="secondary" onClick={() => refetch()}>
            Actualizar tablero
          </Button>
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-on-surface-variant" role="status">
          Cargando pedidos…
        </p>
      )}

      {isError && (
        <div className="space-y-3 rounded-xl border border-error/30 bg-error-container/40 p-4">
          <p className="text-sm text-error" role="alert">
            No se pudo cargar la fila de pedidos.
          </p>
          <Button variante="secondary" onClick={() => refetch()}>
            Reintentar
          </Button>
        </div>
      )}

      {!isLoading && !isError && lista.length === 0 && (
        <EmptyState
          titulo="No hay pedidos en la fila por ahora"
          descripcion="Cuando la caja cobre un pedido aparecerá aquí para que lo prepares."
        />
      )}

      {!isLoading && !isError && lista.length > 0 && (
        <div className="space-y-8">
          {GRUPOS.map((grupo) => {
            const pedidosGrupo = lista.filter((pedido) => pedido.estado === grupo.estado);
            if (pedidosGrupo.length === 0) {
              return null;
            }
            return (
              <section key={grupo.estado} className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-heading text-lg font-bold text-on-surface">{grupo.titulo}</h2>
                  <Badge tono="neutral">{pedidosGrupo.length}</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pedidosGrupo.map((pedido) => (
                    <PedidoCard
                      key={pedido.id}
                      pedido={pedido}
                      onCambiar={(estado) => cambiar(pedido.id, estado)}
                      enviando={cambiarEstado.isPending}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { ESTADOS_ACTIVOS, useCambiarEstado, usePedidos } from '../../lib/pedidos';
import { mensajeDeError } from '../../lib/api';
import { PedidoCard } from '../../components/cocina/PedidoCard';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { IconoCocina } from '../../components/iconos';

export function Cocina() {
  const { data: pedidos, isLoading, isError } = usePedidos({
    estados: ESTADOS_ACTIVOS,
    refetchInterval: 5000,
  });
  const cambiarEstado = useCambiarEstado();
  const [error, setError] = useState<string | null>(null);

  function cambiar(id: number, estado: string) {
    setError(null);
    cambiarEstado.mutate(
      { id, estado },
      { onError: (e) => setError(mensajeDeError(e)) },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icono={<IconoCocina className="h-5 w-5" />}
        titulo="Cocina · Tablero de pedidos"
        descripcion="Los pedidos se actualizan automáticamente. Avanza cada pedido conforme lo prepares."
      />

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {isLoading && <p className="text-sm text-on-surface-variant">Cargando pedidos…</p>}

      {isError && (
        <p className="text-sm text-error" role="alert">
          No se pudo cargar la fila de pedidos.
        </p>
      )}

      {pedidos && pedidos.length === 0 && (
        <EmptyState
          titulo="No hay pedidos en la fila por ahora"
          descripcion="Cuando la caja cobre un pedido aparecerá aquí para que lo prepares."
        />
      )}

      {pedidos && pedidos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onCambiar={(estado) => cambiar(pedido.id, estado)}
              enviando={cambiarEstado.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

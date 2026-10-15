import { useState } from 'react';
import { useCambiarEstado, usePedidos, type Pedido } from '../../lib/pedidos';
import { mensajeDeError } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/ui/empty-state';
import { PageHeader } from '../../components/ui/page-header';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { EstadoBadge } from '../../components/EstadoBadge';
import { IconoCerrar, IconoEntregar, IconoEntregas } from '../../components/iconos';

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

function horaCorta(fecha: string): string {
  const soloHora = fecha.includes(' ') ? (fecha.split(' ')[1] ?? fecha) : fecha;
  return soloHora.slice(0, 5);
}

export function Entregas() {
  const { data: pedidos, isLoading, isError } = usePedidos({
    estados: ['Listo'],
    refetchInterval: 5000,
  });
  const cambiarEstado = useCambiarEstado();
  const [error, setError] = useState<string | null>(null);
  const [aCancelar, setACancelar] = useState<Pedido | null>(null);

  const lista = pedidos ?? [];

  function entregar(id: number) {
    setError(null);
    cambiarEstado.mutate({ id, estado: 'Entregado' }, { onError: (e) => setError(mensajeDeError(e)) });
  }

  function cancelar() {
    if (!aCancelar) {
      return;
    }
    setError(null);
    cambiarEstado.mutate(
      { id: aCancelar.id, estado: 'Cancelado' },
      {
        onSuccess: () => setACancelar(null),
        onError: (e) => setError(mensajeDeError(e)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icono={<IconoEntregas className="h-5 w-5" />}
        titulo="Pedidos listos"
        descripcion="Entrega los pedidos que cocina ya marcó como listos."
        acciones={!isLoading && <Badge tono={lista.length > 0 ? 'info' : 'neutral'}>{lista.length} pendiente(s)</Badge>}
      />

      {error && (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {isLoading && <p className="text-sm text-on-surface-variant">Cargando pedidos…</p>}

      {isError && (
        <p className="text-sm text-error" role="alert">
          No se pudieron cargar los pedidos listos. Inténtalo de nuevo.
        </p>
      )}

      {!isLoading && !isError && lista.length === 0 && (
        <EmptyState
          titulo="¡Todo está al día!"
          descripcion="No hay pedidos listos por entregar en este momento."
        />
      )}

      {lista.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((pedido) => (
            <li
              key={pedido.id}
              className="flex flex-col gap-3 rounded-2xl border border-status-ready/30 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight text-on-surface">
                    {pedido.numero}
                  </p>
                  <p className="mt-0.5 text-xs uppercase tracking-wide text-on-surface-variant">
                    {horaCorta(pedido.creadoEn)}
                    {pedido.clienteNombre ? ` · ${pedido.clienteNombre}` : ' · Sin nombre'}
                  </p>
                </div>
                <EstadoBadge estado={pedido.estado} />
              </div>

              <ul className="divide-y divide-surface-container-high text-sm">
                {pedido.lineas.map((linea) => (
                  <li key={linea.id} className="flex items-center justify-between py-1.5">
                    <span className="font-medium text-on-surface">
                      {linea.cantidad} × {linea.nombre}
                    </span>
                    <span className="text-on-surface-variant">{formatearPrecio(linea.subtotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-surface-container-high pt-2 text-sm">
                <span className="font-medium text-on-surface-variant">Total</span>
                <span className="font-heading text-lg font-bold text-on-surface">
                  {formatearPrecio(pedido.total)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  className="min-h-11 flex-1"
                  onClick={() => entregar(pedido.id)}
                  disabled={cambiarEstado.isPending}
                >
                  <IconoEntregar className="h-4 w-4" />
                  Entregar
                </Button>
                <Button
                  variante="secondary"
                  className="min-h-11"
                  onClick={() => setACancelar(pedido)}
                  disabled={cambiarEstado.isPending}
                >
                  <IconoCerrar className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        abierto={aCancelar !== null}
        titulo="Cancelar pedido"
        mensaje={`¿Cancelar el pedido ${aCancelar?.numero ?? ''}? Esta acción no se puede deshacer.`}
        textoConfirmar="Cancelar pedido"
        textoCancelar="Volver"
        variante="danger"
        onCancelar={() => setACancelar(null)}
        onConfirmar={cancelar}
      />
    </div>
  );
}

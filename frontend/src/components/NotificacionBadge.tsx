import { useState } from 'react';
import { useMarcarVista, useNotificaciones } from '../lib/notificaciones';
import { Button } from './ui/button';
import { IconoCampana } from './iconos';

const ETIQUETA_TIPO: Record<string, string> = {
  pedido_listo: 'Tu pedido está listo para recoger',
};

export function NotificacionBadge() {
  const { data } = useNotificaciones();
  const marcarVista = useMarcarVista();
  const [abierto, setAbierto] = useState(false);

  const notificaciones = data ?? [];
  const noVistas = notificaciones.filter((notificacion) => !notificacion.vista).length;

  return (
    <div className="relative">
      <Button
        variante="secondary"
        onClick={() => setAbierto((valor) => !valor)}
        aria-label={`Notificaciones (${noVistas} sin leer)`}
        className="relative"
      >
        <IconoCampana className="h-4 w-4" />
        Avisos
        {noVistas > 0 && (
          <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-xs font-semibold text-on-error">
            {noVistas}
          </span>
        )}
      </Button>

      {abierto && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-outline-variant/70 bg-white p-3 shadow-lg">
          {notificaciones.length === 0 && (
            <p className="text-sm text-on-surface-variant">No tienes avisos por ahora.</p>
          )}
          <ul className="space-y-2">
            {notificaciones.map((notificacion) => (
              <li key={notificacion.id}>
                <button
                  type="button"
                  onClick={() => !notificacion.vista && marcarVista.mutate(notificacion.id)}
                  className={`w-full rounded-lg border p-2 text-left text-sm transition-colors ${
                    notificacion.vista
                      ? 'border-outline-variant/60 bg-white text-on-surface-variant'
                      : 'border-status-ready/30 bg-primary-container/40 text-on-surface hover:bg-primary-container/60'
                  }`}
                >
                  <span className="block font-medium">
                    {ETIQUETA_TIPO[notificacion.tipo] ?? notificacion.tipo}
                  </span>
                  <span className="block text-xs text-on-surface-variant">
                    Pedido {notificacion.numero}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

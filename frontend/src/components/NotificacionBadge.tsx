import { useEffect, useId, useRef, useState } from 'react';
import { useMarcarVista, useNotificaciones } from '../lib/notificaciones';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { IconoCampana } from './iconos';

const ETIQUETA_TIPO: Record<string, string> = {
  pedido_listo: 'Tu pedido está listo para recoger',
};

export function NotificacionBadge() {
  const { data } = useNotificaciones();
  const marcarVista = useMarcarVista();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const notificaciones = data ?? [];
  const noVistas = notificaciones.filter((notificacion) => !notificacion.vista).length;

  useEffect(() => {
    if (!abierto) {
      return;
    }

    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        setAbierto(false);
        botonRef.current?.focus();
      }
    }

    function alClicFuera(evento: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    }

    document.addEventListener('keydown', alTeclear);
    document.addEventListener('pointerdown', alClicFuera);

    const primerAviso = panelRef.current?.querySelector<HTMLElement>('button');
    (primerAviso ?? panelRef.current)?.focus();

    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.removeEventListener('pointerdown', alClicFuera);
    };
  }, [abierto]);

  return (
    <div ref={contenedorRef} className="relative">
      <Button
        ref={botonRef}
        variante="secondary"
        onClick={() => setAbierto((valor) => !valor)}
        aria-label={`Notificaciones (${noVistas} sin leer)`}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-controls={panelId}
        className="relative"
      >
        <IconoCampana className="h-4 w-4" />
        Avisos
        {noVistas > 0 && (
          <Badge tono="contador" className="ml-2">
            {noVistas}
          </Badge>
        )}
      </Button>

      {abierto && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Notificaciones"
          tabIndex={-1}
          className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-3 shadow-lg focus:outline-none"
        >
          {notificaciones.length === 0 && (
            <p className="text-sm text-on-surface-variant">No tienes avisos por ahora.</p>
          )}
          <ul className="space-y-2">
            {notificaciones.map((notificacion) => (
              <li key={notificacion.id}>
                <button
                  type="button"
                  onClick={() => !notificacion.vista && marcarVista.mutate(notificacion.id)}
                  className={`min-h-11 w-full rounded-lg border p-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
                    notificacion.vista
                      ? 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant'
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

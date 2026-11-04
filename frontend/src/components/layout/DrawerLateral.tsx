import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { Usuario } from '../../lib/roles';
import { ETIQUETA_ROL } from '../../lib/roles';
import { IconoCafe, IconoSalir } from '../iconos';
import type { EnlaceNavegacion } from './tipos';
import { destinoEnlace, enlaceActivo } from './activo';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  enlaces: EnlaceNavegacion[];
  usuario: Usuario | null;
  onSalir: () => void;
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

export function DrawerLateral({ abierto, onCerrar, enlaces, usuario, onSalir }: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const ubicacion = useLocation();

  useEffect(() => {
    if (!abierto) {
      return;
    }

    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        onCerrar();
      }
    }

    document.addEventListener('keydown', alTeclear);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto, onCerrar]);

  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label="Cerrar menú de navegación"
        onClick={onCerrar}
        className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="relative flex h-full w-72 max-w-[85vw] flex-col bg-surface-bright shadow-xl"
      >
        <div className="flex items-center gap-3 border-b border-outline-variant/60 px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <IconoCafe className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-bold text-on-surface">Cafetería ITSH</p>
            <p className="truncate text-xs font-medium text-on-surface-variant">
              {usuario ? ETIQUETA_ROL[usuario.rol] : 'Pedidos anticipados'}
            </p>
          </div>
        </div>

        {usuario && (
          <div className="flex items-center gap-3 border-b border-outline-variant/60 px-5 py-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container">
              {iniciales(usuario.nombre)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-surface">{usuario.nombre}</p>
              <p className="truncate text-xs text-on-surface-variant">{usuario.correo}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Secciones">
          <ul className="space-y-1">
            {enlaces.map((enlace) => (
              <li key={enlace.to}>
                <NavLink
                  to={destinoEnlace(enlace)}
                  onClick={onCerrar}
                  className={cn(
                    'flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
                    enlaceActivo(enlace, ubicacion)
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                  )}
                >
                  {enlace.icono}
                  <span className="flex-1">{enlace.etiqueta}</span>
                  {enlace.contador !== undefined && enlace.contador > 0 && (
                    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-status-ready px-1.5 text-xs font-bold text-white">
                      {enlace.contador}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-outline-variant/60 p-3">
          <button
            type="button"
            onClick={onSalir}
            className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <IconoSalir className="h-5 w-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </div>
  );
}

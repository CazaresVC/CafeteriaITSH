import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { EnlaceNavegacion } from './tipos';
import { destinoEnlace, enlaceActivo } from './activo';

interface Props {
  enlaces: EnlaceNavegacion[];
}

export function BarraInferior({ enlaces }: Props) {
  const ubicacion = useLocation();

  if (enlaces.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/70 bg-surface-bright/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {enlaces.map((enlace) => (
          <li key={enlace.to} className="flex-1">
            <NavLink
              to={destinoEnlace(enlace)}
              className={cn(
                'relative flex min-h-14 flex-col items-center justify-center gap-0.5 px-2 text-xs font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                enlaceActivo(enlace, ubicacion)
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-12 items-center justify-center rounded-full',
                  enlaceActivo(enlace, ubicacion) && 'bg-primary-container',
                )}
              >
                {enlace.icono}
              </span>
              <span>{enlace.etiqueta}</span>
              {enlace.contador !== undefined && enlace.contador > 0 && (
                <span className="absolute right-1/2 top-1 inline-flex min-w-5 -translate-y-1/4 translate-x-6 items-center justify-center rounded-full bg-status-ready px-1 text-[10px] font-bold text-white">
                  {enlace.contador}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

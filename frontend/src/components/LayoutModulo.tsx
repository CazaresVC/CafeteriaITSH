import type { ReactNode } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ETIQUETA_MODULO } from '../lib/roles';
import { Button } from './ui/button';
import { IconoCafe, IconoSalir } from './iconos';
import { cn } from '../lib/utils';

interface Enlace {
  to: string;
  etiqueta: string;
  icono?: ReactNode;
}

interface Props {
  enlaces?: Enlace[];
  acciones?: ReactNode;
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

export function LayoutModulo({ enlaces = [], acciones }: Props) {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  async function salir() {
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-outline-variant/60 bg-surface-bright/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
              <IconoCafe className="h-5 w-5" />
            </span>
            <span className="font-heading text-base font-bold tracking-tight text-on-surface">
              Cafetería ITSH
              <span className="ml-2 hidden text-sm font-medium text-on-surface-variant sm:inline">
                · {usuario ? ETIQUETA_MODULO[usuario.rol] : ''}
              </span>
            </span>
          </div>

          <nav className="order-3 flex w-full flex-1 gap-1 overflow-x-auto sm:order-none sm:w-auto">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.to}
                to={enlace.to}
                end={enlace.to.split('/').length <= 2}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                  )
                }
              >
                {enlace.icono}
                {enlace.etiqueta}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {acciones}
            {usuario && (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container">
                  {iniciales(usuario.nombre)}
                </span>
                <span className="text-sm font-medium text-on-surface-variant">
                  {usuario.nombre}
                </span>
              </div>
            )}
            <Button variante="secondary" onClick={salir}>
              <IconoSalir className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

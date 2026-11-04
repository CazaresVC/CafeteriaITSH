import { useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useCarrito } from '../lib/carrito';
import { ETIQUETA_MODULO, ETIQUETA_ROL } from '../lib/roles';
import { Button } from './ui/button';
import { IconoCafe, IconoHamburguesa, IconoSalir } from './iconos';
import { cn } from '../lib/utils';
import { DrawerLateral } from './layout/DrawerLateral';
import { BarraInferior } from './layout/BarraInferior';
import type { EnlaceNavegacion } from './layout/tipos';
import { destinoEnlace, enlaceActivo } from './layout/activo';

export type Enlace = EnlaceNavegacion;

interface Props {
  enlaces?: EnlaceNavegacion[];
  acciones?: ReactNode;
  barraInferior?: EnlaceNavegacion[];
}

function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');
}

const ENLACE_ESCRITORIO =
  'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bright';

export function LayoutModulo({ enlaces = [], acciones, barraInferior = [] }: Props) {
  const { usuario, cerrarSesion } = useAuth();
  const { limpiar } = useCarrito();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const botonMenuRef = useRef<HTMLButtonElement>(null);

  async function salir() {
    setDrawerAbierto(false);
    limpiar();
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  function cerrarDrawer() {
    setDrawerAbierto(false);
    requestAnimationFrame(() => botonMenuRef.current?.focus());
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-outline-variant/60 bg-surface-bright lg:flex">
        <div className="flex items-center gap-3 border-b border-outline-variant/60 px-5 py-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <IconoCafe className="h-6 w-6" />
          </span>
          <div>
            <p className="font-heading text-base font-bold tracking-tight text-on-surface">
              Cafetería ITSH
            </p>
            <p className="text-xs font-medium text-on-surface-variant">
              {usuario ? ETIQUETA_MODULO[usuario.rol] : 'Pedidos anticipados'}
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Secciones">
          <ul className="space-y-1">
            {enlaces.map((enlace) => (
              <li key={enlace.to}>
                <NavLink
                  to={destinoEnlace(enlace)}
                  className={cn(
                    ENLACE_ESCRITORIO,
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

        {usuario && (
          <div className="border-t border-outline-variant/60 p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container">
                {iniciales(usuario.nombre)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">{usuario.nombre}</p>
                <p className="truncate text-xs text-on-surface-variant">
                  {ETIQUETA_ROL[usuario.rol]}
                </p>
              </div>
            </div>
            <Button variante="secondary" onClick={salir} className="w-full">
              <IconoSalir className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </div>
        )}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-outline-variant/60 bg-surface-bright/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
            <button
              ref={botonMenuRef}
              type="button"
              onClick={() => setDrawerAbierto(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={drawerAbierto}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:hidden"
            >
              <IconoHamburguesa className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-sm font-bold text-on-surface sm:text-base">
                {usuario ? ETIQUETA_MODULO[usuario.rol] : 'Cafetería ITSH'}
              </p>
              <p className="hidden truncate text-xs text-on-surface-variant sm:block">
                Sistema de pedidos anticipados
              </p>
            </div>

            <div className="flex items-center gap-2">
              {acciones}
              {usuario && (
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container lg:hidden"
                  aria-label={usuario.nombre}
                >
                  {iniciales(usuario.nombre)}
                </span>
              )}
            </div>
          </div>
        </header>

        <main
          className={cn(
            'mx-auto max-w-6xl p-4 sm:p-6',
            barraInferior.length > 0 && 'pb-24 lg:pb-6',
          )}
        >
          <Outlet />
        </main>
      </div>

      <DrawerLateral
        abierto={drawerAbierto}
        onCerrar={cerrarDrawer}
        enlaces={enlaces}
        usuario={usuario}
        onSalir={salir}
      />
      <BarraInferior enlaces={barraInferior} />
    </div>
  );
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { ETIQUETA_MODULO } from '../lib/roles';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface Enlace {
  to: string;
  etiqueta: string;
}

interface Props {
  enlaces?: Enlace[];
}

export function LayoutModulo({ enlaces = [] }: Props) {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  async function salir() {
    await cerrarSesion();
    navegar('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-3">
          <span className="font-semibold text-slate-900">
            Cafetería ITSH · {usuario ? ETIQUETA_MODULO[usuario.rol] : ''}
          </span>
          <nav className="flex flex-1 gap-4">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.to}
                to={enlace.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium',
                    isActive ? 'text-slate-900 underline' : 'text-slate-500 hover:text-slate-700',
                  )
                }
              >
                {enlace.etiqueta}
              </NavLink>
            ))}
          </nav>
          <span className="text-sm text-slate-600">{usuario?.nombre}</span>
          <Button variante="secondary" onClick={salir}>
            Salir
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  );
}

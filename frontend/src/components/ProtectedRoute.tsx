import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { Rol } from '../lib/roles';

interface Props {
  children: ReactNode;
  roles?: Rol[];
}

export function ProtectedRoute({ children, roles }: Props) {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) {
    return <p className="p-8 text-center text-slate-500">Cargando…</p>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return (
      <p className="p-8 text-center text-red-600" role="alert">
        Acceso denegado
      </p>
    );
  }

  return <>{children}</>;
}

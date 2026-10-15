import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { RUTA_POR_ROL } from '../lib/roles';

export function Inicio() {
  const { usuario, cargando } = useAuth();
  if (cargando || !usuario) return null;
  return <Navigate to={RUTA_POR_ROL[usuario.rol]} replace />;
}

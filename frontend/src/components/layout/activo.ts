import type { Location } from 'react-router-dom';
import type { EnlaceNavegacion } from './tipos';

export function enlaceActivo(enlace: EnlaceNavegacion, ubicacion: Location): boolean {
  if (enlace.query !== undefined) {
    const parametros = new URLSearchParams(ubicacion.search);
    const entradas = Object.entries(enlace.query);
    if (entradas.length === 0) {
      if (ubicacion.search !== '' && ubicacion.search !== '?') {
        return false;
      }
    } else if (!entradas.every(([clave, valor]) => parametros.get(clave) === valor)) {
      return false;
    }
  }

  if (enlace.end) {
    return ubicacion.pathname === enlace.to;
  }
  return (
    ubicacion.pathname === enlace.to || ubicacion.pathname.startsWith(`${enlace.to}/`)
  );
}

export function destinoEnlace(enlace: EnlaceNavegacion) {
  if (!enlace.query) {
    return enlace.to;
  }
  const parametros = new URLSearchParams(enlace.query);
  const cadena = parametros.toString();
  return cadena ? `${enlace.to}?${cadena}` : enlace.to;
}

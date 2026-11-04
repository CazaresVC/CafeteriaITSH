import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MenuItem } from './menu';

const CLAVE_ALMACENAMIENTO = 'cafe-itsh-carrito';

type Cantidades = Record<number, number>;

interface CarritoContexto {
  cantidades: Cantidades;
  totalCantidad: number;
  obtener: (platilloId: number) => number;
  cambiar: (platilloId: number, delta: number) => void;
  limpiar: () => void;
  sincronizar: (items: MenuItem[]) => void;
}

const Contexto = createContext<CarritoContexto | null>(null);

function leerAlmacenamiento(): Cantidades {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const crudo = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (!crudo) {
      return {};
    }
    const datos = JSON.parse(crudo) as Record<string, unknown>;
    const cantidades: Cantidades = {};
    for (const [clave, valor] of Object.entries(datos)) {
      const id = Number(clave);
      const cantidad = Number(valor);
      if (Number.isInteger(id) && Number.isFinite(cantidad) && cantidad > 0) {
        cantidades[id] = Math.min(99, Math.floor(cantidad));
      }
    }
    return cantidades;
  } catch {
    return {};
  }
}

function mismasCantidades(a: Cantidades, b: Cantidades): boolean {
  const clavesA = Object.keys(a);
  const clavesB = Object.keys(b);
  if (clavesA.length !== clavesB.length) {
    return false;
  }
  return clavesA.every((clave) => a[Number(clave)] === b[Number(clave)]);
}

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [cantidades, setCantidades] = useState<Cantidades>(leerAlmacenamiento);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(cantidades));
    } catch {
      return;
    }
  }, [cantidades]);

  const cambiar = useCallback((platilloId: number, delta: number) => {
    setCantidades((actual) => {
      const siguiente = Math.min(99, Math.max(0, (actual[platilloId] ?? 0) + delta));
      if (siguiente === (actual[platilloId] ?? 0)) {
        return actual;
      }
      const copia = { ...actual };
      if (siguiente === 0) {
        delete copia[platilloId];
      } else {
        copia[platilloId] = siguiente;
      }
      return copia;
    });
  }, []);

  const limpiar = useCallback(() => {
    setCantidades({});
  }, []);

  const sincronizar = useCallback((items: MenuItem[]) => {
    const disponibles = new Set(
      items.filter((item) => item.disponible).map((item) => item.platilloId),
    );
    setCantidades((actual) => {
      const siguiente: Cantidades = {};
      for (const [clave, cantidad] of Object.entries(actual)) {
        const id = Number(clave);
        if (disponibles.has(id) && cantidad > 0) {
          siguiente[id] = cantidad;
        }
      }
      return mismasCantidades(actual, siguiente) ? actual : siguiente;
    });
  }, []);

  const valor = useMemo<CarritoContexto>(() => {
    const totalCantidad = Object.values(cantidades).reduce((suma, cantidad) => suma + cantidad, 0);
    return {
      cantidades,
      totalCantidad,
      obtener: (platilloId) => cantidades[platilloId] ?? 0,
      cambiar,
      limpiar,
      sincronizar,
    };
  }, [cantidades, cambiar, limpiar, sincronizar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrito(): CarritoContexto {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de un CarritoProvider');
  }
  return contexto;
}

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Usuario } from './roles';

interface AuthContexto {
  usuario: Usuario | null;
  cargando: boolean;
  refrescar: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const Contexto = createContext<AuthContexto | null>(null);

async function obtenerSesion(): Promise<Usuario | null> {
  try {
    const { data } = await api.get<Usuario>('/auth/me');
    return data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['sesion'],
    queryFn: obtenerSesion,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const valor = useMemo<AuthContexto>(
    () => ({
      usuario: data ?? null,
      cargando: isLoading,
      refrescar: async () => {
        await queryClient.invalidateQueries({ queryKey: ['sesion'] });
      },
      cerrarSesion: async () => {
        await api.post('/auth/logout');
        queryClient.setQueryData(['sesion'], null);
      },
    }),
    [data, isLoading, queryClient],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): AuthContexto {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return contexto;
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface Notificacion {
  id: number;
  pedidoId: number;
  numero: string;
  tipo: string;
  canal: string;
  estadoEnvio: string;
  fecha: string;
  vista: boolean;
  detalleError: string | null;
}

export const CLAVE_NOTIFICACIONES = ['notificaciones', 'mias'] as const;

export function useNotificaciones() {
  return useQuery({
    queryKey: CLAVE_NOTIFICACIONES,
    queryFn: async () => (await api.get<Notificacion[]>('/notificaciones/mias')).data,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}

export function useMarcarVista() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (await api.patch<Notificacion>(`/notificaciones/${id}/vista`)).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CLAVE_NOTIFICACIONES });
    },
  });
}
